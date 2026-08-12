export interface RandomNoiseOptions {
    random: () => number;
    sigma: number;
    mean?: number;
}
/**
 * Sample a single value from N(mean, sigma) using the Box-Muller transform.
 * `random` must return [0, 1). Pass a seeded PRNG for deterministic tests.
 */
export declare function randomNoise({ random, sigma, mean }: RandomNoiseOptions): number;
export interface RandomWalkOptions {
    initial: number;
    sigma: number;
    min?: number;
    max?: number;
}
/**
 * Build a stateful random-walk step function. Each call advances by a
 * gaussian step of stddev `sigma` and clips into `[min, max]` if set.
 *
 * Use as the `value` of a periodic signal:
 *   const walk = randomWalk({ initial: 400, sigma: 0.25, min: 390, max: 410 });
 *   signal({ name: 'ring_current', periodMs: 500, value: ({random}) => walk(random) })
 */
export declare function randomWalk(opts: RandomWalkOptions): (random: () => number) => number;
//# sourceMappingURL=noise.d.ts.map