import { SimValue } from '../core/types';
/**
 * Subscribe to a single PV's value. Re-renders when it changes; returns the
 * latest known value (or undefined if never set).
 */
export declare function useSimSignal<T extends SimValue = SimValue>(name: string): T | undefined;
/**
 * Return a stable `set(name, value)` writer bound to the current simulator.
 */
export declare function useSimSet(): (name: string, value: SimValue) => void;
//# sourceMappingURL=hooks.d.ts.map