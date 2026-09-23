import { AxiosAdapter } from 'axios';
import { QServerSim } from '../core/QServerSim';
export interface QServerSimAdapterOptions {
    /**
     * When set, requests must present this exact API key (header or `?api_key=`) or the adapter
     * answers 401 — enough to exercise the real client's auth and refresh handling.
     */
    expectApiKey?: string;
}
/**
 * An axios adapter that answers from the simulator instead of the network.
 *
 * This is the high-fidelity seam: the **real** `QServerApiClient` runs on top of it, so
 * interceptors, auth injection, error normalization and every one of its 70 methods behave
 * exactly as they would against a live server, with no server.
 *
 * ```ts
 * const client = new QServerApiClient({
 *     baseUrl: 'http://sim.local:60610',
 *     apiKey: 'test',
 *     client: axios.create({ adapter: createQServerSimAdapter(sim) }),
 * });
 * await client.getStatus();
 * ```
 *
 * Prefer `createQServerSimClient` when you just want an in-memory client; prefer this when you
 * want the production code path.
 */
export declare function createQServerSimAdapter(sim: QServerSim, options?: QServerSimAdapterOptions): AxiosAdapter;
//# sourceMappingURL=QServerSimAdapter.d.ts.map