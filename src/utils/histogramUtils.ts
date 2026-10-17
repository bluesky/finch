/**
 * Binning and percentile helpers for intensity-distribution plots.
 *
 * These are pure functions with no DOM or React dependency, so they can be used
 * to prepare data before it reaches a component (or on a worker thread).
 */

/** A binned distribution. `counts` has one entry per bin; `binEdges` has one more entry than `counts`. */
export type HistogramBins = {
    /**
     * Number of samples falling in each bin. Skipped samples (non-finite, outside
     * `domain`, or non-positive under `log`) are not counted, so the total can be
     * less than the number of input values.
     */
    counts: number[];
    /** Midpoint of each bin, in binning units (`log10` of data units under `log`). Same length as `counts`. */
    binCenters: number[];
    /** Bin boundaries, in binning units (`log10` of data units under `log`). Length is `counts.length + 1`. */
    binEdges: number[];
};

/** Options accepted by {@link computeHistogram}. */
export type ComputeHistogramOptions = {
    /** Number of bins. Defaults to `256`. Values below 1 are clamped to 1. */
    bins?: number;
    /**
     * Range to bin over, as `[min, max]` in data units. Defaults to the extent of
     * `values`. Under `log` only positive values can be binned, so a lower bound
     * at or below zero does not set the lower edge: the edge becomes the smallest
     * positive sample within the domain. A positive lower bound is used exactly.
     */
    domain?: [number, number];
    /**
     * Bin `log10` of each value. Values at or below zero are outside the log
     * domain and are excluded from the counts, rather than being merged with the
     * smallest positive values.
     */
    log?: boolean;
};

/**
 * The `[min, max]` range to bin or normalize `values[0..count)` over, in
 * transformed units (`log10` when `log` is set).
 *
 * Under `log` only positive samples take part, and a lower `domain` bound at or
 * below zero is replaced by the smallest positive sample within the domain. With
 * no usable samples and no domain the range falls back to `[0, 1]`.
 */
export function valueRange(
    values: ArrayLike<number>,
    count: number,
    domain: [number, number] | undefined,
    log: boolean,
): [number, number] {
    const transform = (v: number) => (log ? Math.log10(v) : v);
    if (domain && (!log || domain[0] > 0)) return [transform(domain[0]), transform(domain[1])];
    if (log && domain && domain[1] <= 0) return [0, 0];

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < count; i += 1) {
        const v = values[i];
        if (!Number.isFinite(v) || (log && v <= 0)) continue;
        if (domain && (v < domain[0] || v > domain[1])) continue;
        const t = transform(v);
        if (t < min) min = t;
        if (t > max) max = t;
    }
    if (domain) {
        const top = transform(domain[1]);
        return Number.isFinite(min) ? [min, top] : [top, top];
    }
    // No usable samples at all — fall back to a unit domain so the shape is still valid.
    return Number.isFinite(min) ? [min, max] : [0, 1];
}

/**
 * Bins raw values into a histogram.
 *
 * Non-finite values (`NaN`, `±Infinity`) are skipped, as are non-positive values
 * under `log`. Values outside `domain` are skipped rather than clamped, so an
 * explicit domain acts as a filter. When the domain is degenerate (min === max)
 * every counted sample lands in bin 0.
 */
export function computeHistogram(
    values: ArrayLike<number>,
    options: ComputeHistogramOptions = {},
): HistogramBins {
    const { domain, log = false } = options;
    const bins = Math.max(1, Math.floor(options.bins ?? 256));
    const [min, max] = valueRange(values, values.length, domain, log);

    const degenerate = !(max > min);
    const width = degenerate ? 0 : (max - min) / bins;

    const binEdges = new Array<number>(bins + 1);
    const binCenters = new Array<number>(bins);
    for (let i = 0; i <= bins; i += 1) {
        binEdges[i] = degenerate ? min : min + i * width;
    }
    for (let i = 0; i < bins; i += 1) {
        binCenters[i] = degenerate ? min : min + (i + 0.5) * width;
    }

    const counts = new Array<number>(bins).fill(0);
    for (let i = 0; i < values.length; i += 1) {
        const v = values[i];
        if (!Number.isFinite(v) || (log && v <= 0)) continue;
        if (domain && (v < domain[0] || v > domain[1])) continue;
        const t = log ? Math.log10(v) : v;
        // The final bin is closed on the right so the maximum sample is counted;
        // the lower clamp absorbs rounding at the bottom edge.
        const idx = degenerate ? 0 : Math.max(0, Math.min(bins - 1, Math.floor((t - min) / width)));
        counts[idx] += 1;
    }

    return { counts, binCenters, binEdges };
}

