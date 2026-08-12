import { TickHandler, Unsubscribe } from './types';
/**
 * Drives per-tick work for motors and periodic signals.
 *
 * Prefers requestAnimationFrame in the browser for smoothness; falls back to
 * setInterval (e.g. for tests in jsdom, where rAF may run synchronously).
 *
 * Time is monotonic across pause/resume — devices see dt measured against the
 * previous tick, not wall-clock.
 */
export declare class Scheduler {
    private handlers;
    private running;
    private rafHandle;
    private intervalHandle;
    private lastTickMs;
    private readonly tickMs;
    private readonly now;
    constructor(tickMs: number, now: () => number);
    onTick(handler: TickHandler): Unsubscribe;
    start(): void;
    stop(): void;
    /**
     * Run one synthetic tick. Useful for tests that want to advance time
     * without running a real animation loop.
     */
    advance(deltaMs: number): void;
    private tick;
    private runHandlers;
}
//# sourceMappingURL=scheduler.d.ts.map