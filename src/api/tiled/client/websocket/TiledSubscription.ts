import { buildTiledWebSocketUrl } from './buildWebSocketUrl';
import { isTiledSchemaMessage, parseTiledStreamMessage } from './parseMessage';
import type {
    TiledConnectionStatus,
    TiledSocketFactory,
    TiledStreamMessage,
    TiledSubscriptionConfig,
    TiledSubscriptionError,
    Unsubscribe,
    WebSocketLike,
} from './types';

/** Close codes Tiled's `/stream/single` route uses (see `tiled/server/router.py`). */
export const TILED_WS_CLOSE = {
    /** A normal close. From the server it means the producer ended the stream. */
    NORMAL: 1000,
    /** The first frame was not valid JSON, or not `{"type": "auth", …}`. */
    BAD_AUTH_MESSAGE: 4001,
    /** The first-frame credentials were rejected. */
    AUTH_FAILED: 4003,
} as const;

const JITTER = 0.2;

/**
 * One live subscription to one Tiled node. Framework-independent: no React and no TanStack Query.
 *
 * ```ts
 * const sub = new TiledSubscription({ baseUrl: 'http://localhost:8000/api/v1', path: 'run/primary/internal' });
 * const off = sub.onMessage((m) => { if (m.type === 'table-data') plot(m.payload); });
 * sub.connect();
 * // later
 * off();
 * sub.disconnect();
 * ```
 *
 * Behaviour worth knowing:
 *
 * - **Auth is a first frame.** When an API key or access token is configured, the socket sends
 *   `{"type": "auth", …}` as soon as it opens. A server that requires auth waits for that frame. A
 *   server that allows anonymous reads never reads it, so sending it there does no harm. Close 4001
 *   or 4003 means the credentials were rejected, and the subscription does not retry with the same
 *   bad key.
 * - **Reconnects resume at `lastSequence + 1`.** Tiled's `start` is inclusive, so this replays exactly
 *   the gap, as far back as the server's streaming cache retains it. A message whose sequence is at or
 *   below the last one delivered is dropped. The one exception is the first sequenced message on a new
 *   connection: if that one is at or below `lastSequence`, the server's counter was reset (a restart
 *   with an in-memory cache, or a stream that closed and reopened), so it starts a new epoch and is
 *   delivered. Without this, every later event would be silently swallowed.
 * - **The schema message is re-sent on every connection** and is always delivered, so a consumer can
 *   treat it as "(re)connected, here is the current structure".
 * - **A server close with 1000 ends the subscription.** Tiled sends it when the producer closes the
 *   stream, so reconnecting would only wait on a stream that is finished.
 * - **No outbound traffic** after the auth frame. The server ignores client frames and has no
 *   application-level ping.
 */
export class TiledSubscription {
    readonly path: string;

    private readonly config: TiledSubscriptionConfig;
    private readonly openSocket: TiledSocketFactory;

    private socket: WebSocketLike | null = null;
    private status: TiledConnectionStatus = 'idle';
    private lastSequence: number | undefined;
    private closedByUser = false;
    private attempt = 0;
    private dropped = 0;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    /** Whether the current connection has delivered a sequenced message yet (see the epoch rule). */
    private sawSequenceThisConnection = false;

    private readonly messageListeners = new Set<(message: TiledStreamMessage) => void>();
    private readonly statusListeners = new Set<(status: TiledConnectionStatus) => void>();
    private readonly errorListeners = new Set<(error: TiledSubscriptionError) => void>();

    constructor(config: TiledSubscriptionConfig) {
        this.config = config;
        this.path = config.path;
        this.openSocket =
            config.socketFactory ??
            ((url: string) => new WebSocket(url) as unknown as WebSocketLike);
    }

    // #region public API

    /** Open the socket. Does nothing while a socket is already open or connecting. */
    connect(): void {
        this.closedByUser = false;
        if (this.socket) return;
        this.clearReconnectTimer();
        this.open();
    }

    /** Close for good. No reconnect follows until `connect()` is called again. */
    disconnect(): void {
        this.closedByUser = true;
        this.clearReconnectTimer();
        this.detachSocket(TILED_WS_CLOSE.NORMAL);
        this.setStatus('closed');
    }

    /** Drop the current socket and connect again now, resetting the backoff. Replay still applies. */
    reconnect(): void {
        this.closedByUser = false;
        this.clearReconnectTimer();
        this.attempt = 0;
        this.detachSocket(TILED_WS_CLOSE.NORMAL);
        this.open();
    }

    onMessage(listener: (message: TiledStreamMessage) => void): Unsubscribe {
        this.messageListeners.add(listener);
        return () => {
            this.messageListeners.delete(listener);
        };
    }

    /** Calling this immediately replays the current status to the new listener. */
    onStatus(listener: (status: TiledConnectionStatus) => void): Unsubscribe {
        this.statusListeners.add(listener);
        listener(this.status);
        return () => {
            this.statusListeners.delete(listener);
        };
    }

    onError(listener: (error: TiledSubscriptionError) => void): Unsubscribe {
        this.errorListeners.add(listener);
        return () => {
            this.errorListeners.delete(listener);
        };
    }

    getStatus(): TiledConnectionStatus {
        return this.status;
    }

    /** The highest sequence delivered so far, or `undefined` before the first sequenced message. */
    getLastSequence(): number | undefined {
        return this.lastSequence;
    }

    /** Frames dropped because they were not a recognised message. Duplicates are not counted. */
    getDroppedCount(): number {
        return this.dropped;
    }

    // #endregion

    // #region connection

