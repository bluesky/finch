import { PlotlyScatterData } from '@/types/plotTypes';

export const generateSampleData = (numPoints: number): PlotlyScatterData => {
    const now = Date.now(); // Current timestamp in milliseconds
    const interval = 1000; // 1 second interval between points
    const x = Array.from({ length: numPoints }, (_, i) =>
        new Date(now - (numPoints - i) * interval).toISOString(),
    );
    const y = Array.from({ length: numPoints }, () => Math.random() * 100);
    return {
        x,
        y,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'red' },
    };
};

export const blankScatterData: PlotlyScatterData = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: 'grey', size: [] },
};

/**
 * Per-point marker opacities for a time-ordered series (oldest first, newest
 * last). The oldest point gets `minOpacity` and the newest gets 1. Recency is
 * raised to `exponent` before interpolating, so `exponent > 1` makes older
 * points fade out faster (the curve hugs full opacity near the newest point and
 * drops off sooner for older ones). A single point is always fully opaque.
 */
export function recencyOpacities(count: number, minOpacity = 0, exponent = 4): number[] {
    if (count <= 0) return [];
    if (count === 1) return [1];
    return Array.from({ length: count }, (_, i) => {
        const recency = i / (count - 1);
        return minOpacity + Math.pow(recency, exponent) * (1 - minOpacity);
    });
}
