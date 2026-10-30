import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
    computeHistogram,
    cumulativeCounts,
    edgesFromCenters,
    percentileBelowEdge,
} from '@/utils/histogramUtils';

/** Cross-axis extent of the SVG viewBox. Arbitrary — the SVG is stretched to the container. */
const THICKNESS = 44;

/** Minimum gap, in bins, between the pointer and a handle before a press counts as a band drag. */
const BAND_GRAB_MARGIN = 2;

/** Shared empty fallback, so "no data" keeps a stable reference across renders. */
const EMPTY_COUNTS: number[] = [];

const SIZE_CLASS_MAP = {
    small: 'w-48 h-24',
    medium: 'w-80 h-32',
    large: 'w-[32rem] h-40',
    full: 'w-full h-full min-w-32 min-h-16',
} as const;

const SIZE_CLASS_MAP_VERTICAL = {
    small: 'w-24 h-48',
    medium: 'w-32 h-80',
    large: 'w-40 h-[32rem]',
    full: 'w-full h-full min-w-16 min-h-32',
} as const;

export type HistogramRangeProps = Omit<
    React.ComponentPropsWithoutRef<'div'>,
    'onChange' | 'defaultValue' | 'title'
> & {
    /** Pre-binned counts, one entry per bin. Takes precedence over `values`. */
    counts?: number[];
    /**
     * Bin boundaries in data units, length `counts.length + 1`. Bin `i` spans
     * `binEdges[i]` to `binEdges[i + 1]`. These govern the selectable range and the
     * values reported by `onChange`. Bins may be irregularly spaced. When omitted,
     * edges are derived from `binCenters`, then from `domain`, then from bin indices.
     */
    binEdges?: number[];
    /**
     * Bin centers in data units, same length as `counts`. Only used to derive
     * `binEdges` when those are not supplied: interior edges are the midpoints
     * between neighbouring centers and the outer edges extend half a bin beyond
     * the first and last center, so irregular spacing is preserved.
     */
    binCenters?: number[];
    /**
     * Raw values, binned internally when `counts` is omitted. Re-binned whenever the
     * array identity changes, which scans the whole array; memoize it, or pre-bin
     * with `computeHistogram` and pass `counts` + `binEdges`, when the parent
     * re-renders often.
     */
    values?: ArrayLike<number>;
    /** Bin count used when binning `values`. Defaults to `256`. Ignored when `counts` is given. */
    bins?: number;
    /** Data domain as `[min, max]`. Defaults to the extent of the data. */
    domain?: [number, number];
    /**
     * Selected range in data units, as `[min, max]` thresholds. Supplying this makes
     * the component controlled. `null` selects the full domain.
     *
     * `min` is the left edge of the first included bin and `max` is the right edge
     * of the last included bin, so the selection covers every sample in
     * `[min, max)`. Incoming values that fall between edges snap to the nearest edge.
     */
    value?: [number, number] | null;
    /** Initial selection for uncontrolled use, with the same semantics as `value`. Defaults to the full domain. */
    defaultValue?: [number, number] | null;
    /**
     * Fired continuously while dragging, throttled to one call per animation frame.
     *
     * The first argument is `[min, max]` in data units: the left edge of the first
     * included bin and the right edge of the last included bin. The second is the
     * percentage (0–100) of the total population lying below each of those edges,
     * so a companion percentile control can stay in sync without a server round-trip.
     */
    onChange?: (range: [number, number], percentiles: [number, number]) => void;
    /** Fired once when a drag or keyboard adjustment finishes, with the same arguments as `onChange`. */
    onChangeCommitted?: (range: [number, number], percentiles: [number, number]) => void;
    /** Log-scale the count axis, so sparse tails stay visible next to a tall peak. Defaults to `true`. */
    logCounts?: boolean;
    /** Layout direction. `'vertical'` puts low values at the bottom. Defaults to `'horizontal'`. */
    orientation?: 'horizontal' | 'vertical';
    /** Hide the handles and render a read-only distribution. Defaults to `false`. */
    readOnly?: boolean;
    /** Draw bins outside the selection in a lighter color. Defaults to `true`. */
    fadeOutsideSelection?: boolean;
    /** Minimum number of bins the selection must cover. Defaults to `1`. */
    minBinSeparation?: number;
    /**
     * Fixed dimensions. Defaults to `'medium'`. `'full'` fills the parent — note that
     * `h-full` resolves to zero unless an ancestor has a real height, so give the
     * parent a height when using it.
     */
    size?: 'small' | 'medium' | 'large' | 'full';
    /** Optional heading rendered above the plot. */
    title?: string;
    /** Accessible name for the range group. Defaults to `'Histogram range'`. */
    ariaLabel?: string;
    /** Additional CSS classes applied to the root element. */
    className?: string;
    /** Additional CSS classes applied to the plot area that holds the SVG and handles. */
    classNamePlot?: string;
    /** Additional CSS classes applied to both drag handles. */
    classNameHandle?: string;
    /** Additional CSS classes applied to the selected-range highlight. */
    classNameSelection?: string;
    /** Additional CSS classes applied to the title element. */
    classNameTitle?: string;
};

