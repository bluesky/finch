import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear, scaleLog, scaleSymlog, type ScaleLinear } from 'd3-scale';

import { cn } from '@/lib/utils';
import { cumulativeCounts, percentileBelowEdge } from '@/utils/histogramUtils';

type Range = [number, number];

// The div's own `onChange`, `title`, `defaultValue`, `className` and (deprecated) `color`
// attributes are replaced by this component's props, so the docs show these props' descriptions.
/** Props for {@link HistogramRange}: a binned histogram, the selected range and how to draw it. */
export type HistogramRangeProps = Omit<
    React.ComponentPropsWithoutRef<'div'>,
    'onChange' | 'title' | 'defaultValue' | 'color' | 'className'
> & {
    /**
     * Number of observations per bin. Negative, NaN and infinite entries are treated as zero and
     * excluded from percentile calculations. Memoise the array for best performance
     */
    counts: number[];
    /**
     * Ascending bin boundaries in data units, with one more edge than counts. Uneven bin widths are
     * supported. Memoise the array for best performance
     */
    binEdges: number[];
    /**
     * Display scale of the value axis. `'log'` places bars, handles and ticks by log10 of the bin
     * edges, so bins whose lower edge is 0 or below are not drawn (an `≤0` marker shows how many).
     * They still count in the percentiles and can be selected with the keyboard. Thresholds are
     * always the supplied edges, in data units
     */
    valueScale?: 'linear' | 'log';
    /**
     * Controls the display scale of the bar heights ('linear' or 'log'), independently of
     * `valueScale`. Log scaling uses `log1p` to make low-count bins more visible without changing
     * the underlying data
     */
    countScale?: 'linear' | 'log';
    /**
     * Selected [min, max] thresholds in data units. Values are sorted, constrained to the histogram
     * boundaries, and snapped to the nearest bin edges. A selection always spans at least one bin:
     * equal bounds select the bin above (or below, at the top edge). `null` selects the full range
     */
    value: Range | null;
    /**
     * Called when the selection changes. Returns the selected bin edges and the percentage of observations
     * below each
     */
    onChange: (range: Range, percentiles: Range) => void;
    /** Called once when a drag or keyboard adjustment finishes, with the final range and percentiles */
    onChangeCommitted?: (range: Range, percentiles: Range) => void;
    /**
     * Optional reference range displayed as a shaded band behind the histogram.
     * Bounds are in data units and do not snap to bin edges
     */
    referenceRange?: Range | null;
    /**
     * Customizes the color of the reference range band, any CSS colour, drawn as a 25% tint
     * behind the bars
     */
    referenceColor?: string;
    /** Layout direction. `'vertical'` puts low values at the bottom */
    orientation?: 'horizontal' | 'vertical';
    /**
     * Controls the overall size of the histogram, including the plot and axes. `'full'` fills the
     * parent container, which must have a defined height
     */
    size?: 'small' | 'medium' | 'large' | 'full';
    /** The plot title */
    title?: string;
    /** Label for the value axis */
    valueAxisTitle?: string;
    /** Label for the count axis */
    countAxisTitle?: string;
    /**
     * Customizes the color of the histogram bars, selection area, and handles.
     * Accepts any CSS color
     */
    color?: string;
    /** Additional CSS classes applied to the root element */
    className?: string;
};

const SIZE_CLASS = {
    horizontal: {
        small: 'w-60 h-32',
        medium: 'w-96 h-44',
        large: 'w-[36rem] h-56',
        full: 'w-full h-full min-w-48 min-h-28',
    },
    vertical: {
        small: 'w-36 h-60',
        medium: 'w-44 h-96',
        large: 'w-56 h-[36rem]',
        full: 'w-full h-full min-w-28 min-h-48',
    },
} as const;
const VALUE_TICKS = { small: 3, medium: 5, large: 7, full: 6 } as const;
const COUNT_TICKS = { small: 3, medium: 4, large: 5, full: 4 } as const;

/** View-box units along each axis; the SVG is stretched over the plot area. */
const VB = 1000;
const EMPTY: number[] = [];

type Tick = { pos: number; label: string };

