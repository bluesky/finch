import type { TickContext, TickHandler, Unsubscribe } from './types';

/**
 * Drives the simulator's periodic work: run progress and the environment open/close timers.
 *
 * Deliberately simpler than ophyd-sim's scheduler, which prefers `requestAnimationFrame` for
 * visual smoothness. Nothing here is animated — a progress counter and two countdowns — and
 * consumers poll at about 1 Hz, so a plain interval is the right tool and ticks ~30× less often.
 *
 * Time is monotonic across start/stop: handlers see `dt` measured against the previous tick.
 */
export class SimScheduler {
    private handlers = new Set<TickHandler>();
    private running = false;
    private intervalHandle: ReturnType<typeof setInterval> | null = null;
    private lastTickMs: number | null = null;
    private tickMs: number;
    private readonly now: () => number;

    constructor(tickMs: number, now: () => number) {
        this.tickMs = tickMs;
        this.now = now;
    }

    onTick(handler: TickHandler): Unsubscribe {
        this.handlers.add(handler);
        return () => {
            this.handlers.delete(handler);
        };
    }

    isRunning(): boolean {
        return this.running;
    }

    /** Change the interval. Takes effect immediately if the loop is running. */
    setTickMs(tickMs: number): void {
        if (tickMs === this.tickMs) return;
        this.tickMs = tickMs;
        if (this.running) {
            this.stop();
            this.start();
        }
    }

    start(): void {
        if (this.running) return;
        this.running = true;
        this.lastTickMs = this.now();
        this.intervalHandle = setInterval(() => this.tick(), this.tickMs);
    }

    stop(): void {
        if (!this.running) return;
        this.running = false;
        if (this.intervalHandle !== null) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
        this.lastTickMs = null;
    }

    /**
     * Run one synthetic tick of `deltaMs`.
     *
     * This is the test seam, and it does **not** subdivide: `advance(3000)` is a single tick
     * with `dt = 3`, not thirty ticks of 100 ms. Surplus time is therefore not carried past a
     * transition, which makes `advance(runDurationMs)` mean exactly "finish one run".
     */
    advance(deltaMs: number): void {
        const time = this.lastTickMs ?? this.now();
        this.runHandlers({ time, dt: deltaMs / 1000 });
        this.lastTickMs = time + deltaMs;
    }

    private tick(): void {
        const time = this.now();
        const last = this.lastTickMs ?? time;
        this.lastTickMs = time;
        this.runHandlers({ time, dt: Math.max(0, (time - last) / 1000) });
    }

    private runHandlers(context: TickContext): void {
        for (const handler of this.handlers) {
            try {
                handler(context);
            } catch (error) {
                console.error('[qserver-sim] tick handler threw:', error);
            }
        }
    }
}
