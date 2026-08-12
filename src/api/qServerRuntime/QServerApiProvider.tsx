/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';
import type { QServerClientLike } from './clientLike';

const QServerApiContext = createContext<QServerClientLike | null>(null);

export interface QServerApiProviderProps {
    /**
     * The client every descendant will use — a real `QServerApiClient`, a simulator client from
     * `@/lib/qserver-sim`, or any object satisfying `QServerClientLike`.
     *
     * Must be stable across renders: build it at module scope or in a `useMemo`.
     */
    client: QServerClientLike;
    children: ReactNode;
}

/**
 * Supplies the queue-server client to a subtree.
 *
 * This is the seam that lets the same components run against a live server, against the
 * simulator in Storybook, and against a stub in tests, without any of them knowing which. The
 * context value is the client itself, so no memoization is needed here — stability is the
 * caller's contract, as documented on the prop.
 *
 * TanStack Query hooks will later read the client from here rather than constructing their own.
 */
export function QServerApiProvider({ client, children }: QServerApiProviderProps) {
    return <QServerApiContext.Provider value={client}>{children}</QServerApiContext.Provider>;
}

/** The queue-server client. Throws outside a provider. */
export function useQServerApiClient(): QServerClientLike {
    const client = useContext(QServerApiContext);
    if (!client) {
        throw new Error('useQServerApiClient called outside <QServerApiProvider>');
    }
    return client;
}

/** The queue-server client, or `null` when no provider is present. */
export function useQServerApiClientOptional(): QServerClientLike | null {
    return useContext(QServerApiContext);
}
