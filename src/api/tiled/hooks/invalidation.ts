import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
    invalidateRoots,
    resolveInvalidationRoots as resolveRoots,
} from '@/api/shared/invalidation';
import { TILED_QUERY_ROOT, tiledQueryRoots, type TiledQueryRootName } from './queryKeys';

/**
 * Which queries each mutation refreshes.
 *
 * Grouped into named **bundles** rather than listing roots per mutation, because the interesting
 * question is "what did this write change" and several writes answer it identically. Invalidation
 * matches the resource prefix and ignores the scope, so it refreshes that resource on every server —
 * over-invalidating a multi-server app is far cheaper than serving it stale data.
 *
 * The structure was here before any of the writes were; it finally has writes to serve.
 */
export const TILED_INVALIDATION_BUNDLES = {
    /** Anything that changes which nodes match a query. */
    search: ['search', 'distinct'],
    /** A node's own metadata, and the revision trail that records changes to it. */
    metadata: ['metadata', 'revisions'],
    /** The data payloads, across every structure family. */
    data: ['array', 'table', 'container', 'node', 'awkward', 'ragged'],
    /**
     * A node appeared or disappeared.
     *
     * Wider than `metadata` on purpose: creating, deleting or registering a node changes what a
     * *search* returns and what a parent *container* read contains, not just that node's own entry.
     */
    structure: ['search', 'distinct', 'metadata', 'revisions', 'container', 'node'],
    webhooks: ['webhooks'],
    info: ['serverInfo'],
    /** Identity changed. */
    auth: ['auth'],
    /** Everything. Use after any change of identity. */
    all: [
        'search',
        'distinct',
        'metadata',
        'array',
        'table',
        'container',
        'node',
        'awkward',
        'ragged',
        'revisions',
        'asset',
        'webhooks',
        'serverInfo',
        'auth',
    ],
} as const satisfies Record<string, readonly TiledQueryRootName[]>;

export type TiledInvalidationBundleName = keyof typeof TILED_INVALIDATION_BUNDLES;

/**
 * Bundles each mutation hook invalidates on success.
 *
 * Three rules decide these:
 *
 * - **A metadata write** refreshes that node and the searches that could have matched on what
 *   changed. A caller who renames a run expects the run list to agree.
 * - **A data write** refreshes the data *and* the metadata, because a write can change a structure —
 *   `patchArrayFull` with `extend: true` grows the array's shape, and a cached structure that still
 *   says otherwise is what the downsampling maths reads.
 * - **A create, delete or register** uses `structure`, which also covers the parent container's
 *   contents.
 *
 * Every auth mutation invalidates everything: what a caller is allowed to see changes with their
 * credentials, so every cached read — including a search that legitimately returned nothing — is now
 * suspect. Credentials are deliberately absent from the query keys, which is exactly why this has to
 * be handled by invalidating rather than by re-keying.
 */
export const TILED_MUTATION_INVALIDATIONS = {
    // metadata
    useTiledCreateNodeMutation: ['structure'],
    useTiledUpdateMetadataMutation: ['metadata', 'search'],
    useTiledPatchMetadataMutation: ['metadata', 'search'],
    useTiledDeleteNodeMutation: ['structure', 'data'],
    // arrays
    useTiledPutArrayFullMutation: ['data', 'metadata'],
    useTiledPutArrayBlockMutation: ['data', 'metadata'],
    useTiledPatchArrayFullMutation: ['data', 'metadata'],
    // ragged
    useTiledPutRaggedFullMutation: ['data', 'metadata'],
    useTiledPutRaggedBlockMutation: ['data', 'metadata'],
    useTiledPatchRaggedFullMutation: ['data', 'metadata'],
    // tables
    useTiledPutTablePartitionMutation: ['data', 'metadata'],
    useTiledPatchTablePartitionMutation: ['data', 'metadata'],
    useTiledPutTableFullMutation: ['data', 'metadata'],
    // nodes and awkward
    useTiledPutNodeFullMutation: ['data', 'metadata'],
    useTiledPutAwkwardFullMutation: ['data', 'metadata'],
    // registration and data sources
    useTiledRegisterMutation: ['structure'],
    useTiledPutDataSourceMutation: ['structure', 'data'],
    // revisions
    useTiledDeleteRevisionMutation: ['metadata'],
    // streams
    useTiledCloseStreamMutation: ['data', 'metadata'],
    // webhooks
    useTiledRegisterWebhookMutation: ['webhooks'],
    useTiledDeleteWebhookMutation: ['webhooks'],
    // auth
    useTiledLoginMutation: ['all'],
    useTiledLogoutMutation: ['all'],
    useTiledCreateApiKeyMutation: ['auth'],
    useTiledRevokeApiKeyMutation: ['auth'],
    useTiledRefreshSessionMutation: ['all'],
    useTiledRevokeSessionMutation: ['all'],
} as const satisfies Record<string, readonly TiledInvalidationBundleName[]>;

export type TiledMutationHookName = keyof typeof TILED_MUTATION_INVALIDATIONS;

/** Expand bundle names to the resource roots they cover, de-duplicated. */
export function resolveInvalidationRoots(
    bundles: readonly TiledInvalidationBundleName[],
): TiledQueryRootName[] {
    return resolveRoots(bundles, TILED_INVALIDATION_BUNDLES);
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
    return invalidateRoots(queryClient, roots, tiledQueryRoots);
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
