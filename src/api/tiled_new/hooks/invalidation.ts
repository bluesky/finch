import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { TILED_QUERY_ROOT, tiledQueryRoots, type TiledQueryRootName } from './queryKeys';

/**
 * Which queries each mutation refreshes.
 *
 * Grouped into named **bundles** rather than listing roots per mutation, because the interesting
 * question is "what did this write change" and several writes answer it identically. Invalidation
 * matches the resource prefix and ignores the scope, so it refreshes that resource on every server —
 * over-invalidating a multi-server app is far cheaper than serving it stale data.
 *
 * This version of `@blueskyproject/tiled` exposes no write endpoints, so the only mutation is login.
 * The structure is here anyway, ready for the POST endpoints when they land.
 */
export const TILED_INVALIDATION_BUNDLES = {
    search: ['search'],
    metadata: ['metadata'],
    /** Array and table reads — the actual data payloads. */
    data: ['array', 'table'],
    info: ['serverInfo'],
    /** Everything. Use after any change of identity. */
    all: ['search', 'metadata', 'array', 'table', 'serverInfo'],
} as const satisfies Record<string, readonly TiledQueryRootName[]>;

export type TiledInvalidationBundleName = keyof typeof TILED_INVALIDATION_BUNDLES;

/**
 * Bundles each mutation hook invalidates on success.
 *
 * Login invalidates everything: what a caller is allowed to see changes with the credentials, so every
 * cached read — including a search that legitimately returned nothing — is now suspect. Credentials are
 * deliberately absent from the query keys (a secret does not belong in the Devtools cache inspector),
 * which is exactly why the change has to be handled by invalidating rather than by re-keying.
 */
export const TILED_MUTATION_INVALIDATIONS = {
    useTiledLoginMutation: ['all'],
} as const satisfies Record<string, readonly TiledInvalidationBundleName[]>;

export type TiledMutationHookName = keyof typeof TILED_MUTATION_INVALIDATIONS;

/** Expand bundle names to the resource roots they cover, de-duplicated. */
export function resolveInvalidationRoots(
    bundles: readonly TiledInvalidationBundleName[],
): TiledQueryRootName[] {
    const roots = new Set<TiledQueryRootName>();
    for (const bundle of bundles) {
        for (const root of TILED_INVALIDATION_BUNDLES[bundle]) roots.add(root);
    }
    return [...roots];
}

/**
 * Invalidate whole resources by name.
 *
 * Awaited by the mutation hooks, so `mutateAsync` resolves only once the affected queries have
 * refetched — a caller can read fresh data immediately afterwards.
 */
export function invalidateTiledRoots(
    queryClient: QueryClient,
    roots: readonly TiledQueryRootName[],
): Promise<void> {
    return Promise.all(
        roots.map((root) => queryClient.invalidateQueries({ queryKey: tiledQueryRoots[root] })),
    ).then(() => undefined);
}

/**
 * Invalidate every Tiled query.
 *
 * The right response to logging in or out, or to changing the API key: auth is read at request time
 * and is not part of any query key, so a credential change invalidates everything rather than one
 * entry.
 */
export function invalidateAllTiledQueries(queryClient: QueryClient): Promise<void> {
    return queryClient.invalidateQueries({ queryKey: [TILED_QUERY_ROOT] });
}

/** Imperative invalidation, for components that need to refresh outside a mutation. */
export function useTiledInvalidate(): {
    roots: (...names: TiledQueryRootName[]) => Promise<void>;
    bundles: (...names: TiledInvalidationBundleName[]) => Promise<void>;
    all: () => Promise<void>;
} {
    const queryClient = useQueryClient();

    const roots = useCallback(
        (...names: TiledQueryRootName[]) => invalidateTiledRoots(queryClient, names),
        [queryClient],
    );
    const bundles = useCallback(
        (...names: TiledInvalidationBundleName[]) =>
            invalidateTiledRoots(queryClient, resolveInvalidationRoots(names)),
        [queryClient],
    );
    const all = useCallback(() => invalidateAllTiledQueries(queryClient), [queryClient]);

    return useMemo(() => ({ roots, bundles, all }), [roots, bundles, all]);
}
