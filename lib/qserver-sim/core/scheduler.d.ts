import { TickHandler, Unsubscribe } from './types';
/**
 * Drives the simulator's periodic work: run progress and the environment open/close timers.
 *
 * Deliberately simpler than ophyd-sim's scheduler, which prefers `requestAnimationFrame` for
 * visual smoothness. Nothing here is animated — a progress counter and two countdowns — and
 * consumers poll at about 1 Hz, so a plain interval is the right tool and ticks ~30× less often.
 *
 * Time is monotonic across start/stop: handlers see `dt` measured against the previous tick.
 */
export declare class SimScheduler {
    private handlers;
    private running;
    private intervalHandle;
    private lastTickMs;
    private tickMs;
    private readonly now;
    constructor(tickMs: number, now: () => number);
    onTick(handler: TickHandler): Unsubscribe;
    isRunning(): boolean;
    /** Change the interval. Takes effect immediately if the loop is running. */
    setTickMs(tickMs: number): void;
    start(): void;
    stop(): void;
    /**
     * Run one synthetic tick of `deltaMs`.
     *
     * This is the test seam, and it does **not** subdivide: `advance(3000)` is a single tick
     * with `dt = 3`, not thirty ticks of 100 ms. Surplus time is therefore not carried past a
     * transition, which makes `advance(runDurationMs)` mean exactly "finish one run".
     */
    advance(deltaMs: number): void;
    private tick;
    private runHandlers;
}
//# sourceMappingURL=scheduler.d.ts.map