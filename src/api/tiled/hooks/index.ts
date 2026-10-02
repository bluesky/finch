/**
 * TanStack Query hooks for Tiled — one per operation.
 *
 * ```tsx
 * import { useTiledSearchBySpecsQuery, useTiledMetadataQuery } from '@/api/tiled';
 *
 * const runs = useTiledSearchBySpecsQuery('experiments', { include: ['BlueskyRun'], exclude: [] });
 * const item = useTiledMetadataQuery(selectedPath ?? '');
 * ```
 *
 * Arguments are positional and always in the same order: the endpoint's own arguments, then TanStack
 * options, then `requestOptions` — transport last, because it is the rarest thing to pass. The array,
 * table and node hooks carry an extra endpoint slot (`arrayOptions` / `tableOptions` /
 * `nodeOptions`), since the client's own option types merge endpoint parameters with transport and
 * these do not. See `../README.md` for the full contract, and `@/api/shared/queryOptions` for the
 * cross-backend convention.
 *
 * Mutations take their arguments through `mutate(variables)`, so one hook instance performs many
 * writes — the path is part of the variables, not of the hook.
 */

// Shared types and errors
export type { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
export { TiledEndpointUnavailableError, isTiledEndpointUnavailableError } from './errors';
export { TiledApiError, isTiledApiError } from '../types/errors';
// Shared across backends; no Tiled hook raises it today, but it is part of the common surface.
export { FinchMissingArgumentError, isFinchMissingArgumentError } from '@/api/shared/errors';

// Client resolution
export { useTiledClient, useTiledQueryScope } from './useTiledClient';
export type { TiledClientResolution } from './useTiledClient';

// Query keys
export {
    INJECTED_CLIENT_SCOPE,
    TILED_QUERY_ROOT,
    TILED_QUERY_ROOT_NAMES,
    tiledQueryKeys,
    tiledQueryRoots,
} from './queryKeys';
export type {
    TiledArrayKeyArgs,
    TiledAssetKeyArgs,
    TiledDistinctKeyArgs,
    TiledNodeKeyArgs,
    TiledQueryKeyFor,
    TiledQueryRootName,
    TiledQueryScope,
    TiledRevisionsKeyArgs,
    TiledSearchKeyArgs,
    TiledServerInfoVariant,
    TiledServerInfoVariantKey,
    TiledTableKeyArgs,
    TiledWebhookKeyArgs,
} from './queryKeys';
export { arrayKeyParts, tableKeyParts } from './internal/keyParts';
export type { TiledArrayKeyParts, TiledTableKeyParts } from './internal/keyParts';

// Invalidation
export {
    TILED_INVALIDATION_BUNDLES,
    TILED_MUTATION_INVALIDATIONS,
    invalidateAllTiledQueries,
    invalidateTiledRoots,
    resolveInvalidationRoots,
    useTiledInvalidate,
} from './invalidation';
export type { TiledInvalidationBundleName, TiledMutationHookName } from './invalidation';

// #region hooks

export {
    useTiledSearchQuery,
    useTiledSearchBySpecsQuery,
    useTiledSearchByFullTextQuery,
    useTiledSearchByMetadataEqualsQuery,
    useTiledSearchByStructureFamilyQuery,
    useTiledSearchByRegexQuery,
    useTiledSearchByMetadataComparisonQuery,
} from './searchHooks';

export { useTiledDistinctQuery } from './distinctHooks';

export {
    useTiledMetadataQuery,
    useTiledCreateNodeMutation,
    useTiledUpdateMetadataMutation,
    useTiledPatchMetadataMutation,
    useTiledDeleteNodeMutation,
} from './metadataHooks';
export type {
    TiledCreateNodeVariables,
    TiledUpdateMetadataVariables,
    TiledPatchMetadataVariables,
    TiledDeleteNodeVariables,
} from './metadataHooks';

export {
    useTiledArrayAsQuery,
    useTiledArrayAsJSONQuery,
    useTiledArrayAsPngQuery,
    useTiledArrayAsBufferQuery,
    useTiledArrayImagePath,
    useTiledArrayBlockQuery,
    useTiledPutArrayFullMutation,
    useTiledPutArrayBlockMutation,
    useTiledPatchArrayFullMutation,
} from './arrayHooks';
export type {
    TiledArrayBlockParams,
    TiledPutArrayFullVariables,
    TiledPutArrayBlockVariables,
    TiledPatchArrayFullVariables,
} from './arrayHooks';

export {
    useTiledTableAsQuery,
    useTiledTablePartitionAsJSONQuery,
    useTiledTablePartitionAsJSONSequenceQuery,
    useTiledTableFullAsJSONQuery,
    useTiledTableFullAsJSONSequenceQuery,
    useTiledTableFullAsQuery,
    useTiledPostTableFullQuery,
    useTiledPostTablePartitionQuery,
    useTiledPutTablePartitionMutation,
    useTiledPatchTablePartitionMutation,
    useTiledPutTableFullMutation,
} from './tableHooks';
export type { TiledPutTablePartitionVariables, TiledPutTableFullVariables } from './tableHooks';

export {
    useTiledContainerFullQuery,
    useTiledPostContainerFullQuery,
    useTiledNodeFullQuery,
    useTiledPutNodeFullMutation,
    useTiledAwkwardFullQuery,
    useTiledAwkwardBuffersQuery,
    useTiledPostAwkwardBuffersQuery,
    useTiledPutAwkwardFullMutation,
    useTiledRaggedFullQuery,
    useTiledPutRaggedFullMutation,
    useTiledPutRaggedBlockMutation,
    useTiledPatchRaggedFullMutation,
} from './nodeHooks';
export type {
    TiledPutNodeFullVariables,
    TiledPutAwkwardFullVariables,
    TiledPutRaggedVariables,
    TiledPutRaggedBlockVariables,
    TiledPatchRaggedFullVariables,
} from './nodeHooks';

export {
    useTiledRegisterMutation,
    useTiledPutDataSourceMutation,
    useTiledRevisionsQuery,
    useTiledDeleteRevisionMutation,
    useTiledAssetBytesQuery,
    useTiledAssetManifestQuery,
    useTiledWebhooksQuery,
    useTiledWebhookHistoryQuery,
    useTiledRegisterWebhookMutation,
    useTiledDeleteWebhookMutation,
    useTiledCloseStreamMutation,
} from './managementHooks';
export type {
    TiledRegisterVariables,
    TiledPutDataSourceVariables,
    TiledRevisionsParams,
    TiledDeleteRevisionVariables,
    TiledAssetParams,
    TiledRegisterWebhookVariables,
} from './managementHooks';

export {
    useTiledServerInfoQuery,
    useTiledAboutQuery,
    useTiledHealthQuery,
    useTiledUiSettingsQuery,
    useTiledMetricsQuery,
} from './infoHooks';

export {
    useTiledLoginMutation,
    useTiledLogoutMutation,
    useTiledWhoamiQuery,
    useTiledCreateApiKeyMutation,
    useTiledRevokeApiKeyMutation,
    useTiledRefreshSessionMutation,
    useTiledRevokeSessionMutation,
} from './authHooks';
export type { TiledLoginVariables, TiledCreateApiKeyVariables } from './authHooks';

// #endregion
