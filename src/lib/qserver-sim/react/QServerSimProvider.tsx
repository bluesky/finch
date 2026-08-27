import { useEffect, type ReactNode } from 'react';
import type { QServerSim } from '../core/QServerSim';
import { QServerSimContext } from './QServerSimContext';

export interface QServerSimProviderProps {
    /**
     * The simulator instance. Must be stable across renders — build it at module scope or in a
     * `useMemo`, or the tick loop restarts (and state resets) on every render.
     */
    sim: QServerSim;
    children: ReactNode;
}

/**
 * Puts a simulator in context and owns its tick loop: started on mount, stopped on unmount.
 *
 * Mirrors `OphydSimProvider`. Note that this only exposes the *simulator*; components talk to it
 * through a client supplied by `QServerApiProvider`. `withQServerSim` wires both in one step.
 */
export function QServerSimProvider({ sim, children }: QServerSimProviderProps) {
    useEffect(() => {
        sim.start();
        return () => sim.stop();
    }, [sim]);

    return <QServerSimContext.Provider value={sim}>{children}</QServerSimContext.Provider>;
}