function formatValue(v: number): string {
    if (!Number.isFinite(v)) return String(v);
    const abs = Math.abs(v);
    if (abs !== 0 && (abs >= 1e5 || abs < 1e-3)) return v.toExponential(3);
    return String(Number(v.toPrecision(4)));
}

/**
 * Tick label formats shared by both axes, so a log count axis reads like a log value axis:
 * three significant digits on log axes (10, 100, 1e+3), four on linear ones
 * (so 1000 is not 1e+3). A precision in the specifier is kept as given by `tickFormat`.
 */
const formatLogTick = scaleLinear().tickFormat(1, '.3~g');

/**
 * Ticks for a linear axis, as plain numbers (12000, 0.05), switching to three significant
 * digits only from a million, where plain numbers get too long to read.
 */
function linearTicks(s: ScaleLinear<number, number>, tickCount: number): Tick[] {
    const [a, b] = s.domain();
    const fmt = s.tickFormat(tickCount, Math.max(Math.abs(a), Math.abs(b)) >= 1e6 ? '.3~g' : '~f');
    return s.ticks(tickCount).map((t) => ({ pos: s(t), label: fmt(t) }));
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/**
 * What the `≤0` marker on a log axis says. It names bins by their lower edge, not by their
 * values: a bin from 0 to 1 is not drawn although every value in it may be positive.
 */
function undrawnNote(bins: number, percent: number): string {
    const what = bins === 1 ? '1 bin' : `${bins} bins`;
    return `${what} with a lower edge of 0 or below (${percent.toFixed(1)}% of counts) cannot be placed on a log axis and ${bins === 1 ? 'is' : 'are'} not drawn`;
}

/**
 * Index of the position nearest to `p` in an ascending list. Exactly halfway rounds up, so a
 * controlled parent that feeds back an in-between value always lands on the same edge.
 */
function nearestIndex(positions: number[], p: number): number {
    const last = positions.length - 1;
    if (last <= 0 || !(p > positions[0])) return 0;
    if (p >= positions[last]) return last;
    let i = 1;
    while (positions[i] < p) i += 1;
    return p - positions[i - 1] < positions[i] - p ? i - 1 : i;
}

/**
 * The value axis: positions (0–1), tick labels in data units, and the key a value is snapped
 * by. Snapping compares data values (log10 under log) rather than positions, so an exact
 * halfway value is not tipped either way by floating-point error in the scale.
 */
function valueAxis(domain: Range, log: boolean, tickCount: number) {
    if (log) {
        const s = scaleLog().domain(domain).range([0, 1]);
        // Half as many labels as ticks: over several decades that labels the decades only, so
        // 1e+3 and 2e+3 never collide on a narrow axis; the minor ticks stay unlabelled.
        const fmt = s.tickFormat(Math.max(1, Math.round(tickCount / 2)), '.3~g');
        return {
            pos: (v: number) => (v > 0 ? s(v) : -Infinity),
            snapKey: (v: number) => (v > 0 ? Math.log10(v) : -Infinity),
            ticks: s.ticks(tickCount).map((t): Tick => ({ pos: s(t), label: fmt(t) })),
        };
    }
    const s = scaleLinear().domain(domain).range([0, 1]);
    return {
        pos: (v: number) => s(v),
        snapKey: (v: number) => v,
        ticks: linearTicks(s, tickCount),
    };
}

/**
 * Bar heights (0–1) and ticks for the count axis. Under log, ticks are drawn like a log value
 * axis: a labelled tick at each decade (thinned to about `tickCount` labels) with unlabelled
 * minor ticks at 2–9 times each decade, plus 0, which log1p can show.
 */
function countAxis(max: number, log: boolean, tickCount: number) {
    if (log) {
        // symlog with constant 1 is log1p for non-negative counts.
        const s = scaleSymlog().constant(1).domain([0, max]).range([0, 1]);
        const decades: number[] = [];
        for (let d = 1; d <= max; d *= 10) decades.push(d);
        const step = Math.max(1, Math.ceil(decades.length / tickCount));
        const ticks: Tick[] = [{ pos: 0, label: '0' }];
        decades.forEach((d, i) => {
            ticks.push({ pos: s(d), label: i % step === 0 ? formatLogTick(d) : '' });
            for (let m = 2; m <= 9 && d * m <= max; m += 1)
                ticks.push({ pos: s(d * m), label: '' });
        });
        return { height: (c: number) => s(c), ticks };
    }
    const s = scaleLinear().domain([0, max]).nice(tickCount).range([0, 1]);
    return {
        height: (c: number) => s(c),
        ticks: linearTicks(s, tickCount),
    };
}

type Drag = { kind: 'lo' | 'hi' | 'band'; t0: number; lo: number; hi: number };

/**
 * A histogram with a draggable range, for picking thresholds or display limits.
 *
 * Takes a binned histogram (`counts` + `binEdges`) and reports thresholds that are always
 * two of the supplied edges, unchanged, plus the percentage of the population below each.
 * With edges `[0, 1, 2, 3, 4]`, selecting bins 1 and 2 reports `[1, 3]`.
 *
 * Bars, handles and ticks are placed on a continuous value scale in data units, so irregular
 * bins are drawn at their true widths and `valueScale="log"` gives decade ticks. Neither
 * scale transforms data.
 *
 * Drag a handle to move one limit, drag the selected band to move both at fixed width, or
 * press the track to jump the nearest handle there. Arrow keys move a focused handle by one
 * bin, Shift by ten, Home/End to the ends. Controlled only: pass `value` and `onChange`.
 */
export default function HistogramRange({
    counts,
    binEdges,
    valueScale = 'linear',
    countScale = 'linear',
    value,
    onChange,
    onChangeCommitted,
    referenceRange,
    referenceColor = '#fbbf24',
    orientation = 'horizontal',
    size = 'medium',
    title,
    valueAxisTitle,
    countAxisTitle = 'Counts',
    color,
    className,
    ...props
}: HistogramRangeProps) {
    const isHorizontal = orientation === 'horizontal';

    // `[]` / `[]` is "no data yet"; any other length mismatch draws nothing and warns.
    const mismatch =
        binEdges.length !== counts.length + 1 && !(counts.length === 0 && binEdges.length === 0);
    const n = !mismatch && counts.length > 0 ? counts.length : 0;
    const edges = n > 0 ? binEdges : EMPTY;
    // A log axis starts at the first strictly positive edge; the bins before it
    // (left edge ≤ 0) are not drawn. It needs at least two positive edges to span a range.
    const firstPositive = valueScale === 'log' ? edges.findIndex((e) => e > 0) : 0;
    const useLog = valueScale === 'log' && n > 0 && firstPositive >= 0 && firstPositive < n;
    const firstDrawn = useLog ? firstPositive : 0;

    const warning = mismatch
        ? `binEdges has ${binEdges.length} entries; expected counts.length + 1 = ${counts.length + 1}. Nothing is drawn.`
        : valueScale === 'log' && n > 0 && !useLog
          ? 'valueScale="log" needs at least two strictly positive binEdges; drawing a linear value axis.'
          : null;
    const warned = useRef(new Set<string>());
    useEffect(() => {
        if (warning && !warned.current.has(warning)) {
            warned.current.add(warning);
            console.warn(`HistogramRange: ${warning}`);
        }
    }, [warning]);

    const values = useMemo(() => {
        const lo = n > 0 ? edges[firstDrawn] : 0;
        const hi = n > 0 ? edges[n] : 1;
        const axis = valueAxis(
            hi > lo ? [lo, hi] : [lo - 0.5, lo + 0.5],
            useLog,
            VALUE_TICKS[size],
        );
        return {
            ...axis,
            // Undrawn edges (≤ 0 on a log axis) sit at the start of the axis.
            edgePos: edges.map((e) => clamp(axis.pos(e), 0, 1)),
            edgeKeys: edges.map(axis.snapKey),
        };
    }, [edges, n, firstDrawn, useLog, size]);

    const cleanCounts = useMemo(
        () => counts.map((c) => (Number.isFinite(c) && c > 0 ? c : 0)),
        [counts],
    );
    // A loop rather than `Math.max(...counts)`, which overflows the call stack on large histograms.
    const maxCount = useMemo(() => cleanCounts.reduce((m, c) => (c > m ? c : m), 1), [cleanCounts]);
    // Vertical, the count axis runs along the narrow side: half as many ticks keeps its labels apart.
    const countTicks = isHorizontal ? COUNT_TICKS[size] : Math.ceil(COUNT_TICKS[size] / 2);
    const bars = useMemo(
        () => countAxis(maxCount, countScale === 'log', countTicks),
        [maxCount, countScale, countTicks],
    );
    const { cumulative, total } = useMemo(() => cumulativeCounts(cleanCounts), [cleanCounts]);
    // An empty population has no percentiles; report the share of bins instead, so a full
    // span is still [0, 100].
    const percentilesFor = (lo: number, hi: number): Range =>
        total > 0
            ? [
                  percentileBelowEdge(lo, cumulative, total),
                  percentileBelowEdge(hi, cumulative, total),
              ]
            : [(lo / n) * 100, (hi / n) * 100];

    // The selection is always derived from the controlled value: snapped, sorted, clamped. A
    // supplied edge keeps its own index, even one that shares the start of a log axis with others.
    const toIdx = (v: number) => {
        const exact = edges.indexOf(v);
        return exact >= 0 ? exact : nearestIndex(values.edgeKeys, values.snapKey(v));
    };
    let [loIdx, hiIdx] = value && n > 0 ? [toIdx(value[0]), toIdx(value[1])] : [0, n];
    if (loIdx > hiIdx) [loIdx, hiIdx] = [hiIdx, loIdx];
    // A selection spans at least one bin, so each handle keeps its own side.
    if (loIdx === hiIdx && n > 0) {
        if (hiIdx < n) hiIdx += 1;
        else loIdx -= 1;
    }

    // Edge indices from an earlier render, clamped to the current bins in case they shrank.
    const fit = (lo: number, hi: number): Range => [Math.min(lo, n - 1), Math.min(hi, n)];

    const lastEmitted = useRef<Range | null>(null);
    const emit = (lo: number, hi: number) => {
        const last = lastEmitted.current;
        if (last && last[0] === lo && last[1] === hi) return;
        lastEmitted.current = [lo, hi];
        onChange([edges[lo], edges[hi]], percentilesFor(lo, hi));
    };
    const commit = () => {
        const [lo, hi] = lastEmitted.current ? fit(...lastEmitted.current) : [loIdx, hiIdx];
        onChangeCommitted?.([edges[lo], edges[hi]], percentilesFor(lo, hi));
    };

    // Pointer: the pressed element (handle, band or bare track) decides the gesture.
    const plotRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<Drag | null>(null);
    const [dragKind, setDragKind] = useState<Drag['kind'] | null>(null);

    const fraction = (e: React.PointerEvent) => {
        const r = plotRef.current?.getBoundingClientRect();
        if (!r) return 0;
        const t = isHorizontal
            ? (e.clientX - r.left) / (r.width || 1)
            : 1 - (e.clientY - r.top) / (r.height || 1);
        return clamp(t, 0, 1);
    };

    // The edge under a pointer position. Undrawn edges (≤ 0 on a log axis) share the start of
    // the axis with the first drawn one and are never picked by the pointer.
    const pointerIdx = (t: number) => Math.max(firstDrawn, nearestIndex(values.edgePos, t));

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (n === 0 || e.button > 0) return;
        const t = fraction(e);
        const role = (e.target as Element).closest('[data-role]')?.getAttribute('data-role');
        let lo = loIdx;
        let hi = hiIdx;
        let kind: Drag['kind'];
        if (role === 'handle-lo') kind = 'lo';
        else if (role === 'handle-hi') kind = 'hi';
        else if (role === 'band') kind = 'band';
        else {
            // Bare track: the nearest handle jumps to the pointer, then follows it.
            const idx = pointerIdx(t);
            const nearerLo =
                Math.abs(t - values.edgePos[loIdx]) <= Math.abs(t - values.edgePos[hiIdx]);
            kind = nearerLo ? 'lo' : 'hi';
            if (nearerLo) lo = clamp(idx, 0, hiIdx - 1);
            else hi = clamp(idx, loIdx + 1, n);
        }
        dragRef.current = { kind, t0: t, lo, hi };
        lastEmitted.current = [loIdx, hiIdx];
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragKind(kind);
        emit(lo, hi);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const d = dragRef.current;
        if (!d || n === 0) return;
        const t = fraction(e);
        const { edgePos } = values;
        // The bins may have changed since the press (a live histogram); keep to the current ones.
        const [dLo, dHi] = fit(d.lo, d.hi);
        // Handles move by the pointer's offset since the press, so grabbing one off-centre
        // does not make it jump.
        if (d.kind === 'lo') {
            emit(clamp(pointerIdx(edgePos[dLo] + t - d.t0), 0, dHi - 1), dHi);
        } else if (d.kind === 'hi') {
            emit(dLo, clamp(pointerIdx(edgePos[dHi] + t - d.t0), dLo + 1, n));
        } else {
            const width = dHi - dLo;
            const shift = pointerIdx(t) - pointerIdx(d.t0);
            // A pan never moves the band into the undrawn bins, but keeps it there if it started there.
            const lo = clamp(dLo + shift, Math.min(dLo, firstDrawn), n - width);
            emit(lo, lo + width);
        }
    };

    const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        dragRef.current = null;
        setDragKind(null);
        if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        commit();
    };

    const handleKeyDown = (which: 'lo' | 'hi') => (e: React.KeyboardEvent<HTMLDivElement>) => {
        const step = e.shiftKey ? 10 : 1;
        const delta =
            e.key === 'ArrowRight' || e.key === 'ArrowUp'
                ? step
                : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
                  ? -step
                  : e.key === 'Home'
                    ? -n
                    : e.key === 'End'
                      ? n
                      : 0;
        if (delta === 0) return;
        e.preventDefault();
        const lo = which === 'lo' ? clamp(loIdx + delta, 0, hiIdx - 1) : loIdx;
        const hi = which === 'hi' ? clamp(hiIdx + delta, loIdx + 1, n) : hiIdx;
        if (lo === loIdx && hi === hiIdx) return;
        lastEmitted.current = [loIdx, hiIdx];
        emit(lo, hi);
        commit();
    };

    const pct = (f: number) => `${f * 100}%`;
    const span = (a: number, b: number): React.CSSProperties =>
        isHorizontal ? { left: pct(a), width: pct(b - a) } : { bottom: pct(a), height: pct(b - a) };
    const loPos = n > 0 ? values.edgePos[loIdx] : 0;
    const hiPos = n > 0 ? values.edgePos[hiIdx] : 1;
    const canPan = n > 0 && hiIdx - loIdx < n && hiIdx > loIdx;

    // Compared by value, so a new array with the same bounds does not redraw.
    const refLo = referenceRange?.[0];
    const refHi = referenceRange?.[1];
    const reference = useMemo(() => {
        if (refLo === undefined || refHi === undefined || n === 0) return null;
        const a = clamp(values.pos(refLo), 0, 1);
        const b = clamp(values.pos(refHi), 0, 1);
        return Number.isNaN(a) || Number.isNaN(b) ? null : [Math.min(a, b), Math.max(a, b)];
    }, [refLo, refHi, values, n]);

    // One closed staircase outline per run of faded or included bins, so adjacent bars
    // never show anti-aliasing seams. Bins before `firstDrawn` are not drawn.
    const runs = useMemo(() => {
        const out: { faded: boolean; d: string }[] = [];
        const at = (i: number) => values.edgePos[i] * VB;
        let i = firstDrawn;
        while (i < n) {
            const faded = i < loIdx || i >= hiIdx;
            let d = isHorizontal ? `M${at(i)},${VB}` : `M0,${VB - at(i)}`;
            while (i < n && (i < loIdx || i >= hiIdx) === faded) {
                const h = bars.height(cleanCounts[i]) * VB;
                d += isHorizontal ? ` V${VB - h} H${at(i + 1)}` : ` H${h} V${VB - at(i + 1)}`;
                i += 1;
            }
            d += isHorizontal ? ` V${VB} Z` : ' H0 Z';
            out.push({ faded, d });
        }
        return out;
    }, [n, firstDrawn, loIdx, hiIdx, values, bars, cleanCounts, isHorizontal]);

    // Resize cursors on the handles, the hand only on the band; during a drag the plot
    // holds the cursor, so it does not flicker as the pointer crosses other elements.
    const resizeCursor = isHorizontal ? 'cursor-col-resize' : 'cursor-row-resize';
    const plotCursor =
        dragKind === 'band' ? 'cursor-grabbing' : dragKind ? resizeCursor : undefined;

    const handle = (which: 'lo' | 'hi') => {
        const idx = which === 'lo' ? loIdx : hiIdx;
        return (
            <div
                key={which}
                data-role={`handle-${which}`}
                role="slider"
                tabIndex={0}
                aria-label={`Histogram range ${which === 'lo' ? 'minimum' : 'maximum'}`}
                aria-orientation={orientation}
                aria-valuemin={edges[0]}
                aria-valuemax={edges[n]}
                aria-valuenow={edges[idx]}
                aria-valuetext={formatValue(edges[idx])}
                onKeyDown={handleKeyDown(which)}
                className={cn(
                    'group absolute z-10 flex items-center justify-center outline-none',
                    isHorizontal
                        ? 'inset-y-0 w-3 -translate-x-1/2'
                        : 'inset-x-0 h-3 translate-y-1/2',
                    (!dragKind || dragKind === which) && resizeCursor,
                )}
                style={
                    isHorizontal
                        ? { left: pct(values.edgePos[idx]) }
                        : { bottom: pct(values.edgePos[idx]) }
                }
            >
                <span
                    className={cn(
                        'absolute bg-sky-600',
                        isHorizontal ? 'inset-y-0 w-0.5' : 'inset-x-0 h-0.5',
                    )}
                    style={color ? { backgroundColor: color } : undefined}
                />
                <span
                    className={cn(
                        'relative rounded-sm border border-white bg-sky-600 shadow group-focus-visible:ring-2 group-focus-visible:ring-sky-400',
                        isHorizontal ? 'h-4 w-2' : 'h-2 w-4',
                    )}
                    style={
                        color
                            ? ({
                                  backgroundColor: color,
                                  '--tw-ring-color': color,
                              } as React.CSSProperties)
                            : undefined
                    }
                />
            </div>
        );
    };

    const sideTicks = isHorizontal ? bars.ticks : values.ticks;
    const widestSideLabel = sideTicks.reduce(
        (w, t) => (t.label.length > w.length ? t.label : w),
        '',
    );
    const bottomTicks = isHorizontal ? values.ticks : bars.ticks;
    const sideTitle = isHorizontal ? countAxisTitle : valueAxisTitle;
    const bottomTitle = isHorizontal ? valueAxisTitle : countAxisTitle;

    return (
        <div
            className={cn(
                'flex flex-col gap-1 text-slate-700',
                SIZE_CLASS[orientation][size],
                className,
            )}
            {...props}
        >
            {title && <h3 className="text-xs font-medium text-slate-600">{title}</h3>}
            <div
                // Padding so the end tick labels, which straddle the plot corners, stay inside.
                className="grid min-h-0 flex-1 pr-4 pt-2"
                style={{
                    gridTemplateColumns: 'auto minmax(0, 1fr)',
                    gridTemplateRows: 'minmax(0, 1fr) auto',
                }}
            >
                {/* Side axis: counts (horizontal) or values (vertical), low at the bottom. */}
                <div className="flex min-h-0" data-testid="histogram-range-side-axis">
                    {sideTitle && (
                        <div className="flex items-center pr-0.5">
                            <span className="rotate-180 whitespace-nowrap text-xs text-slate-500 [writing-mode:vertical-rl]">
                                {sideTitle}
                            </span>
                        </div>
                    )}
                    <div className="relative">
                        {/* Invisible copy of the widest label, so the column fits its labels
                            (which are positioned absolutely) and never runs into the title. */}
                        <span
                            aria-hidden="true"
                            className="invisible flex items-center gap-0.5 whitespace-nowrap text-xs leading-none tabular-nums"
                        >
                            {n > 0 && widestSideLabel}
                            <span className="w-1" />
                        </span>
                        {n > 0 &&
                            sideTicks.map((t, i) => (
                                <span
                                    key={i}
                                    className="absolute right-0 flex translate-y-1/2 items-center gap-0.5 whitespace-nowrap text-xs leading-none tabular-nums text-slate-500"
                                    style={{ bottom: pct(t.pos) }}
                                >
                                    {t.label}
                                    <span
                                        className={cn(
                                            'h-px bg-slate-400',
                                            t.label ? 'w-1' : 'w-0.5',
                                        )}
                                    />
                                </span>
                            ))}
                    </div>
                </div>

                <div
                    ref={plotRef}
                    role="group"
                    aria-label="Histogram range"
                    className={cn(
                        'relative min-h-0 touch-none select-none border-b border-l border-slate-300 bg-slate-50',
                        plotCursor,
                    )}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onLostPointerCapture={endDrag}
                >
                    {n === 0 ? (
                        <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                            No data
                        </p>
                    ) : (
                        <>
                            <svg
                                aria-hidden="true"
                                className="absolute inset-0 h-full w-full"
                                viewBox={`0 0 ${VB} ${VB}`}
                                preserveAspectRatio="none"
                            >
                                {reference && (
                                    <rect
                                        data-testid="histogram-range-reference"
                                        style={{ fill: referenceColor, fillOpacity: 0.25 }}
                                        {...(isHorizontal
                                            ? {
                                                  x: reference[0] * VB,
                                                  y: 0,
                                                  width: (reference[1] - reference[0]) * VB,
                                                  height: VB,
                                              }
                                            : {
                                                  x: 0,
                                                  y: VB - reference[1] * VB,
                                                  width: VB,
                                                  height: (reference[1] - reference[0]) * VB,
                                              })}
                                    />
                                )}
                                <rect
                                    data-selection
                                    className="fill-sky-500/15"
                                    style={color ? { fill: color, fillOpacity: 0.15 } : undefined}
                                    {...(isHorizontal
                                        ? {
                                              x: loPos * VB,
                                              y: 0,
                                              width: (hiPos - loPos) * VB,
                                              height: VB,
                                          }
                                        : {
                                              x: 0,
                                              y: VB - hiPos * VB,
                                              width: VB,
                                              height: (hiPos - loPos) * VB,
                                          })}
                                />
                                {runs.map((run, i) => (
                                    <path
                                        key={i}
                                        d={run.d}
                                        data-faded={run.faded || undefined}
                                        className={run.faded ? 'fill-slate-300' : 'fill-slate-500'}
                                        style={
                                            color
                                                ? { fill: color, fillOpacity: run.faded ? 0.3 : 1 }
                                                : undefined
                                        }
                                    />
                                ))}
                            </svg>
                            {useLog && firstDrawn > 0 && (
                                <span
                                    data-testid="histogram-range-undrawn"
                                    className={cn(
                                        'pointer-events-none absolute left-0.5 text-xs leading-none text-slate-500',
                                        isHorizontal ? 'top-0.5' : 'bottom-0.5',
                                    )}
                                    title={undrawnNote(
                                        firstDrawn,
                                        percentilesFor(0, firstDrawn)[1],
                                    )}
                                >
                                    ≤0
                                </span>
                            )}
                            {canPan && (
                                <div
                                    data-role="band"
                                    className={cn(
                                        'absolute',
                                        isHorizontal ? 'inset-y-0' : 'inset-x-0',
                                        !dragKind && 'cursor-grab',
                                    )}
                                    style={span(loPos, hiPos)}
                                />
                            )}
                            {handle('lo')}
                            {handle('hi')}
                        </>
                    )}
                </div>

                {/* Bottom axis: values (horizontal) or counts (vertical), low at the left. */}
                <div />
                <div className="flex flex-col" data-testid="histogram-range-bottom-axis">
                    <div className="relative h-5">
                        {n > 0 &&
                            bottomTicks.map((t, i) => (
                                <span
                                    key={i}
                                    className="absolute top-0 flex -translate-x-1/2 flex-col items-center text-xs leading-none tabular-nums text-slate-500"
                                    style={{ left: pct(t.pos) }}
                                >
                                    <span
                                        className={cn(
                                            'mb-0.5 w-px bg-slate-400',
                                            t.label ? 'h-1' : 'h-0.5',
                                        )}
                                    />
                                    {t.label}
                                </span>
                            ))}
                    </div>
                    {bottomTitle && (
                        <span className="text-center text-xs text-slate-500">{bottomTitle}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
