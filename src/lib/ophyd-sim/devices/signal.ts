import type {
    DeviceFactory,
    PVMetadata,
    SimValue,
    SimValueContext,
    SimValueFn,
} from '../core/types';

export interface SignalOptions {
    name: string;
    /** Initial value seeded immediately. Required unless `value` is a function. */
    initialValue?: SimValue;
    /** Static literal, or a function evaluated periodically and/or on dep change. */
    value?: SimValue | SimValueFn;
    /** Other PVs this signal depends on. Triggers recompute on their changes. */
    dependsOn?: string[];
    /** Recompute every `periodMs` regardless of dependency changes. */
    periodMs?: number;
    units?: string;
    /** EPICS-style control limits. */
    limits?: [number, number];
    /** Defaults to false — signals are read-only by default. */
    writeAccess?: boolean;
    precision?: number;
    enumStrs?: string[];
}

/**
 * Scalar signal: static literal, dynamic function, derived from other PVs,
 * or any combination.
 *
 * Resolution order at registration:
 *  1. If `value` is a function and `dependsOn` is non-empty → derived signal
 *     (recomputes on any dep change AND optionally on `periodMs`).
 *  2. If `value` is a function and no deps → periodic-only signal.
 *  3. Otherwise → static signal seeded from `initialValue` or `value`.
 */
export function signal(opts: SignalOptions): DeviceFactory {
    return (reg) => {
        const metadata: PVMetadata = {
            units: opts.units,
            lower_ctrl_limit: opts.limits ? opts.limits[0] : null,
            upper_ctrl_limit: opts.limits ? opts.limits[1] : null,
            precision: opts.precision,
            enum_strs: opts.enumStrs ?? null,
            read_access: true,
            write_access: opts.writeAccess ?? false,
        };

        const isFn = typeof opts.value === 'function';
        const valueFn = isFn ? (opts.value as SimValueFn) : null;
        const deps = opts.dependsOn ?? [];

        if (valueFn && deps.length > 0) {
            reg.setMetadata(opts.name, metadata);
            reg.registerDerived(opts.name, deps, valueFn);
        } else {
            const seed: SimValue =
                opts.initialValue !== undefined
                    ? opts.initialValue
                    : valueFn
                      ? safeInitial(valueFn, reg.context(0, reg.now()))
                      : ((opts.value as SimValue) ?? 0);
            reg.seed(opts.name, seed, metadata);
        }

        if (valueFn && opts.periodMs && opts.periodMs > 0) {
            let accumMs = 0;
            const periodMs = opts.periodMs;
            reg.onTick(({ dt, time }) => {
                accumMs += dt * 1000;
                if (accumMs < periodMs) return;
                accumMs = 0;
                const ctx = reg.context(dt, time);
                try {
                    reg.set(opts.name, valueFn(ctx));
                } catch (err) {
                    console.error(
                        `[ophyd-sim] periodic recompute for signal "${opts.name}" threw:`,
                        err,
                    );
                }
            });
        }
    };
}

function safeInitial(fn: SimValueFn, ctx: SimValueContext): SimValue {
    try {
        return fn(ctx);
    } catch {
        return 0;
    }
}