    private open(): void {
        this.setStatus(this.attempt > 0 ? 'reconnecting' : 'connecting');
        this.sawSequenceThisConnection = false;

        const url = buildTiledWebSocketUrl(this.config.baseUrl, this.config.path, {
            envelopeFormat: this.config.envelopeFormat,
            start: this.lastSequence !== undefined ? this.lastSequence + 1 : this.config.start,
        });

        let ws: WebSocketLike;
        try {
            ws = this.openSocket(url);
        } catch (error) {
            this.emitError({ kind: 'transport', message: describeError(error) });
            this.scheduleReconnect();
            return;
        }
        this.socket = ws;

        ws.onopen = () => {
            const auth = this.authFrame();
            if (!auth) return;
            try {
                ws.send(JSON.stringify(auth));
            } catch (error) {
                this.emitError({ kind: 'auth', message: describeError(error) });
            }
        };

        ws.onmessage = (event) => {
            if (this.socket !== ws) return;
            if (this.status !== 'connected') {
                this.attempt = 0;
                this.setStatus('connected');
            }
            const message = parseTiledStreamMessage(event.data);
            if (!message) {
                this.dropped += 1;
                this.emitError({
                    kind: 'parse',
                    message:
                        typeof event.data === 'string'
                            ? 'Dropped a frame that is not a known Tiled stream message.'
                            : 'Dropped a binary frame; only JSON envelopes are decoded.',
                });
                return;
            }
            if (!this.acceptSequence(message)) return;
            this.dispatch(message);
        };

        // Browsers give no detail on `error`, and a `close` with the code always follows, so the
        // error is reported once, from onclose.
        ws.onerror = () => {};

        ws.onclose = (event) => {
            if (this.socket !== ws) return;
            this.socket = null;
            if (this.closedByUser) {
                this.setStatus('closed');
                return;
            }

            const code = event?.code;
            if (code === TILED_WS_CLOSE.BAD_AUTH_MESSAGE || code === TILED_WS_CLOSE.AUTH_FAILED) {
                this.emitError({
                    kind: 'auth',
                    code,
                    message:
                        code === TILED_WS_CLOSE.AUTH_FAILED
                            ? 'Tiled rejected the credentials (close 4003).'
                            : `Tiled expected an auth frame (close 4001${event.reason ? `: ${event.reason}` : ''}).`,
                });
                this.setStatus('error');
                return;
            }

            if (code === TILED_WS_CLOSE.NORMAL) {
                // The producer ended the stream. A future stream on this node restarts its
                // sequence at 1, so forget ours.
                this.lastSequence = undefined;
                this.setStatus('closed');
                return;
            }

            this.emitError({
                kind: 'transport',
                code,
                message: `Connection closed unexpectedly (code ${code ?? 'unknown'}).`,
            });
            this.scheduleReconnect();
        };
    }

    private scheduleReconnect(): void {
        if (this.closedByUser || this.config.reconnect === false) {
            this.setStatus('error');
            return;
        }
        const maxAttempts = this.config.maxReconnectAttempts ?? Number.POSITIVE_INFINITY;
        if (this.attempt >= maxAttempts) {
            this.emitError({
                kind: 'reconnect-exhausted',
                message: `Giving up after ${this.attempt} reconnect attempts.`,
            });
            this.setStatus('error');
            return;
        }

        const initial = this.config.reconnectDelay ?? 1000;
        const ceiling = this.config.maxReconnectDelay ?? 30_000;
        const base = Math.min(ceiling, initial * 2 ** this.attempt);
        const delay = Math.max(0, Math.round(base + base * JITTER * (Math.random() * 2 - 1)));

        this.attempt += 1;
        this.setStatus('reconnecting');
        this.clearReconnectTimer();
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (!this.closedByUser) this.open();
        }, delay);
    }

    /** Close the current socket without letting its late events touch this subscription. */
    private detachSocket(code: number): void {
        const current = this.socket;
        if (!current) return;
        this.socket = null;
        current.onopen = null;
        current.onmessage = null;
        current.onerror = null;
        current.onclose = null;
        try {
            current.close(code);
        } catch {
            // Already closing.
        }
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private authFrame(): Record<string, string> | null {
        if (this.config.accessToken) return { type: 'auth', access_token: this.config.accessToken };
        if (this.config.apiKey) return { type: 'auth', api_key: this.config.apiKey };
        return null;
    }

    // #endregion

    // #region dispatch

    /** The sequence rules from the class docs. Returns whether to deliver the message. */
    private acceptSequence(message: TiledStreamMessage): boolean {
        if (isTiledSchemaMessage(message)) return true;
        const { sequence } = message;
        const firstOnConnection = !this.sawSequenceThisConnection;
        this.sawSequenceThisConnection = true;

        if (this.lastSequence !== undefined && sequence <= this.lastSequence) {
            if (!firstOnConnection) return false;
            // The server's counter went backwards between connections: a new epoch.
        }
        this.lastSequence = sequence;
        return true;
    }

    private dispatch(message: TiledStreamMessage): void {
        for (const listener of this.messageListeners) {
            try {
                listener(message);
            } catch (error) {
                console.error(`[tiled-ws ${this.path || '/'}] message listener threw:`, error);
            }
        }
    }

    private setStatus(next: TiledConnectionStatus): void {
        if (this.status === next) return;
        this.status = next;
        for (const listener of this.statusListeners) {
            try {
                listener(next);
            } catch (error) {
                console.error(`[tiled-ws ${this.path || '/'}] status listener threw:`, error);
            }
        }
    }

    private emitError(error: TiledSubscriptionError): void {
        for (const listener of this.errorListeners) {
            try {
                listener(error);
            } catch (listenerError) {
                console.error(
                    `[tiled-ws ${this.path || '/'}] error listener threw:`,
                    listenerError,
                );
            }
        }
    }

    // #endregion
}

function describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
