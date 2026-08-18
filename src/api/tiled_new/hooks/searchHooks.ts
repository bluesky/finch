import type { UseQueryResult } from '@tanstack/react-query';
import type {
    TiledComparisonFilter,
    TiledEqualityFilter,
    TiledFulltextFilter,
    TiledRegexFilter,
    TiledRequestOptions,
    TiledSearchConfig,
    TiledSearchOptions,
    TiledSearchResult,
    TiledSpecsFilter,
    TiledStructureFamilyFilter,
} from '../types/common';
import { useTiledQuery } from './internal/useTiledQuery';
import { tiledQueryKeys, type TiledQueryKeyFor } from './queryKeys';
import type { FinchQueryOptions, TiledHookError } from './types';
import { useTiledQueryScope } from './useTiledClient';

/**
 * Search hooks — every one of them a `GET /api/v1/search/{path}` with different filters.
 *
 * The general hook takes a whole `TiledSearchConfig`; the six conveniences take one typed filter and
 * build the config for you. They all share the `search` query root, because they are the same endpoint:
 * two hooks that produce identical filters correctly share one cache entry, and
 * `invalidateQueries({ queryKey: ['tiled','search'] })` refreshes every search however it was written.
 *
 * `searchPath` may legitimately be `''` — that is the root container — so unlike the metadata and data
 * hooks these have no path guard.
 *
 * Four of the conveniences mirror functions the package ships (`getTiledSearchBySpecs`,
 * `…ByFullText`, `…ByMetadataEquals`, `…ByStructureFamily`); regex and comparison do not exist in the
 * package but did exist in the legacy Finch hooks, and `TiledSearchFilters` supports them, so they are
 * kept for parity. For the remaining nine filters (`lookup`, `keysFilter`, `noteq`, `contains`, `in`,
 * `notin`, `keyPresent`, `like`, `accessBlob`) use `useTiledSearchQuery` directly.
 */

/** Shared shape of every search hook's TanStack options parameter. */
type SearchQueryOptions<TData> = FinchQueryOptions<
    TiledSearchResult,
    TData,
    TiledQueryKeyFor<'search'>,
    TiledHookError
>;

