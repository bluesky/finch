/** Which of the server's three send-only websockets to attach to. */
export type QServerSocketChannel = 'console' | 'status' | 'info';

/**
 * `'authenticating'` only occurs in first-message auth mode: the socket is open but the
 * server has not yet accepted the credentials frame.
 */
export type QServerSocketStatus = 'connecting' | 'authenticating' | 'open' | 'closed' | 'error';

export type Unsubscribe = () => void;

export type QServerSocketErrorKind =
    | 'auth'
    | 'auth-timeout'
    | 'transport'
    | 'parse'
    | 'reconnect-exhausted';

export interface QServerSocketError {
    kind: QServerSocketErrorKind;
    message: string;
    /** Websocket close code, when the error came from a close frame. */
    code?: number;
}

/**
 * How to present credentials to the socket.
 *
 * `'query'` is the default and the only option a browser can use for the handshake itself.
 * `'message'` connects without credentials and sends `{"type": "auth", …}` as the first
 * frame, which the server accepts within a 10 second window.
 */
export interface QServerSocketAuth {
    apiKey?: string | null;
    accessToken?: string | null;
    mode?: 'query' | 'message' | 'none';
}

export interface QServerSocketReconnectOptions {
    enabled?: boolean;
    initialDelayMs?: number;
    maxDelayMs?: number;
    factor?: number;
    /** Fraction of the delay applied as random jitter, 0–1. */
    jitter?: number;
    maxAttempts?: number;
}

/** The slice of the `WebSocket` API this module uses, so tests can inject a fake. */
export interface WebSocketLike {
    readyState: number;
    send(data: string): void;
    close(code?: number, reason?: string): void;
    onopen: ((event: unknown) => void) | null;
    onmessage: ((event: { data: unknown }) => void) | null;
    onerror: ((event: unknown) => void) | null;
    onclose: ((event: { code: number; reason?: string }) => void) | null;
}

export interface QServerSocketOptions<TFrame> {
    /** Base websocket URL without auth parameters, e.g. `ws://host:60610/api/status/ws`. */
    url: string;
    auth?: QServerSocketAuth;
    reconnect?: QServerSocketReconnectOptions;
    /** Defaults to `JSON.parse`; return `null` to drop a frame. */
    parse?: (raw: string) => TFrame | null;
    /** Defaults to `new WebSocket(url)`. */
    socketFactory?: (url: string) => WebSocketLike;
    /** Label used in console diagnostics. */
    label?: string;
}

/**
 * A live connection to one queue-server websocket.
 *
 * There is deliberately no `send`: after the optional auth frame these sockets are
 * strictly server-to-client, the server ignores anything a client sends, and it performs
 * no application-level ping/pong — so a client must not invent keepalives.
 */
export interface QServerSocketTransport<TFrame> {
    onMessage(listener: (frame: TFrame) => void): Unsubscribe;
    /** Subscribing replays the current status immediately. */
    onStatus(listener: (status: QServerSocketStatus) => void): Unsubscribe;
    onError(listener: (error: QServerSocketError) => void): Unsubscribe;
    getStatus(): QServerSocketStatus;
    /** Number of frames dropped because they could not be parsed. */
    getDroppedCount(): number;
    /** Reconnect now, resetting the backoff schedule. */
    reconnect(): void;
    /** Close for good; no further reconnect attempts. */
    close(): void;
}

export type QServerSocketFactory<TFrame> = (
    options: QServerSocketOptions<TFrame>,
) => QServerSocketTransport<TFrame>;
