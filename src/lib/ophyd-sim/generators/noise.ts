export interface RandomNoiseOptions {
    random: () => number;
    sigma: number;
    mean?: number;
}

/**
 * Sample a single value from N(mean, sigma) using the Box-Muller transform.
 * `random` must return [0, 1). Pass a seeded PRNG for deterministic tests.
 */
export function randomNoise({ random, sigma, mean = 0 }: RandomNoiseOptions): number {
    // Box-Muller: avoid u1 = 0 because log(0) = -Infinity.
    const u1 = Math.max(random(), Number.EPSILON);
    const u2 = random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + sigma * z;
}

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
export function randomWalk(opts: RandomWalkOptions): (random: () => number) => number {
    let current = opts.initial;
    return (random) => {
        const step = randomNoise({ random, sigma: opts.sigma });
        let next = current + step;
        if (opts.min !== undefined) next = Math.max(opts.min, next);
        if (opts.max !== undefined) next = Math.min(opts.max, next);
        current = next;
        return next;
    };
}
