import { TiledConnectionStatus, TiledSocketFactory, TiledStreamMessage, TiledSubscriptionError, TiledSubscriptionOptions } from '../client/websocket/types';
export interface UseTiledSubscriptionOptions extends TiledSubscriptionOptions {
    /** `false` keeps the socket closed and leaves the hook `idle`. Default `true`. */
    enabled?: boolean;
    /** Called for every delivered message. The latest function is always used; it need not be stable. */
    onMessage?: (message: TiledStreamMessage) => void;
    onStatus?: (status: TiledConnectionStatus) => void;
    onError?: (error: TiledSubscriptionError) => void;
    /**
     * Mirror every message into `lastMessage` and `sequence` state, re-rendering once per message.
     * Default `true`.
     *
     * Turn this off for high-frequency streams and use `onMessage` instead. `sequence` is then only
     * refreshed when the status changes.
     */
    trackLastMessage?: boolean;
    /** Override the socket constructor, mainly for tests. Read when the socket opens. */
    socketFactory?: TiledSocketFactory;
}
export interface UseTiledSubscriptionResult {
    status: TiledConnectionStatus;
    lastMessage?: TiledStreamMessage;
    /** The highest sequence delivered. See `trackLastMessage` for how often it updates. */
    sequence?: number;
    /** The most recent error. Cleared on reconnect and when the subscription target changes. */
    error?: TiledSubscriptionError;
    /** Close the socket. It stays closed until `reconnect()` is called or the inputs change. */
    disconnect(): void;
    /** Reconnect now, resuming from the last sequence when the server can replay it. */
    reconnect(): void;
}
/**
 * Subscribe to one Tiled node's stream for the lifetime of a component.
 *
 * ```tsx
 * const { status, lastMessage } = useTiledSubscription('run-id/primary/internal');
 *
 * useTiledSubscription(path, {
 *     trackLastMessage: false,
 *     onMessage(message) {
 *         if (message.type === 'table-data') chart.append(message.payload);
 *     },
 * });
 * ```
 *
 * Connects with the same URL, `initialPath` and credentials as the HTTP hooks (`FinchConfigProvider`,
 * or a client injected through `TiledApiProvider`). A new socket is opened when the path, URL,
 * credentials, `envelopeFormat`, `start`, reconnect options or `enabled` change, and closed on
 * unmount.
 *
 * This is a stream, not a query, and it takes no part in the TanStack cache. To keep HTTP data fresh,
 * invalidate it from a callback, for example with `useTiledInvalidate().roots('search')`.
 *
 * The typed wrappers `useTiledContainerSubscription`, `useTiledTableSubscription` and
 * `useTiledArraySubscription` are usually the more convenient entry points.
 */
export declare function useTiledSubscription(path: string, options?: UseTiledSubscriptionOptions): UseTiledSubscriptionResult;
//# sourceMappingURL=useTiledSubscription.d.ts.map