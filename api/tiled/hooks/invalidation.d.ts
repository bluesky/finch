import { QueryClient } from '@tanstack/react-query';
import { TiledQueryRootName } from './queryKeys';
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
export declare const TILED_INVALIDATION_BUNDLES: {
    readonly search: readonly ["search"];
    readonly metadata: readonly ["metadata"];
    /** Array and table reads — the actual data payloads. */
    readonly data: readonly ["array", "table"];
    readonly info: readonly ["serverInfo"];
    /** Everything. Use after any change of identity. */
    readonly all: readonly ["search", "metadata", "array", "table", "serverInfo"];
};
export type TiledInvalidationBundleName = keyof typeof TILED_INVALIDATION_BUNDLES;
/**
 * Bundles each mutation hook invalidates on success.
 *
 * Login invalidates everything: what a caller is allowed to see changes with the credentials, so every
 * cached read — including a search that legitimately returned nothing — is now suspect. Credentials are
 * deliberately absent from the query keys (a secret does not belong in the Devtools cache inspector),
 * which is exactly why the change has to be handled by invalidating rather than by re-keying.
 */
export declare const TILED_MUTATION_INVALIDATIONS: {
    readonly useTiledLoginMutation: readonly ["all"];
};
export type TiledMutationHookName = keyof typeof TILED_MUTATION_INVALIDATIONS;
/** Expand bundle names to the resource roots they cover, de-duplicated. */
export declare function resolveInvalidationRoots(bundles: readonly TiledInvalidationBundleName[]): TiledQueryRootName[];
/**
 * Invalidate whole resources by name.
 *
 * Awaited by the mutation hooks, so `mutateAsync` resolves only once the affected queries have
 * refetched — a caller can read fresh data immediately afterwards.
 */
export declare function invalidateTiledRoots(queryClient: QueryClient, roots: readonly TiledQueryRootName[]): Promise<void>;
/**
 * Invalidate every Tiled query.
 *
 * The right response to logging in or out, or to changing the API key: auth is read at request time
 * and is not part of any query key, so a credential change invalidates everything rather than one
 * entry.
 */
export declare function invalidateAllTiledQueries(queryClient: QueryClient): Promise<void>;
/** Imperative invalidation, for components that need to refresh outside a mutation. */
export declare function useTiledInvalidate(): {
    roots: (...names: TiledQueryRootName[]) => Promise<void>;
    bundles: (...names: TiledInvalidationBundleName[]) => Promise<void>;
    all: () => Promise<void>;
};
//# sourceMappingURL=invalidation.d.ts.map