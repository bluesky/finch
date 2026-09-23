import { QServerConsoleFrame, QServerInfoFrame, QServerStatusFrame } from './messageTypes';
import { QServerSocketAuth, QServerSocketReconnectOptions, QServerSocketTransport, WebSocketLike } from './types';
/**
 * Everything the typed channel helpers accept, minus the URL they build themselves.
 *
 * Credentials are flat rather than nested under `auth` so that the same object shape works
 * for the helpers and the React hooks.
 */
export interface QServerChannelSocketOptions {
    /** Server origin or HTTP base URL; converted to `ws(s)://` and stripped of `/api`. */
    baseUrl: string;
    apiKey?: string | null;
    accessToken?: string | null;
    /** `'query'` (default), `'message'` for the first-frame handshake, or `'none'`. */
    authMode?: QServerSocketAuth['mode'];
    reconnect?: QServerSocketReconnectOptions;
    socketFactory?: (url: string) => WebSocketLike;
}
/** Live console output — the websocket counterpart of `GET /api/console_output`. */
export declare function createQServerConsoleSocket(options: QServerChannelSocketOptions): QServerSocketTransport<QServerConsoleFrame>;
/** Status changes pushed as they happen, instead of polling `GET /api/status`. */
export declare function createQServerStatusSocket(options: QServerChannelSocketOptions): QServerSocketTransport<QServerStatusFrame>;
/** General system-info messages. */
export declare function createQServerInfoSocket(options: QServerChannelSocketOptions): QServerSocketTransport<QServerInfoFrame>;
//# sourceMappingURL=channelSockets.d.ts.map