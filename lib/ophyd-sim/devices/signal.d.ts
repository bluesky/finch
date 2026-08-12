import { DeviceFactory, SimValue, SimValueFn } from '../core/types';
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
export declare function signal(opts: SignalOptions): DeviceFactory;
//# sourceMappingURL=signal.d.ts.map