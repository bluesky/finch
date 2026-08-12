export interface GaussianOptions {
    x: number;
    center: number;
    sigma: number;
}

/** 1D Gaussian, peak value 1 at x = center. */
export function gaussian({ x, center, sigma }: GaussianOptions): number {
    if (sigma === 0) return x === center ? 1 : 0;
    const z = (x - center) / sigma;
    return Math.exp(-0.5 * z * z);
}

/** Inputs for evaluating a 2D Gaussian at a single point. */
export interface Gaussian2dOptions {
    /** X coordinate at which to evaluate the Gaussian. */
    x: number;
    /** Y coordinate at which to evaluate the Gaussian. */
    y: number;
    /** X coordinate of the Gaussian's peak. */
    centerX: number;
    /** Y coordinate of the Gaussian's peak. */
    centerY: number;
    /** Standard deviation along the X axis (controls horizontal spread). */
    sigmaX: number;
    /** Standard deviation along the Y axis (controls vertical spread). */
    sigmaY: number;
}

/**
 * Evaluates a separable 2D Gaussian at a single point, with a peak value of 1
 * at the center `(centerX, centerY)`.
 *
 * The X and Y axes are independent (no covariance term), so the result is the
 * product of two 1D Gaussians. A sigma of 0 collapses that axis to a spike:
 * the contribution is 1 exactly on the center coordinate and 0 elsewhere.
 *
 * @param options - Point to evaluate, peak center, and per-axis spreads.
 * @returns The Gaussian amplitude in the range [0, 1].
 */
export function gaussian2d({ x, y, centerX, centerY, sigmaX, sigmaY }: Gaussian2dOptions): number {
    const zx = sigmaX === 0 ? (x === centerX ? 0 : Infinity) : (x - centerX) / sigmaX;
    const zy = sigmaY === 0 ? (y === centerY ? 0 : Infinity) : (y - centerY) / sigmaY;
    return Math.exp(-0.5 * (zx * zx + zy * zy));
}
