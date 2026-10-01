/**
 * Binning and percentile helpers for intensity-distribution plots.
 *
 * These are pure functions with no DOM or React dependency, so they can be used
 * to prepare data before it reaches a component (or on a worker thread).
 */

/** A binned distribution. `counts` has one entry per bin; `binEdges` has one more entry than `counts`. */
export type HistogramBins = {
    /** Number of samples falling in each bin. */
    counts: number[];
    /** Midpoint of each bin, in data units. Same length as `counts`. */
    binCenters: number[];
    /** Bin boundaries, in data units. Length is `counts.length + 1`. */
    binEdges: number[];
};

/** Options accepted by {@link computeHistogram}. */
export type ComputeHistogramOptions = {
    /** Number of bins. Defaults to `256`. Values below 1 are clamped to 1. */
    bins?: number;
    /** Range to bin over, as `[min, max]`. Defaults to the extent of `values`. */
    domain?: [number, number];
    /** Apply `log10` to each positive value before binning. Non-positive values are passed through. */
    log?: boolean;
};

/**
 * Bins raw values into a histogram.
 *
 * Non-finite values (`NaN`, `±Infinity`) are skipped. Values outside `domain` are
 * skipped rather than clamped, so an explicit domain acts as a filter. When the
 * domain is degenerate (min === max) every finite in-range sample lands in bin 0.
 */
export function computeHistogram(
    values: ArrayLike<number>,
    options: ComputeHistogramOptions = {},
): HistogramBins {
    const { domain, log = false } = options;
    const bins = Math.max(1, Math.floor(options.bins ?? 256));

    const transform = (v: number) => (log && v > 0 ? Math.log10(v) : v);

    let min: number;
    let max: number;
    if (domain) {
        min = transform(domain[0]);
        max = transform(domain[1]);
    } else {
        min = Infinity;
        max = -Infinity;
        for (let i = 0; i < values.length; i += 1) {
            const v = transform(values[i]);
            if (!Number.isFinite(v)) continue;
            if (v < min) min = v;
            if (v > max) max = v;
        }
        // No finite samples at all — fall back to a unit domain so the shape is still valid.
        if (!Number.isFinite(min) || !Number.isFinite(max)) {
            min = 0;
            max = 1;
        }
    }

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
        const v = transform(values[i]);
        if (!Number.isFinite(v) || v < min || v > max) continue;
        // The final bin is closed on the right so the maximum sample is counted.
        const idx = degenerate ? 0 : Math.min(bins - 1, Math.floor((v - min) / width));
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
