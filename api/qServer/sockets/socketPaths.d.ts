import { QServerSocketChannel } from './types';
/**
 * The three websocket routes bluesky-httpserver mounts under `/api`.
 *
 * These are not part of `openapi.json` — OpenAPI does not describe websockets — so they are
 * hard-coded here and verified against a running server rather than generated.
 */
export declare const QSERVER_SOCKET_PATHS: Record<QServerSocketChannel, string>;
/** Close codes bluesky-httpserver uses in the application range. */
export declare const QSERVER_WS_CLOSE_AUTH_REQUIRED = 4401;
export declare const QSERVER_WS_CLOSE_INVALID_TOKEN = 4001;
/** Seconds the server waits for the first-message auth frame before closing with 4401. */
export declare const QSERVER_WS_AUTH_TIMEOUT_MS = 10000;
//# sourceMappingURL=socketPaths.d.ts.map