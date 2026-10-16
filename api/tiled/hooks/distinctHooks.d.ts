import { UseQueryResult } from '@tanstack/react-query';
import { TiledDistinctConfig, TiledRequestOptions } from '../types/common';
import { GetDistinctResponse } from '../types/generatedAliases';
import { TiledQueryKeyFor } from './queryKeys';
import { FinchQueryOptions, TiledHookError } from './types';
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
export declare function useTiledDistinctQuery<TData = GetDistinctResponse>(searchPath: string, config?: TiledDistinctConfig, queryOptions?: FinchQueryOptions<GetDistinctResponse, TData, TiledQueryKeyFor<'distinct'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
//# sourceMappingURL=distinctHooks.d.ts.map