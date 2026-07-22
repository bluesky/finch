import { createContext, useContext } from 'react';
import type { OphydSim } from '../core/types';

export const OphydSimContext = createContext<OphydSim | null>(null);

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
