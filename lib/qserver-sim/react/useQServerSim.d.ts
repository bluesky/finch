import { GetStatusResponse } from '../../../api/qServer/types/status';
import { QServerSimState } from '../core/types';
export { useQServerSim, useQServerSimOptional } from './QServerSimContext';
/**
 * Subscribe to the simulator's status and re-render when it changes.
 *
 * Change-gated by the simulator, so a run merely progressing does not re-render. Handy for
 * story-only controls; production components should read status through the API client instead.
 */
export declare function useQServerSimStatus(): GetStatusResponse;
/**
 * Subscribe to raw simulator state.
 *
 * Fires on **every** mutation, including progress ticks, so prefer `useQServerSimStatus` unless
 * you specifically need the queue arrays or the running slot's elapsed time.
 */
export declare function useQServerSimState(): QServerSimState;
//# sourceMappingURL=useQServerSim.d.ts.map