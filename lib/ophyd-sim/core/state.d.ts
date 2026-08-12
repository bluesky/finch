import { PVMetadata, SimListener, SimValue, Unsubscribe } from './types';
/**
 * Shared state map: PV name → value + metadata + subscribers.
 *
 * Subscribers receive the latest known value immediately on subscribe if one
 * exists. `set` only emits when the value actually changed (reference or
 * primitive equality), so static signals don't generate update storms.
 */
export declare class SimState {
    private readonly entries;
    private readonly now;
    constructor(now: () => number);
    private entry;
    seed(name: string, value: SimValue, metadata?: PVMetadata): void;
    setMetadata(name: string, metadata: PVMetadata): void;
    metadata(name: string): PVMetadata | undefined;
    get(name: string): SimValue | undefined;
    has(name: string): boolean;
    names(): string[];
    /**
     * Set a value. Returns true if it changed (and listeners were notified).
     */
    set(name: string, value: SimValue): boolean;
    subscribe(name: string, listener: SimListener): Unsubscribe;
}
//# sourceMappingURL=state.d.ts.map