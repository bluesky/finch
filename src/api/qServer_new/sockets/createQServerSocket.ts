import {
    QSERVER_WS_AUTH_TIMEOUT_MS,
    QSERVER_WS_CLOSE_AUTH_REQUIRED,
    QSERVER_WS_CLOSE_INVALID_TOKEN,
} from './socketPaths';
import type {
    QServerSocketAuth,
    QServerSocketError,
    QServerSocketOptions,
    QServerSocketStatus,
    QServerSocketTransport,
    Unsubscribe,
    WebSocketLike,
} from './types';

const DEFAULT_RECONNECT = {
    enabled: true,
    initialDelayMs: 500,
    maxDelayMs: 15_000,
    factor: 2,
    jitter: 0.2,
    maxAttempts: Number.POSITIVE_INFINITY,
};

/** Normal closure, plus the code browsers report for an abnormal drop. */
const CLOSE_NORMAL = 1000;

/**
 * Connect to one of the queue server's send-only websockets.
 *
 * Behaviour worth knowing:
 *
 * - **No outbound traffic** after the optional auth frame. The server ignores client frames
 *   and implements no application-level ping/pong, so inventing keepalives would be noise.
 * - **Auth failures do not reconnect.** Close codes 4401/4001 mean the credentials are
 *   wrong; retrying would hammer the server with the same bad key.
 * - **Frames may be missing.** The server's per-client queue holds 1000 messages and drops
 *   the oldest on overflow, so consumers must tolerate gaps.
 */
