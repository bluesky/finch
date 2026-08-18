/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';
import type { TiledClientLike } from './clientLike';

const TiledApiContext = createContext<TiledClientLike | null>(null);

export interface TiledApiProviderProps {
    /**
     * The client every descendant will use — a real `TiledApiClient` from `@blueskyproject/tiled`, or
     * any object satisfying `TiledClientLike`.
     *
     * Must be stable across renders: build it at module scope or in a `useMemo`. An unstable client
     * changes the resolved cache scope on every render.
     */
    client: TiledClientLike;
    children: ReactNode;
}

/**
 * Supplies a Tiled client to a subtree.
 *
 * Without it, the hooks in `@/api/tiled_new` use the package's module-level singleton
 * (`getDefaultTiledApiClient()`), configured from `FinchConfigProvider`. With it, they use the client
 * given here and never redirect it — an injected client is the caller's explicit choice, so Finch
 * config is ignored for that subtree.
 *
 * This is the seam the legacy `src/api/tiled/hooks.ts` lacks, and the reason those hooks cannot be
 * driven by a stub in a test or a story.
 *
 * ```tsx
 * const client = new TiledApiClient({ baseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1' });
 *
 * <QueryClientProvider client={queryClient}>
 *     <TiledApiProvider client={client}>
 *         <YourApp />
 *     </TiledApiProvider>
 * </QueryClientProvider>;
 * ```
 */
export function TiledApiProvider({ client, children }: TiledApiProviderProps) {
    return <TiledApiContext.Provider value={client}>{children}</TiledApiContext.Provider>;
}

/** The injected Tiled client. Throws outside a provider. */
export function useTiledApiClient(): TiledClientLike {
    const client = useContext(TiledApiContext);
    if (!client) {
        throw new Error('useTiledApiClient called outside <TiledApiProvider>');
    }
    return client;
}

/**
 * The injected Tiled client, or `null` when no provider is present.
 *
 * This is what `hooks/useTiledClient.ts` calls: no provider means fall back to the package singleton
 * rather than fail.
 */
export function useTiledApiClientOptional(): TiledClientLike | null {
    return useContext(TiledApiContext);
}