type DragTarget = 'lo' | 'hi' | 'band';

/**
 * Index of the edge nearest to `v`, by binary search, so irregular spacing works.
 *
 * When `v` sits exactly halfway between two edges it rounds to the upper one.
 * That tie-break exists only to make mapping an arbitrary incoming value back into
 * edge-index space deterministic — a controlled parent that feeds back a
 * bin-center value then always lands on the same edge instead of oscillating. It
 * does not define which edge a threshold means; see the `value` prop for that.
 */
function nearestEdgeIndex(edges: number[], v: number): number {
    const last = edges.length - 1;
    if (last <= 0) return 0;
    if (!(v > edges[0])) return 0;
    if (v >= edges[last]) return last;
    // First index whose edge is >= v.
    let lo = 0;
    let hi = last;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (edges[mid] < v) lo = mid + 1;
        else hi = mid;
    }
    const below = edges[lo - 1];
    const above = edges[lo];
    return v - below < above - v ? lo - 1 : lo;
}

/**
 * An interactive histogram with a draggable range selection.
 *
 * Renders a binned distribution as filled bars and overlays two handles that
 * select a sub-range. Either handle can be dragged, or the band between them can
 * be dragged to pan the window while preserving its width.
 *
 * Handles sit on bin edges. Bin `i` is bounded by `edges[i]` and `edges[i + 1]`.
 * The lower handle is the left edge of the first included bin and the upper handle
 * is the right edge of the last included bin, so a selection between edge indices
 * `lo` and `hi` covers bins `lo .. hi - 1` and reports `[edges[lo], edges[hi]]`.
 * For example, with edges `[0, 1, 2, 3, 4]`, selecting bins 1 and 2 reports
 * `[1, 3]`. The full selection therefore spans the whole data domain.
 *
 * Accepts either pre-binned `counts` (with optional `binEdges` or `binCenters`) or
 * raw `values`, which are binned internally. The component is agnostic to the data
 * type and to where the histogram was computed. The selection is reported in data
 * units, with the population percentile below each edge supplied alongside.
 *
 * This is a presentational component: it never fetches its own data. For the
 * simple PV-driven spectrum display, see `Histogram` instead.
 */
