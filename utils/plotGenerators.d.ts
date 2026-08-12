import { PlotlyScatterData } from '../types/plotTypes';
export declare const generateSampleData: (numPoints: number) => PlotlyScatterData;
export declare const blankScatterData: PlotlyScatterData;
/**
 * Per-point marker opacities for a time-ordered series (oldest first, newest
 * last). The oldest point gets `minOpacity` and the newest gets 1. Recency is
 * raised to `exponent` before interpolating, so `exponent > 1` makes older
 * points fade out faster (the curve hugs full opacity near the newest point and
 * drops off sooner for older ones). A single point is always fully opaque.
 */
export declare function recencyOpacities(count: number, minOpacity?: number, exponent?: number): number[];
//# sourceMappingURL=plotGenerators.d.ts.map