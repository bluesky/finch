/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';
import type { WebSocketLike } from '@/api/qServer/sockets/types';
import type { QServerClientLike } from './clientLike';

const QServerApiContext = createContext<QServerClientLike | null>(null);

/**
 * Builds the websocket a queue-server socket hook should use.
 *
 * Kept in a separate context from the client so neither needs memoizing, and so a consumer that
 * only wants one of them does not re-render when the other changes.
 */
export type QServerSocketFactory = (url: string) => WebSocketLike;

const QServerSocketFactoryContext = createContext<QServerSocketFactory | null>(null);

export interface QServerApiProviderProps {
    /**
     * The client every descendant will use — a real `QServerApiClient`, a simulator client from
     * `@/lib/qserver-sim`, or any object satisfying `QServerClientLike`.
     *
     * Must be stable across renders: build it at module scope or in a `useMemo`.
     */
    client: QServerClientLike;
    /**
     * Optional websocket factory for the status/console/info hooks. Supply the simulator's factory
     * to run sockets without a server; omit it and the hooks open real websockets.
     *
     * Must also be stable across renders.
     */
    socketFactory?: QServerSocketFactory;
    children: ReactNode;
}

/**
 * Supplies the queue-server client (and optionally a websocket factory) to a subtree.
 *
 * This is the seam that lets the same components run against a live server, against the
 * simulator in Storybook, and against a stub in tests, without any of them knowing which. The
 * context values are the client and factory themselves, so no memoization is needed here —
 * stability is the caller's contract, as documented on the props.
 *
 * The TanStack Query hooks in `@/api/qServer/hooks` read the client from here (see
 * `hooks/useQServerClient.ts`) rather than constructing their own.
 */
export function QServerApiProvider({ client, socketFactory, children }: QServerApiProviderProps) {
    return (
        <QServerApiContext.Provider value={client}>
            <QServerSocketFactoryContext.Provider value={socketFactory ?? null}>
                {children}
            </QServerSocketFactoryContext.Provider>
        </QServerApiContext.Provider>
    );
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

/**
 * The websocket factory to hand to a socket hook, or `undefined` to let it open a real websocket.
 *
 * ```tsx
 * const socketFactory = useQServerSocketFactory();
 * const { text } = useQServerConsoleSocket({ socketFactory, enabled });
 * ```
 */
export function useQServerSocketFactory(): QServerSocketFactory | undefined {
    return useContext(QServerSocketFactoryContext) ?? undefined;
}
