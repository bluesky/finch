import type { Unsubscribe } from './types';

/**
 * A `Set`-backed listener list, following the repo-wide convention: subscribing returns the
 * unsubscribe closure, listeners fire synchronously, and one throwing listener is logged
 * rather than allowed to break the others.
 */
export class SimEmitter<T> {
    private listeners = new Set<(value: T) => void>();

    constructor(private readonly label: string) {}

    /**
     * @param replay Called on subscribe to produce the current value, which is delivered
     * synchronously. Omit for streams (like console output) that have no "current value".
     */
    subscribe(listener: (value: T) => void, replay?: () => T | undefined): Unsubscribe {
        this.listeners.add(listener);
        if (replay) {
            const current = replay();
            if (current !== undefined) this.deliver(listener, current);
        }
        return () => {
            this.listeners.delete(listener);
        };
    }

    emit(value: T): void {
        for (const listener of this.listeners) this.deliver(listener, value);
    }

    size(): number {
        return this.listeners.size;
    }

    clear(): void {
        this.listeners.clear();
    }

    private deliver(listener: (value: T) => void, value: T): void {
        try {
            listener(value);
        } catch (error) {
            console.error(`[qserver-sim] ${this.label} listener threw:`, error);
        }
    }
}