/** Running totals of `counts`, plus the grand total. Used to convert between values and percentiles. */
export function cumulativeCounts(counts: number[]): { cumulative: number[]; total: number } {
    const cumulative: number[] = [];
    let running = 0;
    for (const c of counts) {
        running += c;
        cumulative.push(running);
    }
    return { cumulative, total: running };
}

/**
 * The percentile (0–100) of the distribution at or below `value`.
 *
 * Adapted from the calibration app, where it keeps a percentile slider and a
 * histogram selection in sync without a server round-trip.
 */
export function valueToPercentile(
    value: number,
    binCenters: number[],
    cumulative: number[],
    total: number,
): number {
    if (binCenters.length === 0 || total <= 0) return 0;
    let idx = binCenters.findIndex((center) => center >= value);
    if (idx === -1) idx = binCenters.length - 1;
    return Math.max(0, Math.min(100, (cumulative[idx] / total) * 100));
}

/**
 * The percentage (0–100) of the total population lying **below** a bin edge.
 *
 * Bin `i` is bounded by `edges[i]` and `edges[i + 1]`, so the population below
 * `edges[edgeIndex]` is the sum of bins `0 .. edgeIndex - 1`:
 *
 * - edge `0` (left edge of the first bin) → `0`
 * - internal edge `i` → `cumulative[i - 1] / total * 100`
 * - edge `n` (right edge of the last bin, `n = cumulative.length`) → `100`
 *
 * Indices outside `0..n` are clamped. Returns `0` for an empty distribution.
 */
export function percentileBelowEdge(
    edgeIndex: number,
    cumulative: number[],
    total: number,
): number {
    const n = cumulative.length;
    if (n === 0 || total <= 0) return 0;
    const i = Math.max(0, Math.min(n, Math.round(edgeIndex)));
    if (i === 0) return 0;
    return Math.max(0, Math.min(100, (cumulative[i - 1] / total) * 100));
}

/**
 * The bin edge below which at least `percentile` percent of the population lies.
 * Inverse of {@link percentileBelowEdge}.
 *
 * Returns `binEdges[i]` for the smallest edge index `i` whose population below it
 * is `>= percentile` percent of the total. So `0` → `binEdges[0]`, `100` →
 * the first edge with every sample below it (`binEdges[n]` unless the top bins
 * are empty), and any value returned by `percentileBelowEdge(i)` maps back to an
 * edge with that same population below it.
 */
export function edgeAtPercentile(
    percentile: number,
    binEdges: number[],
    cumulative: number[],
    total: number,
): number {
    if (binEdges.length === 0) return 0;
    const n = cumulative.length;
    if (n === 0 || total <= 0) return binEdges[0];
    const p = Math.max(0, Math.min(100, percentile));
    for (let i = 0; i <= n; i += 1) {
        if (percentileBelowEdge(i, cumulative, total) >= p) {
            return binEdges[Math.min(i, binEdges.length - 1)];
        }
    }
    return binEdges[Math.min(n, binEdges.length - 1)];
}

/**
 * Bin edges for a set of bin centers.
 *
 * Interior edges are the midpoints between neighbouring centers, and the outer
 * edges extrapolate half a bin beyond the first and last center, so irregular
 * spacing is preserved. Evenly spaced centers reproduce the original edges
 * exactly. A single center gets a unit-width bin around it.
 */
export function edgesFromCenters(binCenters: number[]): number[] {
    const n = binCenters.length;
    if (n === 0) return [];
    if (n === 1) return [binCenters[0] - 0.5, binCenters[0] + 0.5];
    const edges = new Array<number>(n + 1);
    for (let i = 1; i < n; i += 1) edges[i] = (binCenters[i - 1] + binCenters[i]) / 2;
    edges[0] = binCenters[0] - (edges[1] - binCenters[0]);
    edges[n] = binCenters[n - 1] + (binCenters[n - 1] - edges[n - 1]);
    return edges;
}

/** The data value at a given percentile (0–100) of the distribution. Inverse of {@link valueToPercentile}. */
export function percentileToValue(
    percentile: number,
    binCenters: number[],
    cumulative: number[],
    total: number,
): number {
    if (binCenters.length === 0 || total <= 0) return 0;
    const target = (percentile / 100) * total;
    let idx = cumulative.findIndex((c) => c >= target);
    if (idx === -1) idx = binCenters.length - 1;
    return binCenters[idx] ?? 0;
}
