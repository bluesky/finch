import type { QServerSocketChannel } from './types';

/**
 * The three websocket routes bluesky-httpserver mounts under `/api`.
 *
 * These are not part of `openapi.json` — OpenAPI does not describe websockets — so they are
 * hard-coded here and verified against a running server rather than generated.
 */
export const QSERVER_SOCKET_PATHS: Record<QServerSocketChannel, string> = {
    /** Scope `read:console`. Frames carry queue-server console lines. */
    console: 'api/console_output/ws',
    /** Scope `read:monitor`. Frames carry `{ status: … }` whenever status changes. */
    status: 'api/status/ws',
    /** Scope `read:monitor`. Frames carry general system-info messages. */
    info: 'api/info/ws',
};

/** Close codes bluesky-httpserver uses in the application range. */
export const QSERVER_WS_CLOSE_AUTH_REQUIRED = 4401;
export const QSERVER_WS_CLOSE_INVALID_TOKEN = 4001;

/** Seconds the server waits for the first-message auth frame before closing with 4401. */
export const QSERVER_WS_AUTH_TIMEOUT_MS = 10_000;
