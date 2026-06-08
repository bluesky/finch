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

export interface Gaussian2dOptions {
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    sigmaX: number;
    sigmaY: number;
}

/** 2D Gaussian, peak value 1 at (centerX, centerY). */
export function gaussian2d({ x, y, centerX, centerY, sigmaX, sigmaY }: Gaussian2dOptions): number {
    const zx = sigmaX === 0 ? (x === centerX ? 0 : Infinity) : (x - centerX) / sigmaX;
    const zy = sigmaY === 0 ? (y === centerY ? 0 : Infinity) : (y - centerY) / sigmaY;
    return Math.exp(-0.5 * (zx * zx + zy * zy));
}
