import type { OphydTransportStatus, Unsubscribe } from './types';

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

/** Outgoing messages carry an `action`; subscriptions also carry a key field. */
type SubscribeAction = 'subscribe' | 'subscribeSafely' | 'subscribeReadOnly';
interface ActionMessage {
    action: string;
    pv?: string;
    device?: string;
}

const SUBSCRIBE_ACTIONS: ReadonlySet<string> = new Set<SubscribeAction>([
    'subscribe',
    'subscribeSafely',
    'subscribeReadOnly',
]);

/** Default key extraction for the PV/device protocols: prefer `pv`, then `device`. */
function defaultSubKey(message: ActionMessage): string {
    return message.pv ?? message.device ?? '';
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
export function createFallbackTransport<TOut, TIn>(
    primary: GenericTransport<TOut, TIn>,
    makeFallback: () => GenericTransport<TOut, TIn>,
    options: CreateFallbackTransportOptions<TOut> = {},
): GenericTransport<TOut, TIn> {
    const getSubKey =
        options.getSubKey ?? ((m: TOut) => defaultSubKey(m as unknown as ActionMessage));

    const messageListeners = new Set<(message: TIn) => void>();
    const statusListeners = new Set<(status: OphydTransportStatus) => void>();
    // Last subscribe message per key, so we can replay them onto the fallback.
    const activeSubs = new Map<string, TOut>();

    let active: GenericTransport<TOut, TIn> = primary;
    let status: OphydTransportStatus = 'connecting';
    let switched = false;
    let closedByUser = false;

    let detachPrimaryMessage: Unsubscribe | undefined;
    let detachPrimaryStatus: Unsubscribe | undefined;

    const forwardMessage = (message: TIn): void => {
        for (const listener of messageListeners) {
            try {
                listener(message);
            } catch (err) {
                console.error('[ophyd-fallback-transport] message listener threw:', err);
            }
        }
    };

    const setStatus = (next: OphydTransportStatus): void => {
        status = next;
        for (const listener of statusListeners) {
            try {
                listener(next);
            } catch (err) {
                console.error('[ophyd-fallback-transport] status listener threw:', err);
            }
        }
    };

    const switchToFallback = (): void => {
        switched = true;

        // Detach from the primary and tear it down so it stops emitting.
        detachPrimaryMessage?.();
        detachPrimaryStatus?.();
        try {
            primary.close();
        } catch (err) {
            console.error('[ophyd-fallback-transport] primary close threw:', err);
        }

        active = makeFallback();
        active.onMessage(forwardMessage);
        active.onStatus(setStatus);

        // Replay active subscriptions so the fallback backend re-emits meta/value
        // to the listeners the hooks already registered.
        for (const message of activeSubs.values()) {
            active.send(message);
        }
    };

    const onPrimaryStatus = (next: OphydTransportStatus): void => {
        if (!switched && !closedByUser && (next === 'error' || next === 'closed')) {
            switchToFallback();
            return;
        }
        // Pass through non-terminal primary status (e.g. connecting -> open).
        if (!switched) setStatus(next);
    };

    detachPrimaryMessage = primary.onMessage(forwardMessage);
    detachPrimaryStatus = primary.onStatus(onPrimaryStatus);

    return {
        send(message) {
            if (closedByUser) return;
            const m = message as unknown as ActionMessage;
            if (SUBSCRIBE_ACTIONS.has(m.action)) {
                activeSubs.set(getSubKey(message), message);
            } else if (m.action === 'unsubscribe') {
                activeSubs.delete(getSubKey(message));
            }
            active.send(message);
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
            closedByUser = true;
            try {
                active.close();
            } catch (err) {
                console.error('[ophyd-fallback-transport] active close threw:', err);
            }
        },
    };
}
