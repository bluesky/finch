import { QServerSim } from '../core/QServerSim';
import { SimRequest, SimResponse } from './routes';
/**
 * The one place a request becomes a state change.
 *
 * Both client seams — the direct sim client and the axios adapter — funnel through here, which
 * is what guarantees they produce identical payloads. It is **synchronous**: the mutation lands
 * immediately, and only the *response* is ever delayed (see `latencyMs`), so simulated latency
 * can never desynchronize the state machine from `advance()`.
 */
export declare function handleRequest(sim: QServerSim, request: SimRequest): SimResponse;
/**
 * Strip a trailing slash, except from `/api/` itself — that one *is* a real endpoint
 * (the spec's root path), so normalizing it away would 501 a valid request.
 */
export declare function normalizePath(path: string): string;
//# sourceMappingURL=handleRequest.d.ts.map