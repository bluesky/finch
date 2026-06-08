import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { OphydSim } from '../core/types';

const OphydSimContext = createContext<OphydSim | null>(null);

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

export function useOphydSim(): OphydSim {
    const sim = useContext(OphydSimContext);
    if (!sim) {
        throw new Error('useOphydSim called outside <OphydSimProvider>');
    }
    return sim;
}

export function useOphydSimOptional(): OphydSim | null {
    return useContext(OphydSimContext);
}
