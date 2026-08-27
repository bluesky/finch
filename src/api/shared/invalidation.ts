import type { QueryClient, QueryKey } from '@tanstack/react-query';

/**
 * The two pure operations behind every backend's invalidation module.
 *
 * Each backend keeps its own bundle definitions, its own mutation→bundle map and its own
 * `useXInvalidate` hook — those are genuinely per-backend. What is shared is the mechanics: expand
 * bundle names to roots, then invalidate those roots. Each backend re-exports a named wrapper
 * (`invalidateQServerRoots`, `invalidateTiledRoots`) so its public API is unchanged.
 */

/**
 * Expand bundle names to the resource roots they cover, de-duplicated.
 *
 * Bundles exist because the interesting question is "what did this write change", and several
 * mutations answer it identically. Overlap between bundles is normal, hence the `Set`.
 */
export function resolveInvalidationRoots<TBundle extends string, TRoot extends string>(
    bundles: readonly TBundle[],
    definitions: Record<TBundle, readonly TRoot[]>,
): TRoot[] {
    const roots = new Set<TRoot>();
    for (const bundle of bundles) {
        for (const root of definitions[bundle]) roots.add(root);
    }
    return [...roots];
}

/**
 * Invalidate whole resources by name.
 *
 * Awaited by the mutation engines, so `mutateAsync` resolves only once the affected queries have
 * refetched and a caller can read fresh data on the next line. Each root key is a two-element prefix,
 * so this matches that resource across every scope — see `queryKeys.ts` on why the scope is last.
 */
export function invalidateRoots<TRoot extends string>(
    queryClient: QueryClient,
    roots: readonly TRoot[],
    rootKeys: Record<TRoot, QueryKey>,
): Promise<void> {
    return Promise.all(
        roots.map((root) => queryClient.invalidateQueries({ queryKey: rootKeys[root] })),
    ).then(() => undefined);
}
