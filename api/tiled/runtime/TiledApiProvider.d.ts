import { ReactNode } from '../../../../node_modules/react';
import { TiledClientLike } from './clientLike';
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
 * Without it, the hooks in `@/api/tiled` use the package's module-level singleton
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
export declare function TiledApiProvider({ client, children }: TiledApiProviderProps): import("react/jsx-runtime").JSX.Element;
/** The injected Tiled client. Throws outside a provider. */
export declare function useTiledApiClient(): TiledClientLike;
/**
 * The injected Tiled client, or `null` when no provider is present.
 *
 * This is what `hooks/useTiledClient.ts` calls: no provider means fall back to the package singleton
 * rather than fail.
 */
export declare function useTiledApiClientOptional(): TiledClientLike | null;
//# sourceMappingURL=TiledApiProvider.d.ts.map