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
 * Arguments are positional and always in the same order: the endpoint's own arguments, then TanStack
 * options, then `requestOptions` — transport last, because it is the rarest thing to pass. The array
 * and table hooks carry an extra endpoint slot (`arrayOptions` / `tableOptions`), since the package's
 * own option types merge endpoint parameters with transport and these do not. See `../README.md` for
 * the full contract, and `@/api/shared/queryOptions` for the cross-backend convention.
 */

// Shared types and errors
export type { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
export { TiledEndpointUnavailableError, isTiledEndpointUnavailableError } from './errors';
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
