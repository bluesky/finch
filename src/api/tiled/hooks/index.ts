/**
 * TanStack Query hooks for Tiled — 18 queries, one mutation, one URL helper.
 *
 * ```tsx
 * import { useTiledSearchBySpecsQuery, useTiledMetadataQuery } from '@/api/tiled';
 *
 * const runs = useTiledSearchBySpecsQuery('experiments', { include: ['BlueskyRun'], exclude: [] });
 * const item = useTiledMetadataQuery(selectedPath ?? '');
 * ```
 *
 * Arguments are positional and always in the same order: the endpoint's own arguments, then request
 * options, then TanStack options. The array and table hooks merge the first two, because the package's
 * own option types do. See `../README.md` for the full contract.
 */

// Shared types and errors
export type { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
export { TiledEndpointUnavailableError, isTiledEndpointUnavailableError } from './errors';

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
    TiledQueryKeyFor,
    TiledQueryRootName,
    TiledQueryScope,
    TiledSearchKeyArgs,
    TiledTableKeyArgs,
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

export { useTiledMetadataQuery } from './metadataHooks';

export {
    useTiledArrayAsQuery,
    useTiledArrayAsJSONQuery,
    useTiledArrayAsPngQuery,
    useTiledArrayAsBufferQuery,
    useTiledArrayImagePath,
} from './arrayHooks';

export {
    useTiledTableAsQuery,
    useTiledTablePartitionAsJSONQuery,
    useTiledTablePartitionAsJSONSequenceQuery,
    useTiledTableFullAsJSONQuery,
    useTiledTableFullAsJSONSequenceQuery,
} from './tableHooks';

export { useTiledServerInfoQuery } from './infoHooks';

export { useTiledLoginMutation } from './authHooks';
export type { TiledLoginVariables } from './authHooks';

// #endregion
