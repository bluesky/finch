import type { TickHandler, TickHandlerContext, Unsubscribe } from './types';

/**
 * Drives per-tick work for motors and periodic signals.
 *
 * Prefers requestAnimationFrame in the browser for smoothness; falls back to
 * setInterval (e.g. for tests in jsdom, where rAF may run synchronously).
 *
 * Time is monotonic across pause/resume — devices see dt measured against the
 * previous tick, not wall-clock.
 */
export class Scheduler {
    private handlers = new Set<TickHandler>();
    private running = false;
    private rafHandle: number | null = null;
    private intervalHandle: ReturnType<typeof setInterval> | null = null;
    private lastTickMs: number | null = null;
    private readonly tickMs: number;
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

    start(): void {
        if (this.running) return;
        this.running = true;
        this.lastTickMs = this.now();

        const useRaf =
            typeof globalThis !== 'undefined' &&
            typeof (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame ===
                'function';

        if (useRaf) {
            const loop = (): void => {
                if (!this.running) return;
                this.tick();
                this.rafHandle = (
                    globalThis as { requestAnimationFrame: (cb: FrameRequestCallback) => number }
                ).requestAnimationFrame(loop);
            };
            this.rafHandle = (
                globalThis as { requestAnimationFrame: (cb: FrameRequestCallback) => number }
            ).requestAnimationFrame(loop);
        } else {
            this.intervalHandle = setInterval(() => this.tick(), this.tickMs);
        }
    }

    stop(): void {
        if (!this.running) return;
        this.running = false;
        if (this.rafHandle !== null) {
            const cancel = (globalThis as { cancelAnimationFrame?: (h: number) => void })
                .cancelAnimationFrame;
            if (cancel) cancel(this.rafHandle);
            this.rafHandle = null;
        }
        if (this.intervalHandle !== null) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
        this.lastTickMs = null;
    }

    /**
     * Run one synthetic tick. Useful for tests that want to advance time
     * without running a real animation loop.
     */
    advance(deltaMs: number): void {
        const time = this.lastTickMs ?? this.now();
        const dt = deltaMs / 1000;
        const ctx: TickHandlerContext = { time, dt };
        this.runHandlers(ctx);
        this.lastTickMs = time + deltaMs;
    }

    private tick(): void {
        const time = this.now();
        const last = this.lastTickMs ?? time;
        const dt = Math.max(0, (time - last) / 1000);
        this.lastTickMs = time;
        this.runHandlers({ time, dt });
    }

    private runHandlers(ctx: TickHandlerContext): void {
        for (const handler of this.handlers) {
            try {
                handler(ctx);
            } catch (err) {
                console.error('[ophyd-sim] tick handler threw:', err);
            }
        }
    }
}
