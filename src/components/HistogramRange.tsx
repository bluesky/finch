import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { computeHistogram, cumulativeCounts, valueToPercentile } from '@/utils/histogramUtils';

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
    /** Bin centers in data units, same length as `counts`. Defaults to bin indices. */
    binCenters?: number[];
    /** Raw values, binned internally when `counts` is omitted. */
    values?: ArrayLike<number>;
    /** Bin count used when binning `values`. Defaults to `256`. Ignored when `counts` is given. */
    bins?: number;
    /** Data domain as `[min, max]`. Defaults to the extent of the data. */
    domain?: [number, number];
    /** Selected range in data units. Supplying this makes the component controlled. `null` selects the full domain. */
    value?: [number, number] | null;
    /** Initial selection for uncontrolled use. Defaults to the full domain. */
    defaultValue?: [number, number] | null;
    /**
     * Fired continuously while dragging, throttled to one call per animation frame.
     * The second argument is the same selection expressed as percentiles (0–100) of
     * the total counts, so a companion percentile control can stay in sync without a
     * server round-trip.
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
    /** Minimum separation between the two handles, in bins. Defaults to `1`. */
    minBinSeparation?: number;
    /**
     * Fixed dimensions. Defaults to `'full'`, which fills the parent — note that
     * `h-full` resolves to zero unless an ancestor has a real height, so either give
     * the parent a height or pass an explicit size.
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
 * An interactive histogram with a draggable range selection.
 *
 * Renders a binned distribution as a single stretched SVG path and overlays two
 * handles that select a sub-range. Either handle can be dragged, or the band
 * between them can be dragged to pan the window while preserving its width.
 *
 * Accepts either pre-binned `counts` (with optional `binCenters`) or raw `values`,
 * which are binned internally. The selection is reported in data units, with
 * percentiles of the distribution supplied alongside so a companion percentile
 * control can be kept in sync.
 *
 * This is a presentational component: it never fetches its own data. For the
 * simple PV-driven spectrum display, see `Histogram` instead.
 */
