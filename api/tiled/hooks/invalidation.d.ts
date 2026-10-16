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
 * The structure was here before any of the writes were; it finally has writes to serve.
 */
export declare const TILED_INVALIDATION_BUNDLES: {
    /** Anything that changes which nodes match a query. */
    readonly search: readonly ["search", "distinct"];
    /** A node's own metadata, and the revision trail that records changes to it. */
    readonly metadata: readonly ["metadata", "revisions"];
    /** The data payloads, across every structure family. */
    readonly data: readonly ["array", "table", "container", "node", "awkward", "ragged"];
    /**
     * A node appeared or disappeared.
     *
     * Wider than `metadata` on purpose: creating, deleting or registering a node changes what a
     * *search* returns and what a parent *container* read contains, not just that node's own entry.
     */
    readonly structure: readonly ["search", "distinct", "metadata", "revisions", "container", "node", "graph"];
    readonly webhooks: readonly ["webhooks"];
    readonly info: readonly ["serverInfo"];
    /** Identity changed. */
    readonly auth: readonly ["auth"];
    /**
     * Anything in the entity/link graph. One root for every graph read, raw documents included —
     * see `TiledGraphKeyArgs` for why the writes cannot be scoped narrower.
     */
    readonly graph: readonly ["graph"];
    /** Everything. Use after any change of identity. */
    readonly all: readonly ["search", "distinct", "metadata", "array", "table", "container", "node", "awkward", "ragged", "revisions", "asset", "webhooks", "serverInfo", "auth", "graph"];
};
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
export declare const TILED_MUTATION_INVALIDATIONS: {
    readonly useTiledCreateNodeMutation: readonly ["structure"];
    readonly useTiledUpdateMetadataMutation: readonly ["metadata", "search"];
    readonly useTiledPatchMetadataMutation: readonly ["metadata", "search"];
    readonly useTiledDeleteNodeMutation: readonly ["structure", "data"];
    readonly useTiledPutArrayFullMutation: readonly ["data", "metadata"];
    readonly useTiledPutArrayBlockMutation: readonly ["data", "metadata"];
    readonly useTiledPatchArrayFullMutation: readonly ["data", "metadata"];
    readonly useTiledPutRaggedFullMutation: readonly ["data", "metadata"];
    readonly useTiledPutRaggedBlockMutation: readonly ["data", "metadata"];
    readonly useTiledPatchRaggedFullMutation: readonly ["data", "metadata"];
    readonly useTiledPutTablePartitionMutation: readonly ["data", "metadata"];
    readonly useTiledPatchTablePartitionMutation: readonly ["data", "metadata"];
    readonly useTiledPutTableFullMutation: readonly ["data", "metadata"];
    readonly useTiledPutNodeFullMutation: readonly ["data", "metadata"];
    readonly useTiledPutAwkwardFullMutation: readonly ["data", "metadata"];
    readonly useTiledRegisterMutation: readonly ["structure"];
    readonly useTiledPutDataSourceMutation: readonly ["structure", "data"];
    readonly useTiledDeleteRevisionMutation: readonly ["metadata"];
    readonly useTiledCloseStreamMutation: readonly ["data", "metadata"];
    readonly useTiledRegisterWebhookMutation: readonly ["webhooks"];
    readonly useTiledDeleteWebhookMutation: readonly ["webhooks"];
    readonly useTiledLoginMutation: readonly ["all"];
    readonly useTiledLogoutMutation: readonly ["all"];
    readonly useTiledCreateApiKeyMutation: readonly ["auth"];
    readonly useTiledRevokeApiKeyMutation: readonly ["auth"];
    readonly useTiledRefreshSessionMutation: readonly ["all"];
    readonly useTiledRevokeSessionMutation: readonly ["all"];
    readonly useTiledGraphQLMutation: readonly ["graph"];
    readonly useTiledCreateGraphEntityMutation: readonly ["graph"];
    readonly useTiledBindGraphEntityMutation: readonly ["graph"];
    readonly useTiledUpdateGraphEntityMutation: readonly ["graph"];
    readonly useTiledDeleteGraphEntityMutation: readonly ["graph"];
    readonly useTiledCreateGraphLinkMutation: readonly ["graph"];
    readonly useTiledUpdateGraphLinkMutation: readonly ["graph"];
    readonly useTiledDeleteGraphLinkMutation: readonly ["graph"];
    readonly useTiledUpsertGraphNamespaceMutation: readonly ["graph"];
    readonly useTiledDeleteGraphNamespaceMutation: readonly ["graph"];
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