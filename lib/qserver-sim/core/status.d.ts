import { GetStatusResponse } from '../../../api/qServer/types/status';
import { QServerSimState } from './types';
/**
 * Build the `GET /api/status` payload from simulator state.
 *
 * Every field is *derived*, never stored twice — that is what keeps status honest as the state
 * machine grows. Two invariants are load-bearing for the existing UI:
 *
 * - `re_state` is `null` exactly when the environment is closed
 *   (`ContainerQServer.tsx` branches on both fields together).
 * - the `*_uid` fields come straight from `state.uids`, and only *transitions* bump those, so a
 *   run in progress does not make the UI refetch the queue on every tick.
 */
export declare function deriveStatus(state: QServerSimState): GetStatusResponse;
/**
 * The keys `deriveStatus` produces.
 *
 * Kept beside the function so a field dropped in a refactor fails a test rather than silently
 * disappearing from every status response.
 */
export declare const STATUS_KEYS: readonly (keyof GetStatusResponse)[];
//# sourceMappingURL=status.d.ts.map