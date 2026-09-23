import { QServerSim } from '../core/QServerSim';
/** An HTTP-shaped request, already normalized (no origin, no query string in `path`). */
export interface SimRequest {
    method: 'GET' | 'POST' | 'DELETE';
    /** Path including the `/api/` prefix, e.g. `'/api/queue/get'`. */
    path: string;
    body: Record<string, unknown>;
    query: Record<string, string>;
}
export interface SimResponse {
    status: number;
    data: unknown;
}
export type SimRoute = (sim: QServerSim, request: SimRequest) => SimResponse;
/**
 * The simulator's HTTP surface, keyed by `` `${METHOD} ${path}` ``.
 *
 * Keyed by method and path rather than by the registry's endpoint id because the axios adapter
 * only ever sees those two things — an id-keyed table would need a reverse lookup per request.
 * `SIM_SUPPORTED_ENDPOINT_IDS` below keeps the two views in sync, and a test enforces it.
 */
export declare const SIM_ROUTES: Record<string, SimRoute>;
/**
 * Registry ids the simulator implements — the same list `QServerClientLike` is built from.
 *
 * `dispatcher.test.ts` checks every id exists in `QSERVER_ENDPOINTS` and has a matching route,
 * so a regenerated OpenAPI spec that renames or drops an endpoint fails a test instead of
 * silently leaving a hole in the sim.
 */
export declare const SIM_SUPPORTED_ENDPOINT_IDS: readonly string[];
//# sourceMappingURL=routes.d.ts.map