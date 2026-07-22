import { useEffect, type ReactNode } from 'react';
import type { OphydSim } from '../core/types';
import { OphydSimContext } from './OphydSimContext';

export interface OphydSimProviderProps {
    /**
     * The simulator instance. Must be stable across renders — wrap creation
     * in useMemo or define at module scope to avoid resetting on each render.
     */
    sim: OphydSim;
    children: ReactNode;
}

export function OphydSimProvider({ sim, children }: OphydSimProviderProps) {
    useEffect(() => {
        sim.start();
        return () => sim.stop();
    }, [sim]);

    return <OphydSimContext.Provider value={sim}>{children}</OphydSimContext.Provider>;
}
