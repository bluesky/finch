import type { QServerSim } from '../core/QServerSim';
import { SIM_ROUTES, type SimRequest, type SimResponse } from './routes';

/**
 * The one place a request becomes a state change.
 *
 * Both client seams — the direct sim client and the axios adapter — funnel through here, which
 * is what guarantees they produce identical payloads. It is **synchronous**: the mutation lands
 * immediately, and only the *response* is ever delayed (see `latencyMs`), so simulated latency
 * can never desynchronize the state machine from `advance()`.
 */
export function handleRequest(sim: QServerSim, request: SimRequest): SimResponse {
    const route = SIM_ROUTES[`${request.method} ${normalizePath(request.path)}`];
    if (!route) return notImplemented(request);

    try {
        return route(sim, request);
    } catch (error) {
        console.error('[qserver-sim] route threw:', error);
        return {
            status: 500,
            data: { success: false, msg: `qserver-sim route failed: ${describe(error)}` },
        };
    }
}

/**
 * Strip a trailing slash, except from `/api/` itself — that one *is* a real endpoint
 * (the spec's root path), so normalizing it away would 501 a valid request.
 */
export function normalizePath(path: string): string {
    if (path === '/api/') return path;
    return path.replace(/\/+$/, '');
}

/**
 * 501 rather than 404: the endpoint exists on a real server, the simulator just does not model
 * it. That distinction is the difference between "fix your URL" and "extend the sim".
 */
function notImplemented(request: SimRequest): SimResponse {
    return {
        status: 501,
        data: {
            success: false,
            msg: `qserver-sim does not implement ${request.method} ${request.path}.`,
        },
    };
}

function describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