/**
 * Search a Tiled container with an arbitrary filter set.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param config `{ searchFilters, searchOptions }`. Part of the query key.
 * @param requestOptions Transport overrides: `baseUrl`, `apiKey`, `initialPath`, `pathMode`, `signal`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledSearchQuery<TData = TiledSearchResult>(
    searchPath: string,
    config?: TiledSearchConfig,
    requestOptions: TiledRequestOptions = {},
    queryOptions: SearchQueryOptions<TData> = {},
): UseQueryResult<TData, TiledHookError> {
    return useSearch(searchPath, config, requestOptions, queryOptions);
}

/**
 * Search by item specs (Tiled's tags) — e.g. every `BlueskyRun` in a container.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param filter `{ include, exclude }`; both are arrays of spec names.
 * @param searchOptions Pagination, sorting and field selection.
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledSearchBySpecsQuery<TData = TiledSearchResult>(
    searchPath: string,
    filter: TiledSpecsFilter,
    searchOptions?: TiledSearchOptions,
    requestOptions: TiledRequestOptions = {},
    queryOptions: SearchQueryOptions<TData> = {},
): UseQueryResult<TData, TiledHookError> {
    return useSearch(
        searchPath,
        { searchFilters: { specs: filter }, searchOptions },
        requestOptions,
        queryOptions,
    );
}

/**
 * Full-text search across item metadata.
 *
 * Stays idle while `filter.text` is empty, since an empty full-text search matches everything and is
 * almost never what a search box means on first render. Override with `queryOptions.enabled`.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param filter `{ text }` — the text to look for.
 * @param searchOptions Pagination, sorting and field selection.
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledSearchByFullTextQuery<TData = TiledSearchResult>(
    searchPath: string,
    filter: TiledFulltextFilter,
    searchOptions?: TiledSearchOptions,
    requestOptions: TiledRequestOptions = {},
    queryOptions: SearchQueryOptions<TData> = {},
): UseQueryResult<TData, TiledHookError> {
    return useSearch(
        searchPath,
        { searchFilters: { fulltext: filter }, searchOptions },
        requestOptions,
        queryOptions,
        filter.text.length > 0,
    );
}

/**
 * Search for items whose metadata key equals a value.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param filter `{ key, value }`. The key is a metadata path such as `start.plan_name`.
 * @param searchOptions Pagination, sorting and field selection.
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledSearchByMetadataEqualsQuery<TData = TiledSearchResult>(
    searchPath: string,
    filter: TiledEqualityFilter,
    searchOptions?: TiledSearchOptions,
    requestOptions: TiledRequestOptions = {},
    queryOptions: SearchQueryOptions<TData> = {},
): UseQueryResult<TData, TiledHookError> {
    return useSearch(
        searchPath,
        { searchFilters: { eq: filter }, searchOptions },
        requestOptions,
        queryOptions,
    );
}

/**
 * Search by structure family — containers, arrays, tables, awkward or sparse.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param filter `{ value: 'container' | 'array' | 'table' | 'awkward' | 'sparse' }`.
 * @param searchOptions Pagination, sorting and field selection.
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledSearchByStructureFamilyQuery<TData = TiledSearchResult>(
    searchPath: string,
    filter: TiledStructureFamilyFilter,
    searchOptions?: TiledSearchOptions,
    requestOptions: TiledRequestOptions = {},
    queryOptions: SearchQueryOptions<TData> = {},
): UseQueryResult<TData, TiledHookError> {
    return useSearch(
        searchPath,
        { searchFilters: { structureFamily: filter }, searchOptions },
        requestOptions,
        queryOptions,
    );
}

/**
 * Search for items whose metadata key matches a regular expression.
 *
 * Not one of the package's own convenience functions, but `TiledSearchFilters` supports the filter and
 * the legacy Finch hooks exposed it.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param filter `{ key, pattern, caseSensitive? }`.
 * @param searchOptions Pagination, sorting and field selection.
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledSearchByRegexQuery<TData = TiledSearchResult>(
    searchPath: string,
    filter: TiledRegexFilter,
    searchOptions?: TiledSearchOptions,
    requestOptions: TiledRequestOptions = {},
    queryOptions: SearchQueryOptions<TData> = {},
): UseQueryResult<TData, TiledHookError> {
    return useSearch(
        searchPath,
        { searchFilters: { regex: filter }, searchOptions },
        requestOptions,
        queryOptions,
    );
}

/**
 * Search by comparing a metadata key against a value.
 *
 * Not one of the package's own convenience functions, but `TiledSearchFilters` supports the filter and
 * the legacy Finch hooks exposed it. Useful for time ranges: `{ operator: 'gt', key: 'start.time',
 * value: '1700000000' }`.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param filter `{ operator: 'gt' | 'gte' | 'lt' | 'lte', key, value }`.
 * @param searchOptions Pagination, sorting and field selection.
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledSearchByMetadataComparisonQuery<TData = TiledSearchResult>(
    searchPath: string,
    filter: TiledComparisonFilter,
    searchOptions?: TiledSearchOptions,
    requestOptions: TiledRequestOptions = {},
    queryOptions: SearchQueryOptions<TData> = {},
): UseQueryResult<TData, TiledHookError> {
    return useSearch(
        searchPath,
        { searchFilters: { comparison: filter }, searchOptions },
        requestOptions,
        queryOptions,
    );
}

/**
 * The one search implementation the seven hooks share.
 *
 * Not exported: it takes an already-built config, so it would be a strictly worse
 * `useTiledSearchQuery`. Each public hook stays an explicit wrapper so its filter argument keeps its
 * own name, type and docs.
 */
function useSearch<TData>(
    searchPath: string,
    config: TiledSearchConfig | undefined,
    requestOptions: TiledRequestOptions,
    queryOptions: SearchQueryOptions<TData>,
    defaultEnabled?: boolean,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.search(scope, { searchPath, config: config ?? null }),
        fetch: (client, request) => client.getSearch(searchPath, config, request),
        requestOptions,
        queryOptions,
        defaultEnabled,
    });
}
