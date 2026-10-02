import type { UseQueryResult } from '@tanstack/react-query';
import type { TiledDistinctConfig, TiledRequestOptions } from '../types/common';
import type { GetDistinctResponse } from '../types/generatedAliases';
import { useTiledQuery } from './internal/useTiledQuery';
import { tiledQueryKeys, type TiledQueryKeyFor } from './queryKeys';
import type { FinchQueryOptions, TiledHookError } from './types';
import { useTiledQueryScope } from './useTiledClient';

/** Faceting: `GET /api/v1/distinct/{path}`. */

/**
 * The distinct values of metadata keys, specs and structure families across a container.
 *
 * This is the endpoint a filter sidebar is built on — "which plan names exist in this catalogue, and
 * how many runs does each have" — answered by the server in one request. The package exposed no
 * equivalent, so the alternative was paginating the whole container client-side and counting.
 *
 * ```ts
 * const facets = useTiledDistinctQuery('', {
 *     metadata: ['start.plan_name', 'start.detectors'],
 *     counts: true,
 * });
 * ```
 *
 * It takes the **same filters as a search**, so a facet count can be scoped to the current query —
 * ask for the distinct plan names *among runs from this week*, not among everything.
 *
 * `searchPath: ''` is the root container, and legal, so there is no path guard. The query idles only
 * when asked to compute nothing: a config with no `metadata`, `specs`, `structureFamilies` or
 * `counts` would return an empty result at the cost of a round-trip.
 *
 * @param searchPath Container to aggregate over. `''` is the root.
 * @param config Which facets to compute, and the filters to scope them by.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides: `baseUrl`, `apiKey`, `initialPath`, `pathMode`, `signal`.
 */
export function useTiledDistinctQuery<TData = GetDistinctResponse>(
    searchPath: string,
    config?: TiledDistinctConfig,
    queryOptions?: FinchQueryOptions<
        GetDistinctResponse,
        TData,
        TiledQueryKeyFor<'distinct'>,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.distinct(scope, { searchPath, config: config ?? null }),
        fetch: (client, request) => client.getDistinct(searchPath, config, request),
        requestOptions,
        queryOptions,
        defaultEnabled: hasFacet(config),
    });
}

/** Whether a config asks for anything at all. */
function hasFacet(config?: TiledDistinctConfig): boolean {
    if (!config) return false;
    return (
        config.structureFamilies === true ||
        config.specs === true ||
        config.counts === true ||
        (config.metadata?.length ?? 0) > 0
    );
}
