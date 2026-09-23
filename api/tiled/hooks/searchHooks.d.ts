import { UseQueryResult } from '@tanstack/react-query';
import { TiledComparisonFilter, TiledEqualityFilter, TiledFulltextFilter, TiledRegexFilter, TiledRequestOptions, TiledSearchConfig, TiledSearchOptions, TiledSearchResult, TiledSpecsFilter, TiledStructureFamilyFilter } from '../types/common';
import { TiledQueryKeyFor } from './queryKeys';
import { FinchQueryOptions, TiledHookError } from './types';
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
 *
 * **Filter values are passed as themselves, never as hand-written JSON.** Six filters — `eq`,
 * `noteq`, `comparison`, `contains`, `in`, `notin` — have a `value` the server parses as JSON, so the
 * raw API needs `'"xas_scan"'` with the quotes baked in. These hooks encode for you:
 *
 * ```ts
 * useTiledSearchQuery('', {
 *     searchFilters: { contains: { key: 'start.plan_name', value: 'xas_scan' } },
 * });
 * ```
 *
 * See `internal/encodeSearchConfig.ts` for which filters are encoded and which are left alone.
 */
/** Shared shape of every search hook's TanStack options parameter. */
type SearchQueryOptions<TData> = FinchQueryOptions<TiledSearchResult, TData, TiledQueryKeyFor<'search'>, TiledHookError>;
/**
 * Search a Tiled container with an arbitrary filter set.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param config `{ searchFilters, searchOptions }`. Part of the query key.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides: `baseUrl`, `apiKey`, `initialPath`, `pathMode`, `signal`.
 */
export declare function useTiledSearchQuery<TData = TiledSearchResult>(searchPath: string, config?: TiledSearchConfig, queryOptions?: SearchQueryOptions<TData>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * Search by item specs (Tiled's tags) — e.g. every `BlueskyRun` in a container.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param filter `{ include, exclude }`; both are arrays of spec names.
 * @param searchOptions Pagination, sorting and field selection.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 */
export declare function useTiledSearchBySpecsQuery<TData = TiledSearchResult>(searchPath: string, filter: TiledSpecsFilter, searchOptions?: TiledSearchOptions, queryOptions?: SearchQueryOptions<TData>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * Full-text search across item metadata.
 *
 * Stays idle while `filter.text` is empty, since an empty full-text search matches everything and is
 * almost never what a search box means on first render. Override with `queryOptions.enabled`.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param filter `{ text }` — the text to look for.
 * @param searchOptions Pagination, sorting and field selection.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 */
export declare function useTiledSearchByFullTextQuery<TData = TiledSearchResult>(searchPath: string, filter: TiledFulltextFilter, searchOptions?: TiledSearchOptions, queryOptions?: SearchQueryOptions<TData>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * Search for items whose metadata key equals a value.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param filter `{ key, value }`. The key is a metadata path such as `start.plan_name`. Pass the
 * value itself — `'xas_scan'`, `5`, `true` — the hook JSON-encodes it for the server.
 * @param searchOptions Pagination, sorting and field selection.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 */
export declare function useTiledSearchByMetadataEqualsQuery<TData = TiledSearchResult>(searchPath: string, filter: TiledEqualityFilter, searchOptions?: TiledSearchOptions, queryOptions?: SearchQueryOptions<TData>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * Search by structure family — containers, arrays, tables, awkward or sparse.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param filter `{ value: 'container' | 'array' | 'table' | 'awkward' | 'sparse' }`.
 * @param searchOptions Pagination, sorting and field selection.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 */
export declare function useTiledSearchByStructureFamilyQuery<TData = TiledSearchResult>(searchPath: string, filter: TiledStructureFamilyFilter, searchOptions?: TiledSearchOptions, queryOptions?: SearchQueryOptions<TData>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * Search for items whose metadata key matches a regular expression.
 *
 * Not one of the package's own convenience functions, but `TiledSearchFilters` supports the filter and
 * the legacy Finch hooks exposed it.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param filter `{ key, pattern, caseSensitive? }`.
 * @param searchOptions Pagination, sorting and field selection.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 */
export declare function useTiledSearchByRegexQuery<TData = TiledSearchResult>(searchPath: string, filter: TiledRegexFilter, searchOptions?: TiledSearchOptions, queryOptions?: SearchQueryOptions<TData>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * Search by comparing a metadata key against a value.
 *
 * Not one of the package's own convenience functions, but `TiledSearchFilters` supports the filter and
 * the legacy Finch hooks exposed it. Useful for time ranges: `{ operator: 'gt', key: 'start.time',
 * value: 1700000000 }`.
 *
 * @param searchPath Container to search within. `''` is the root container.
 * @param filter `{ operator: 'gt' | 'gte' | 'lt' | 'lte', key, value }`. Pass the value itself; the
 * hook JSON-encodes it for the server.
 * @param searchOptions Pagination, sorting and field selection.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 */
export declare function useTiledSearchByMetadataComparisonQuery<TData = TiledSearchResult>(searchPath: string, filter: TiledComparisonFilter, searchOptions?: TiledSearchOptions, queryOptions?: SearchQueryOptions<TData>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
export {};
//# sourceMappingURL=searchHooks.d.ts.map