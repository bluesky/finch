import { useEffect, useState, useCallback } from 'react';
import type { SimValue } from '../core/types';
import { useOphydSim } from './OphydSimContext';

/**
 * Subscribe to a single PV's value. Re-renders when it changes; returns the
 * latest known value (or undefined if never set).
 */
export function useSimSignal<T extends SimValue = SimValue>(name: string): T | undefined {
    const sim = useOphydSim();
    const [value, setValue] = useState<T | undefined>(() => sim.get(name) as T | undefined);

    useEffect(() => {
        const unsub = sim.subscribe(name, (event) => setValue(event.value as T));
        return unsub;
    }, [sim, name]);

    return value;
}

/**
 * Return a stable `set(name, value)` writer bound to the current simulator.
 */
export function useSimSet(): (name: string, value: SimValue) => void {
    const sim = useOphydSim();
    return useCallback((name: string, value: SimValue) => sim.set(name, value), [sim]);
}
