import { WebSocketLike } from '../../../api/qServer/sockets/types';
import { QServerSim } from '../core/QServerSim';
export interface QServerSimSocketFactoryOptions {
    /** Reject a handshake that presents no credentials, with close code 4401. Default false. */
    requireAuth?: boolean;
    /** Accept only this exact key; anything else closes with 4001. */
    expectApiKey?: string;
    /** Replay recent console lines to a newly opened console socket. Default true. */
    replayConsoleOnOpen?: boolean;
    /** How many buffered lines to replay. Default 50. */
    replayLines?: number;
}
/** The factory shape `QServerSocketOptions.socketFactory` expects, plus a teardown helper. */
export type QServerSimSocketFactory = ((url: string) => WebSocketLike) & {
    /** Close every socket this factory produced. Call it when tearing down a story or test. */
    closeAll: () => void;
};
/**
 * Build fake websockets served from the simulator.
 *
 * Drops straight into the real socket code: `createQServerSocket` and the channel hooks already
 * accept a `socketFactory`, so nothing in `src/api/qServer` changes.
 *
 * ```ts
 * const sim = defaultQServer();
 * const socketFactory = createQServerSimSocketFactory(sim);
 * const { status } = useQServerStatusSocket({ baseUrl: 'http://sim.local:60610', socketFactory });
 * ```
 *
 * Two behaviours are deliberate deviations from the real server, both listed in the README:
 * console output can be replayed on connect (a real server replays nothing, but a story mounted
 * after setup would otherwise show an empty console), and the info channel emits a single frame
 * rather than a stream.
 */
export declare function createQServerSimSocketFactory(sim: QServerSim, options?: QServerSimSocketFactoryOptions): QServerSimSocketFactory;
//# sourceMappingURL=createQServerSimSocketFactory.d.ts.map