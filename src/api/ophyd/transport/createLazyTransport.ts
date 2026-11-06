import type { OphydTransportStatus, Unsubscribe } from './types';

/** Structural shape shared by {@link OphydPVTransport} and {@link OphydDeviceTransport}. */
interface GenericTransport<TOut, TIn> {
    send(message: TOut): void;
    onMessage(listener: (message: TIn) => void): Unsubscribe;
    onStatus(listener: (status: OphydTransportStatus) => void): Unsubscribe;
    close(): void;
}

/**
 * Defer building a transport until the first message is sent.
 *
 * The socket hooks always obtain a transport -- hooks cannot be conditional -- even when
 * they have nothing to subscribe to. Building a real WebSocket transport opens a
 * connection immediately, so without this every idle hook call would hold a socket open
 * on the server. Listeners registered before then are attached once it exists; until
 * then status reports `'connecting'`.
 */
export function createLazyTransport<TOut, TIn>(
    create: () => GenericTransport<TOut, TIn>,
): GenericTransport<TOut, TIn> {
    let inner: GenericTransport<TOut, TIn> | null = null;
    let closed = false;
    let status: OphydTransportStatus = 'connecting';
    const messageListeners = new Set<(message: TIn) => void>();
    const statusListeners = new Set<(status: OphydTransportStatus) => void>();

    const notify = <T>(listeners: Set<(value: T) => void>, value: T): void => {
        for (const l of listeners) {
            try {
                l(value);
            } catch (err) {
                console.error('[ophyd-lazy-transport] listener threw:', err);
            }
        }
    };

    const ensureInner = (): GenericTransport<TOut, TIn> => {
        if (inner) return inner;
        inner = create();
        inner.onMessage((message) => notify(messageListeners, message));
        inner.onStatus((next) => {
            status = next;
            notify(statusListeners, next);
        });
        return inner;
    };

    return {
        send(message) {
            if (closed) return;
            ensureInner().send(message);
        },
        onMessage(listener) {
            messageListeners.add(listener);
            return () => messageListeners.delete(listener);
        },
        onStatus(listener) {
            statusListeners.add(listener);
            listener(status);
            return () => statusListeners.delete(listener);
        },
        close() {
            closed = true;
            inner?.close();
        },
    };
}
