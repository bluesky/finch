import type { PVMetadata, SimEvent, SimListener, SimValue, Unsubscribe } from './types';

interface PVEntry {
    value: SimValue | undefined;
    metadata: PVMetadata;
    listeners: Set<SimListener>;
}

/**
 * Shared state map: PV name → value + metadata + subscribers.
 *
 * Subscribers receive the latest known value immediately on subscribe if one
 * exists. `set` only emits when the value actually changed (reference or
 * primitive equality), so static signals don't generate update storms.
 */
export class SimState {
    private readonly entries = new Map<string, PVEntry>();
    private readonly now: () => number;

    constructor(now: () => number) {
        this.now = now;
    }

    private entry(name: string): PVEntry {
        let e = this.entries.get(name);
        if (!e) {
            e = { value: undefined, metadata: {}, listeners: new Set() };
            this.entries.set(name, e);
        }
        return e;
    }

    seed(name: string, value: SimValue, metadata: PVMetadata = {}): void {
        const e = this.entry(name);
        e.value = value;
        e.metadata = { ...e.metadata, ...metadata };
    }

    setMetadata(name: string, metadata: PVMetadata): void {
        const e = this.entry(name);
        e.metadata = { ...e.metadata, ...metadata };
    }

    metadata(name: string): PVMetadata | undefined {
        return this.entries.get(name)?.metadata;
    }

    get(name: string): SimValue | undefined {
        return this.entries.get(name)?.value;
    }

    has(name: string): boolean {
        return this.entries.has(name);
    }

    names(): string[] {
        return Array.from(this.entries.keys());
    }

    /**
     * Set a value. Returns true if it changed (and listeners were notified).
     */
    set(name: string, value: SimValue): boolean {
        const e = this.entry(name);
        if (e.value === value) return false;
        e.value = value;
        const event: SimEvent = { name, value, timestamp: this.now() };
        for (const listener of e.listeners) {
            try {
                listener(event);
            } catch (err) {
                console.error('[ophyd-sim] subscriber threw:', err);
            }
        }
        return true;
    }

    subscribe(name: string, listener: SimListener): Unsubscribe {
        const e = this.entry(name);
        e.listeners.add(listener);
        if (e.value !== undefined) {
            try {
                listener({ name, value: e.value, timestamp: this.now() });
            } catch (err) {
                console.error('[ophyd-sim] subscriber threw on replay:', err);
            }
        }
        return () => {
            e.listeners.delete(listener);
        };
    }
}
