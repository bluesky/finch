import { TiledConnectionStatus, TiledStreamMessage, TiledSubscriptionConfig, TiledSubscriptionError, Unsubscribe } from './types';
/** Close codes Tiled's `/stream/single` route uses (see `tiled/server/router.py`). */
export declare const TILED_WS_CLOSE: {
    /** A normal close. From the server it means the producer ended the stream. */
    readonly NORMAL: 1000;
    /** The first frame was not valid JSON, or not `{"type": "auth", …}`. */
    readonly BAD_AUTH_MESSAGE: 4001;
    /** The first-frame credentials were rejected. */
    readonly AUTH_FAILED: 4003;
};
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
export declare class TiledSubscription {
    readonly path: string;
    private readonly config;
    private readonly openSocket;
    private socket;
    private status;
    private lastSequence;
    private closedByUser;
    private attempt;
    private dropped;
    private reconnectTimer;
    /** Whether the current connection has delivered a sequenced message yet (see the epoch rule). */
    private sawSequenceThisConnection;
    private readonly messageListeners;
    private readonly statusListeners;
    private readonly errorListeners;
    constructor(config: TiledSubscriptionConfig);
    /** Open the socket. Does nothing while a socket is already open or connecting. */
    connect(): void;
    /** Close for good. No reconnect follows until `connect()` is called again. */
    disconnect(): void;
    /** Drop the current socket and connect again now, resetting the backoff. Replay still applies. */
    reconnect(): void;
    onMessage(listener: (message: TiledStreamMessage) => void): Unsubscribe;
    /** Calling this immediately replays the current status to the new listener. */
    onStatus(listener: (status: TiledConnectionStatus) => void): Unsubscribe;
    onError(listener: (error: TiledSubscriptionError) => void): Unsubscribe;
    getStatus(): TiledConnectionStatus;
    /** The highest sequence delivered so far, or `undefined` before the first sequenced message. */
    getLastSequence(): number | undefined;
    /** Frames dropped because they were not a recognised message. Duplicates are not counted. */
    getDroppedCount(): number;
    private open;
    private scheduleReconnect;
    /** Close the current socket without letting its late events touch this subscription. */
    private detachSocket;
    private clearReconnectTimer;
    private authFrame;
    /** The sequence rules from the class docs. Returns whether to deliver the message. */
    private acceptSequence;
    private dispatch;
    private setStatus;
    private emitError;
}
//# sourceMappingURL=TiledSubscription.d.ts.map