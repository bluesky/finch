import { ReactNode } from '../../../node_modules/react';
import { WebSocketLike } from '../qServer/sockets/types';
import { QServerClientLike } from './clientLike';
/**
 * Builds the websocket a queue-server socket hook should use.
 *
 * Kept in a separate context from the client so neither needs memoizing, and so a consumer that
 * only wants one of them does not re-render when the other changes.
 */
export type QServerSocketFactory = (url: string) => WebSocketLike;
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
export declare function QServerApiProvider({ client, socketFactory, children }: QServerApiProviderProps): import("react/jsx-runtime").JSX.Element;
/** The queue-server client. Throws outside a provider. */
export declare function useQServerApiClient(): QServerClientLike;
/** The queue-server client, or `null` when no provider is present. */
export declare function useQServerApiClientOptional(): QServerClientLike | null;
/**
 * The websocket factory to hand to a socket hook, or `undefined` to let it open a real websocket.
 *
 * ```tsx
 * const socketFactory = useQServerSocketFactory();
 * const { text } = useQServerConsoleSocket({ socketFactory, enabled });
 * ```
 */
export declare function useQServerSocketFactory(): QServerSocketFactory | undefined;
//# sourceMappingURL=QServerApiProvider.d.ts.map