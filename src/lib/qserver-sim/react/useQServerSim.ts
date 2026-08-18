import { useEffect, useState } from 'react';
import type { GetStatusResponse } from '@/api/qServer/types/status';
import type { QServerSimState } from '../core/types';
import { useQServerSim } from './QServerSimContext';

export { useQServerSim, useQServerSimOptional } from './QServerSimContext';

/**
 * Subscribe to the simulator's status and re-render when it changes.
 *
 * Change-gated by the simulator, so a run merely progressing does not re-render. Handy for
 * story-only controls; production components should read status through the API client instead.
 */
export function useQServerSimStatus(): GetStatusResponse {
    const sim = useQServerSim();
    const [status, setStatus] = useState<GetStatusResponse>(() => sim.getStatus());

    useEffect(() => sim.subscribeStatus(setStatus), [sim]);

    return status;
}

/**
 * Subscribe to raw simulator state.
 *
 * Fires on **every** mutation, including progress ticks, so prefer `useQServerSimStatus` unless
 * you specifically need the queue arrays or the running slot's elapsed time.
 */
export function useQServerSimState(): QServerSimState {
    const sim = useQServerSim();
    const [, setVersion] = useState(0);

    useEffect(() => sim.subscribeState(() => setVersion((value) => value + 1)), [sim]);

    // State is mutated in place, so the version counter is what drives the re-render.
    return sim.getState();
}
