import { OphydTransportStatus, Unsubscribe } from './types';
/**
 * Structural shape shared by {@link OphydPVTransport} and
 * {@link OphydDeviceTransport}. Both differ only in their message types, so the
 * fallback wrapper is written once against this generic interface.
 */
interface GenericTransport<TOut, TIn> {
    send(message: TOut): void;
    onMessage(listener: (message: TIn) => void): Unsubscribe;
    onStatus(listener: (status: OphydTransportStatus) => void): Unsubscribe;
    close(): void;
}
export interface CreateFallbackTransportOptions<TOut> {
    /**
     * Extract the subscription key from an outgoing message so it can be
     * replayed onto the fallback after a switch. Defaults to `pv ?? device`.
     */
    getSubKey?: (message: TOut) => string;
}
/**
 * Wrap a `primary` transport so that, if it reports `'error'` or `'closed'`,
 * the wrapper seamlessly switches to a freshly-constructed fallback transport
 * (typically the real WebSocket backend) without changing its own object
 * identity.
 *
 * Identity stability is the whole point: hooks key their subscribe effect on
 * the transport object, so swapping the underlying transport here — rather than
 * swapping the context value — means consumers never tear down and re-subscribe.
 * The wrapper replays active subscriptions onto the fallback and forwards its
 * messages to the listeners the hooks already registered.
 *
 * Trigger is status-only: a `'connecting'` -> `'open'` primary stays primary.
 * The primary's terminal `'error'`/`'closed'` is suppressed from consumers; the
 * fallback's status supersedes it from the switch onward.
 */
export declare function createFallbackTransport<TOut, TIn>(primary: GenericTransport<TOut, TIn>, makeFallback: () => GenericTransport<TOut, TIn>, options?: CreateFallbackTransportOptions<TOut>): GenericTransport<TOut, TIn>;
export {};
//# sourceMappingURL=createFallbackTransport.d.ts.map