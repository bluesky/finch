import { QServerClientLike } from '../../../api/qServerRuntime/clientLike';
import { QServerSim } from '../core/QServerSim';
export interface QServerSimClient extends QServerClientLike {
    /** The simulator behind this client, for stories and tests to drive directly. */
    readonly sim: QServerSim;
}
/**
 * An in-memory queue-server client backed by a simulator.
 *
 * Implements `QServerClientLike`, so anything typed against that — including the runtime
 * provider — accepts it interchangeably with the real `QServerApiClient`. No request ever
 * leaves the page.
 *
 * ```ts
 * const sim = defaultQServer();
 * const client = createQServerSimClient(sim);
 * await client.getQueue();       // reads sim state
 * sim.advance(3000);             // drive time from the test or story
 * ```
 *
 * Errors are the real `QServerApiError`, so component error handling behaves identically under
 * the sim and against a live server.
 */
export declare function createQServerSimClient(sim: QServerSim): QServerSimClient;
//# sourceMappingURL=QServerSimClient.d.ts.map