export function createQServerSocket<TFrame>(
    options: QServerSocketOptions<TFrame>,
): QServerSocketTransport<TFrame> {
    const label = options.label ?? 'qserver-ws';
    const reconnectConfig = { ...DEFAULT_RECONNECT, ...options.reconnect };
    const parse = options.parse ?? defaultParse<TFrame>;
    const openSocket =
        options.socketFactory ?? ((url: string) => new WebSocket(url) as WebSocketLike);

    const messageListeners = new Set<(frame: TFrame) => void>();
    const statusListeners = new Set<(status: QServerSocketStatus) => void>();
    const errorListeners = new Set<(error: QServerSocketError) => void>();

    let status: QServerSocketStatus = 'connecting';
    let socket: WebSocketLike | null = null;
    let closedByUser = false;
    let attempt = 0;
    let dropped = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let authTimer: ReturnType<typeof setTimeout> | null = null;

    const authMode = options.auth?.mode ?? 'query';

    const setStatus = (next: QServerSocketStatus): void => {
        if (status === next) return;
        status = next;
        for (const listener of statusListeners) {
            try {
                listener(next);
            } catch (error) {
                console.error(`[${label}] status listener threw:`, error);
            }
        }
    };

    const emitError = (error: QServerSocketError): void => {
        for (const listener of errorListeners) {
            try {
                listener(error);
            } catch (listenerError) {
                console.error(`[${label}] error listener threw:`, listenerError);
            }
        }
    };

    const clearAuthTimer = (): void => {
        if (authTimer !== null) {
            clearTimeout(authTimer);
            authTimer = null;
        }
    };

    const clearReconnectTimer = (): void => {
        if (reconnectTimer !== null) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    };

    const scheduleReconnect = (): void => {
        if (closedByUser || !reconnectConfig.enabled) return;
        if (attempt >= reconnectConfig.maxAttempts) {
            emitError({
                kind: 'reconnect-exhausted',
                message: `Giving up after ${attempt} reconnect attempts.`,
            });
            return;
        }
        const base = Math.min(
            reconnectConfig.maxDelayMs,
            reconnectConfig.initialDelayMs * reconnectConfig.factor ** attempt,
        );
        const jitter = base * reconnectConfig.jitter * (Math.random() * 2 - 1);
        attempt += 1;
        clearReconnectTimer();
        reconnectTimer = setTimeout(
            () => {
                reconnectTimer = null;
                connect();
            },
            Math.max(0, Math.round(base + jitter)),
        );
    };

    const connect = (): void => {
        if (closedByUser) return;
        clearAuthTimer();
        setStatus('connecting');

        let ws: WebSocketLike;
        try {
            ws = openSocket(
                authMode === 'query' ? withQueryAuth(options.url, options.auth) : options.url,
            );
        } catch (error) {
            emitError({ kind: 'transport', message: describeError(error) });
            setStatus('error');
            scheduleReconnect();
            return;
        }
        socket = ws;

        ws.onopen = () => {
            if (authMode !== 'message') {
                attempt = 0;
                setStatus('open');
                return;
            }
            // The server accepts a credentials frame within 10s of accepting the socket, and
            // promotion to 'open' is only observable once real frames start arriving.
            setStatus('authenticating');
            try {
                ws.send(JSON.stringify(buildAuthMessage(options.auth)));
            } catch (error) {
                emitError({ kind: 'auth', message: describeError(error) });
            }
            authTimer = setTimeout(() => {
                authTimer = null;
                if (status === 'authenticating') {
                    emitError({
                        kind: 'auth-timeout',
                        message: 'No frames received within the server auth window.',
                    });
                }
            }, QSERVER_WS_AUTH_TIMEOUT_MS);
        };

        ws.onmessage = (event) => {
            if (status !== 'open') {
                clearAuthTimer();
                attempt = 0;
                setStatus('open');
            }
            const raw = typeof event.data === 'string' ? event.data : String(event.data);
            let frame: TFrame | null;
            try {
                frame = parse(raw);
            } catch (error) {
                frame = null;
                console.error(`[${label}] failed to parse frame:`, error);
            }
            if (frame === null || frame === undefined) {
                dropped += 1;
                emitError({ kind: 'parse', message: 'Dropped an unparseable frame.' });
                return;
            }
            for (const listener of messageListeners) {
                try {
                    listener(frame);
                } catch (error) {
                    console.error(`[${label}] message listener threw:`, error);
                }
            }
        };

        ws.onerror = () => {
            // Browsers give no detail here; the following close event carries the code.
            emitError({ kind: 'transport', message: 'WebSocket reported an error.' });
        };

        ws.onclose = (event) => {
            clearAuthTimer();
            socket = null;
            const code = event?.code ?? CLOSE_NORMAL;

            if (closedByUser) {
                setStatus('closed');
                return;
            }

            if (
                code === QSERVER_WS_CLOSE_AUTH_REQUIRED ||
                code === QSERVER_WS_CLOSE_INVALID_TOKEN
            ) {
                emitError({
                    kind: 'auth',
                    code,
                    message:
                        code === QSERVER_WS_CLOSE_AUTH_REQUIRED
                            ? 'Server requires credentials for this socket (close 4401).'
                            : 'Server rejected the credentials (close 4001).',
                });
                setStatus('error');
                return;
            }

            setStatus('closed');
            scheduleReconnect();
        };
    };

    connect();

    return {
        onMessage(listener: (frame: TFrame) => void): Unsubscribe {
            messageListeners.add(listener);
            return () => messageListeners.delete(listener);
        },
        onStatus(listener: (next: QServerSocketStatus) => void): Unsubscribe {
            statusListeners.add(listener);
            listener(status);
            return () => statusListeners.delete(listener);
        },
        onError(listener: (error: QServerSocketError) => void): Unsubscribe {
            errorListeners.add(listener);
            return () => errorListeners.delete(listener);
        },
        getStatus: () => status,
        getDroppedCount: () => dropped,
        reconnect() {
            clearReconnectTimer();
            attempt = 0;
            closedByUser = false;
            if (socket) {
                const current = socket;
                socket = null;
                current.onclose = null;
                current.onmessage = null;
                current.onerror = null;
                try {
                    current.close();
                } catch {
                    // Already closing; nothing to do.
                }
            }
            connect();
        },
        close() {
            closedByUser = true;
            clearReconnectTimer();
            clearAuthTimer();
            if (socket) {
                try {
                    socket.close();
                } catch {
                    // Already closed.
                }
            }
            setStatus('closed');
        },
    };
}

function defaultParse<TFrame>(raw: string): TFrame | null {
    const parsed: unknown = JSON.parse(raw);
    return parsed === null ? null : (parsed as TFrame);
}

/** Browsers cannot set handshake headers, so credentials travel as query parameters. */
function withQueryAuth(url: string, auth: QServerSocketAuth | undefined): string {
    if (!auth || auth.mode === 'none') return url;
    const params = new URLSearchParams();
    if (auth.accessToken) params.set('access_token', auth.accessToken);
    else if (auth.apiKey) params.set('api_key', auth.apiKey);
    const query = params.toString();
    if (!query) return url;
    return url.includes('?') ? `${url}&${query}` : `${url}?${query}`;
}

function buildAuthMessage(auth: QServerSocketAuth | undefined): Record<string, string> {
    if (auth?.accessToken) return { type: 'auth', access_token: auth.accessToken };
    return { type: 'auth', api_key: auth?.apiKey ?? '' };
}

function describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