export default function HistogramRange({
    counts: countsProp,
    binEdges: binEdgesProp,
    binCenters: binCentersProp,
    values,
    bins = 256,
    domain,
    value,
    defaultValue,
    onChange,
    onChangeCommitted,
    logCounts = true,
    orientation = 'horizontal',
    readOnly = false,
    fadeOutsideSelection = true,
    minBinSeparation = 1,
    size = 'medium',
    title,
    ariaLabel = 'Histogram range',
    className,
    classNamePlot,
    classNameHandle,
    classNameSelection,
    classNameTitle,
    ...props
}: HistogramRangeProps) {
    const isHorizontal = orientation === 'horizontal';

    // Bin the raw values only when no pre-binned counts were supplied.
    const binned = useMemo(() => {
        if (countsProp) return null;
        if (!values) return null;
        return computeHistogram(values, { bins, domain });
    }, [countsProp, values, bins, domain]);

    // Memoized so the empty-array fallback keeps a stable identity and the
    // derived memos below are not invalidated on every render.
    const counts = useMemo(
        () => countsProp ?? binned?.counts ?? EMPTY_COUNTS,
        [countsProp, binned],
    );
    /** Number of bins. Handles take edge indices `0..n`. */
    const n = counts.length;

    const edges = useMemo(() => {
        if (n === 0) return [];
        if (binEdgesProp && binEdgesProp.length === n + 1) return binEdgesProp;
        if (binned) return binned.binEdges;
        if (binCentersProp && binCentersProp.length === n) return edgesFromCenters(binCentersProp);
        if (domain) {
            const [lo, hi] = domain;
            const step = (hi - lo) / n;
            return Array.from({ length: n + 1 }, (_, i) => lo + i * step);
        }
        return Array.from({ length: n + 1 }, (_, i) => i);
    }, [binEdgesProp, binned, binCentersProp, domain, n]);

    const domainMin = edges[0] ?? 0;
    const domainMax = edges[n] ?? 1;

    const { cumulative, total } = useMemo(() => cumulativeCounts(counts), [counts]);

    const valueToIdx = useCallback((v: number) => nearestEdgeIndex(edges, v), [edges]);

    const idxToValue = useCallback(
        (i: number) => edges[Math.max(0, Math.min(n, i))] ?? 0,
        [edges, n],
    );

    // Selection lives in edge-index space: the drag math stays exact and stays
    // independent of how the bins are spaced in data units.
    const toIndices = useCallback(
        (range: [number, number] | null | undefined): [number, number] => {
            if (!range) return [0, n];
            return [valueToIdx(range[0]), valueToIdx(range[1])];
        },
        [n, valueToIdx],
    );

    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<[number, number]>(() => toIndices(defaultValue));
    const selection = isControlled ? toIndices(value) : internal;
    const [loIdx, hiIdx] = selection;

    const percentilesFor = useCallback(
        (lo: number, hi: number): [number, number] => [
            percentileBelowEdge(lo, cumulative, total),
            percentileBelowEdge(hi, cumulative, total),
        ],
        [cumulative, total],
    );

    // Coalesce one call per animation frame: a pointermove burst collapses into a
    // single onChange instead of one per event.
    const rafRef = useRef<number | null>(null);
    const pendingRef = useRef<[number, number] | null>(null);
    useEffect(
        () => () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        },
        [],
    );

    const emit = useCallback(
        (lo: number, hi: number) => {
            if (!isControlled) setInternal([lo, hi]);
            // Recorded even without an `onChange` listener, so that the value
            // committed on pointer-up is the dragged one rather than the
            // selection captured when this handler was created.
            pendingRef.current = [lo, hi];
            if (!onChange) return;
            if (rafRef.current !== null) return;
            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                const next = pendingRef.current;
                if (!next) return;
                onChange([idxToValue(next[0]), idxToValue(next[1])], percentilesFor(...next));
            });
        },
        [isControlled, onChange, idxToValue, percentilesFor],
    );

    const commit = useCallback(
        (lo: number, hi: number) => {
            onChangeCommitted?.([idxToValue(lo), idxToValue(hi)], percentilesFor(lo, hi));
        },
        [onChangeCommitted, idxToValue, percentilesFor],
    );

    /**
     * Bars as filled one-bin-wide rectangles, coalesced into contiguous faded and
     * normal runs so the SVG holds a couple of paths rather than one per bin.
     * Filling (rather than stroking a hairline) keeps the bars solid at any bin
     * count and any rendered width.
     */
    const segments = useMemo(() => {
        if (n === 0) return [];
        const scale = (c: number) => (logCounts ? Math.log1p(Math.max(0, c)) : Math.max(0, c));
        let max = 0;
        for (const c of counts) max = Math.max(max, scale(c));
        if (max <= 0) max = 1;

        const runs: { faded: boolean; points: string[] }[] = [];
        for (let i = 0; i < n; i += 1) {
            const faded = fadeOutsideSelection && (i < loIdx || i >= hiIdx);
            let run = runs[runs.length - 1];
            if (!run || run.faded !== faded) {
                run = { faded, points: [] };
                runs.push(run);
            }
            const h = (scale(counts[i]) / max) * THICKNESS;
            if (h <= 0) continue;
            if (isHorizontal) {
                run.points.push(`M${i},${THICKNESS}h1v${-h}h-1z`);
            } else {
                const row = n - 1 - i;
                run.points.push(`M${THICKNESS},${row}v1h${-h}v-1z`);
            }
        }
        return runs.map((run) => ({ faded: run.faded, d: run.points.join('') }));
    }, [counts, n, logCounts, fadeOutsideSelection, loIdx, hiIdx, isHorizontal]);

    const trackRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ target: DragTarget; startIdx: number; lo: number; hi: number } | null>(
        null,
    );

    const pointerToIdx = useCallback(
        (clientX: number, clientY: number) => {
            const el = trackRef.current;
            if (!el || n === 0) return 0;
            const rect = el.getBoundingClientRect();
            const t = isHorizontal
                ? (clientX - rect.left) / (rect.width || 1)
                : 1 - (clientY - rect.top) / (rect.height || 1);
            return Math.max(0, Math.min(n, Math.round(t * n)));
        },
        [isHorizontal, n],
    );

    const applyDrag = useCallback(
        (clientX: number, clientY: number) => {
            const drag = dragRef.current;
            if (!drag) return;
            const idx = pointerToIdx(clientX, clientY);
            const gap = Math.max(0, minBinSeparation);

            if (drag.target === 'band') {
                const width = drag.hi - drag.lo;
                let lo = drag.lo + (idx - drag.startIdx);
                lo = Math.max(0, Math.min(n - width, lo));
                emit(lo, lo + width);
                return;
            }
            if (drag.target === 'lo') {
                emit(Math.max(0, Math.min(idx, drag.hi - gap)), drag.hi);
                return;
            }
            emit(drag.lo, Math.min(n, Math.max(idx, drag.lo + gap)));
        },
        [pointerToIdx, minBinSeparation, n, emit],
    );

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (readOnly || n === 0) return;
        const idx = pointerToIdx(event.clientX, event.clientY);
        const dLo = Math.abs(idx - loIdx);
        const dHi = Math.abs(idx - hiIdx);
        // Pan the whole window when the press lands inside the band and clear of
        // both handles — but only when the band has somewhere to go. A selection
        // covering the full domain is pinned, so treating a press as a band drag
        // there would swallow it and leave the handles unreachable.
        const canPan = hiIdx - loIdx < n;
        const insideBand = idx > loIdx && idx < hiIdx;
        const clearOfHandles = Math.min(dLo, dHi) > BAND_GRAB_MARGIN;

        let target: DragTarget;
        if (canPan && insideBand && clearOfHandles) target = 'band';
        else if (dLo <= dHi) target = 'lo';
        else target = 'hi';

        dragRef.current = { target, startIdx: idx, lo: loIdx, hi: hiIdx };
        event.currentTarget.setPointerCapture(event.pointerId);
        applyDrag(event.clientX, event.clientY);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        applyDrag(event.clientX, event.clientY);
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        dragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        // Flush a frame still queued so the committed value is never stale. A
        // frame that already ran has reported the latest value, so it is not
        // re-sent.
        const next = pendingRef.current;
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            if (next && onChange) {
                onChange([idxToValue(next[0]), idxToValue(next[1])], percentilesFor(...next));
            }
        }
        pendingRef.current = null;
        const [lo, hi] = next ?? selection;
        commit(lo, hi);
    };

    const handleKeyDown = (which: 'lo' | 'hi') => (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (readOnly || n === 0) return;
        const step = event.shiftKey ? 10 : 1;
        let delta = 0;
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') delta = step;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') delta = -step;
        else if (event.key === 'Home') delta = -n;
        else if (event.key === 'End') delta = n;
        else return;

        event.preventDefault();
        const gap = Math.max(0, minBinSeparation);
        let lo = loIdx;
        let hi = hiIdx;
        if (which === 'lo') lo = Math.max(0, Math.min(loIdx + delta, hiIdx - gap));
        else hi = Math.min(n, Math.max(hiIdx + delta, loIdx + gap));
        if (lo === loIdx && hi === hiIdx) return;
        emit(lo, hi);
        commit(lo, hi);
    };

    const fraction = (idx: number) => (n === 0 ? 0 : (idx / n) * 100);

    const handleStyle = (idx: number): React.CSSProperties =>
        isHorizontal
            ? { left: `${fraction(idx)}%`, transform: 'translateX(-50%)' }
            : { bottom: `${fraction(idx)}%`, transform: 'translateY(50%)' };

    const sizeClass = (isHorizontal ? SIZE_CLASS_MAP : SIZE_CLASS_MAP_VERTICAL)[size];

    // viewBox extents must never be zero, or the SVG collapses.
    const viewBoxSpan = Math.max(1, n);

    return (
        <div className={cn('flex flex-col gap-1 text-slate-700', sizeClass, className)} {...props}>
            {title && (
                <h3 className={cn('text-xs font-light text-slate-600', classNameTitle)}>{title}</h3>
            )}
            <div
                ref={trackRef}
                role="group"
                aria-label={ariaLabel}
                className={cn(
                    'relative flex-1 select-none touch-none',
                    !readOnly && 'cursor-pointer',
                    classNamePlot,
                )}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
            >
                <svg
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full overflow-visible"
                    viewBox={
                        isHorizontal
                            ? `0 0 ${viewBoxSpan} ${THICKNESS}`
                            : `0 0 ${THICKNESS} ${viewBoxSpan}`
                    }
                    preserveAspectRatio="none"
                >
                    {n > 0 && (
                        <rect
                            className={cn('fill-sky-500/20', classNameSelection)}
                            x={isHorizontal ? loIdx : 0}
                            y={isHorizontal ? 0 : n - hiIdx}
                            width={isHorizontal ? Math.max(0, hiIdx - loIdx) : THICKNESS}
                            height={isHorizontal ? THICKNESS : Math.max(0, hiIdx - loIdx)}
                        />
                    )}
                    {segments.map((segment, i) => (
                        <path
                            key={i}
                            d={segment.d}
                            data-faded={segment.faded ? 'true' : 'false'}
                            className={segment.faded ? 'fill-slate-300' : 'fill-slate-500'}
                        />
                    ))}
                </svg>

                {!readOnly && n > 0 && (
                    <>
                        <div
                            role="slider"
                            tabIndex={0}
                            aria-label={`${ariaLabel} minimum`}
                            aria-valuemin={domainMin}
                            aria-valuemax={domainMax}
                            aria-valuenow={idxToValue(loIdx)}
                            aria-orientation={orientation}
                            onKeyDown={handleKeyDown('lo')}
                            style={handleStyle(loIdx)}
                            className={cn(
                                'absolute rounded-sm bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400',
                                isHorizontal ? 'top-0 h-full w-1' : 'left-0 h-1 w-full',
                                classNameHandle,
                            )}
                        />
                        <div
                            role="slider"
                            tabIndex={0}
                            aria-label={`${ariaLabel} maximum`}
                            aria-valuemin={domainMin}
                            aria-valuemax={domainMax}
                            aria-valuenow={idxToValue(hiIdx)}
                            aria-orientation={orientation}
                            onKeyDown={handleKeyDown('hi')}
                            style={handleStyle(hiIdx)}
                            className={cn(
                                'absolute rounded-sm bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400',
                                isHorizontal ? 'top-0 h-full w-1' : 'left-0 h-1 w-full',
                                classNameHandle,
                            )}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
