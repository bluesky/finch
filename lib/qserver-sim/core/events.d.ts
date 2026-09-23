import { Unsubscribe } from './types';
/**
 * A `Set`-backed listener list, following the repo-wide convention: subscribing returns the
 * unsubscribe closure, listeners fire synchronously, and one throwing listener is logged
 * rather than allowed to break the others.
 */
export declare class SimEmitter<T> {
    private readonly label;
    private listeners;
    constructor(label: string);
    /**
     * @param replay Called on subscribe to produce the current value, which is delivered
     * synchronously. Omit for streams (like console output) that have no "current value".
     */
    subscribe(listener: (value: T) => void, replay?: () => T | undefined): Unsubscribe;
    emit(value: T): void;
    size(): number;
    clear(): void;
    private deliver;
}
//# sourceMappingURL=events.d.ts.map