export default function HistogramRange({
    counts: countsProp,
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
    size = 'full',
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
    const n = counts.length;
    const lastIdx = Math.max(0, n - 1);

    const binCenters = useMemo(() => {
        if (binCentersProp && binCentersProp.length === n) return binCentersProp;
        if (binned) return binned.binCenters;
        if (domain && n > 1) {
            const [lo, hi] = domain;
            const step = (hi - lo) / n;
            return Array.from({ length: n }, (_, i) => lo + (i + 0.5) * step);
        }
        return Array.from({ length: n }, (_, i) => i);
    }, [binCentersProp, binned, domain, n]);

    const domainMin = binCenters[0] ?? 0;
    const domainMax = binCenters[lastIdx] ?? 1;

    const { cumulative, total } = useMemo(() => cumulativeCounts(counts), [counts]);

    const valueToIdx = useCallback(
        (v: number) => {
            if (lastIdx === 0) return 0;
            const span = domainMax - domainMin;
            const t = span === 0 ? 0 : (v - domainMin) / span;
            return Math.max(0, Math.min(lastIdx, Math.round(t * lastIdx)));
        },
        [domainMin, domainMax, lastIdx],
    );

    const idxToValue = useCallback(
        (i: number) => binCenters[Math.max(0, Math.min(lastIdx, i))] ?? 0,
        [binCenters, lastIdx],
    );

    // Selection lives in bin-index space: the drag math stays exact and stays
    // independent of how the bins are spaced in data units.
    const toIndices = useCallback(
        (range: [number, number] | null | undefined): [number, number] => {
            if (!range) return [0, lastIdx];
            return [valueToIdx(range[0]), valueToIdx(range[1])];
        },
        [lastIdx, valueToIdx],
    );

    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<[number, number]>(() => toIndices(defaultValue));
    const selection = isControlled ? toIndices(value) : internal;
    const [loIdx, hiIdx] = selection;

    const percentilesFor = useCallback(
        (lo: number, hi: number): [number, number] => [
            valueToPercentile(idxToValue(lo), binCenters, cumulative, total),
            valueToPercentile(idxToValue(hi), binCenters, cumulative, total),
        ],
        [binCenters, cumulative, total, idxToValue],
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

    /** Bars, coalesced into contiguous faded and normal runs so the SVG holds two paths, not one per bin. */
    const segments = useMemo(() => {
        if (n === 0) return [];
        const scale = (c: number) => (logCounts ? Math.log1p(Math.max(0, c)) : Math.max(0, c));
        let max = 0;
        for (const c of counts) max = Math.max(max, scale(c));
        if (max <= 0) max = 1;

        const runs: { faded: boolean; points: string[] }[] = [];
        for (let i = 0; i < n; i += 1) {
            const faded = fadeOutsideSelection && (i < loIdx || i > hiIdx);
            let run = runs[runs.length - 1];
            if (!run || run.faded !== faded) {
                run = { faded, points: [] };
                runs.push(run);
            }
            const h = (scale(counts[i]) / max) * THICKNESS;
            if (isHorizontal) {
                run.points.push(`M${i},${THICKNESS} L${i},${THICKNESS - h}`);
            } else {
                const row = lastIdx - i;
                run.points.push(`M${THICKNESS},${row} L${THICKNESS - h},${row}`);
            }
        }
        return runs.map((run) => ({ faded: run.faded, d: run.points.join(' ') }));
    }, [counts, n, logCounts, fadeOutsideSelection, loIdx, hiIdx, isHorizontal, lastIdx]);

    const trackRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ target: DragTarget; startIdx: number; lo: number; hi: number } | null>(
        null,
    );

    const pointerToIdx = useCallback(
        (clientX: number, clientY: number) => {
            const el = trackRef.current;
            if (!el || lastIdx === 0) return 0;
            const rect = el.getBoundingClientRect();
            const t = isHorizontal
                ? (clientX - rect.left) / (rect.width || 1)
                : 1 - (clientY - rect.top) / (rect.height || 1);
            return Math.max(0, Math.min(lastIdx, Math.round(t * lastIdx)));
        },
        [isHorizontal, lastIdx],
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
                lo = Math.max(0, Math.min(lastIdx - width, lo));
                emit(lo, lo + width);
                return;
            }
            if (drag.target === 'lo') {
                emit(Math.max(0, Math.min(idx, drag.hi - gap)), drag.hi);
                return;
            }
            emit(drag.lo, Math.min(lastIdx, Math.max(idx, drag.lo + gap)));
        },
        [pointerToIdx, minBinSeparation, lastIdx, emit],
    );

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (readOnly || lastIdx === 0) return;
        const idx = pointerToIdx(event.clientX, event.clientY);
        const dLo = Math.abs(idx - loIdx);
        const dHi = Math.abs(idx - hiIdx);
        // Pan the whole window when the press lands inside the band and clear of
        // both handles — but only when the band has somewhere to go. A selection
        // covering the full domain is pinned, so treating a press as a band drag
        // there would swallow it and leave the handles unreachable.
        const canPan = hiIdx - loIdx < lastIdx;
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
        // Flush any frame still queued so the committed value is never stale.
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        const next = pendingRef.current;
        if (next && onChange) {
            onChange([idxToValue(next[0]), idxToValue(next[1])], percentilesFor(...next));
        }
        pendingRef.current = null;
        const [lo, hi] = next ?? selection;
        commit(lo, hi);
    };

    const handleKeyDown = (which: 'lo' | 'hi') => (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (readOnly || lastIdx === 0) return;
        const step = event.shiftKey ? 10 : 1;
        let delta = 0;
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') delta = step;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') delta = -step;
        else if (event.key === 'Home') delta = -lastIdx;
        else if (event.key === 'End') delta = lastIdx;
        else return;

        event.preventDefault();
        const gap = Math.max(0, minBinSeparation);
        let lo = loIdx;
        let hi = hiIdx;
        if (which === 'lo') lo = Math.max(0, Math.min(loIdx + delta, hiIdx - gap));
        else hi = Math.min(lastIdx, Math.max(hiIdx + delta, loIdx + gap));
        if (lo === loIdx && hi === hiIdx) return;
        emit(lo, hi);
        commit(lo, hi);
    };

    const fraction = (idx: number) => (lastIdx === 0 ? 0 : (idx / lastIdx) * 100);

    const handleStyle = (idx: number): React.CSSProperties =>
        isHorizontal
            ? { left: `${fraction(idx)}%`, transform: 'translateX(-50%)' }
            : { bottom: `${fraction(idx)}%`, transform: 'translateY(50%)' };

    const sizeClass = (isHorizontal ? SIZE_CLASS_MAP : SIZE_CLASS_MAP_VERTICAL)[size];

    // viewBox extents must never be zero, or the SVG collapses.
    const viewBoxSpan = Math.max(1, lastIdx);

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
                            y={isHorizontal ? 0 : lastIdx - hiIdx}
                            width={isHorizontal ? Math.max(0, hiIdx - loIdx) : THICKNESS}
                            height={isHorizontal ? THICKNESS : Math.max(0, hiIdx - loIdx)}
                        />
                    )}
                    {segments.map((segment, i) => (
                        <path
                            key={i}
                            d={segment.d}
                            fill="none"
                            strokeWidth={1}
                            vectorEffect="non-scaling-stroke"
                            className={segment.faded ? 'stroke-slate-300' : 'stroke-slate-500'}
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
