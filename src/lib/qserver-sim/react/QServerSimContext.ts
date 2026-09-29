import { createContext, useContext } from 'react';
import type { QServerSim } from '../core/QServerSim';

export const QServerSimContext = createContext<QServerSim | null>(null);

/** The simulator from the nearest provider. Throws when there isn't one. */
export function useQServerSim(): QServerSim {
    const sim = useContext(QServerSimContext);
    if (!sim) {
        throw new Error('useQServerSim called outside <QServerSimProvider>');
    }
    return sim;
}

/** The simulator, or `null` when running against a real server. */
export function useQServerSimOptional(): QServerSim | null {
    return useContext(QServerSimContext);
}
