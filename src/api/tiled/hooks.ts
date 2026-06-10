import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useTiledApiUrls } from 'src/utils/apiUtils';
import {
    getSearchResults,
    searchBySpecs,
    searchByFulltext,
    searchByMetadataEquals,
    searchByMetadataComparison,
    searchByRegex,
    searchByStructureFamily,
    getItemMetadata,
    getBlueskyPlanMetadata,
    getTableDataAsSequence,
    getTableDataAsJson,
    getStructuredArrayData,
    getXArrayData,
    getServerInfo,
    TiledSearchResult,
    TiledBlueskyPlanMetadataResponse,
    TiledTableRow,
    TiledTableJSONResponse,
    TiledSearchConfig,
    TiledSearchOptions,
} from '@blueskyproject/tiled';

// searchById is not re-exported from the package root — replicate the behaviour
// (graceful null return on 404) using the available getSearchResults.
async function searchById(config: TiledSearchConfig): Promise<TiledSearchResult | null> {
    try {
        return await getSearchResults(config);
    } catch {
        return null;
    }
}

type TiledSearchMetadataResult = Awaited<ReturnType<typeof getItemMetadata>>;
type TiledStructuredArrayData = Awaited<ReturnType<typeof getStructuredArrayData>>;
type TiledInfoResponse = Awaited<ReturnType<typeof getServerInfo>>;

function useTiledBase() {
    const { httpBaseUrl, apiKey } = useTiledApiUrls();
    return { baseUrl: httpBaseUrl, apiKey: apiKey ?? undefined };
}

// ---------------------------------------------------------------------------
// Full-config search
// ---------------------------------------------------------------------------

export function useSearchResultsQuery(
    config: Omit<TiledSearchConfig, 'baseUrl' | 'apiKey'>,
    queryOptions?: Partial<UseQueryOptions<TiledSearchResult, Error, TiledSearchResult, unknown[]>>,
) {
    const { baseUrl, apiKey } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'search', baseUrl, config],
        queryFn: () => getSearchResults({ baseUrl, apiKey, ...config }),
        ...queryOptions,
    });
}

export function useSearchByIdQuery(
    config: Omit<TiledSearchConfig, 'baseUrl' | 'apiKey'>,
    queryOptions?: Partial<
        UseQueryOptions<TiledSearchResult | null, Error, TiledSearchResult | null, unknown[]>
    >,
) {
    const { baseUrl, apiKey } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'searchById', baseUrl, config],
        queryFn: () => searchById({ baseUrl, apiKey, ...config }),
        ...queryOptions,
    });
}

// ---------------------------------------------------------------------------
// Convenience search hooks
// ---------------------------------------------------------------------------

export function useSearchBySpecsQuery(
    include: string[],
    exclude?: string[],
    path?: string,
    options?: TiledSearchOptions,
    queryOptions?: Partial<UseQueryOptions<TiledSearchResult, Error, TiledSearchResult, unknown[]>>,
) {
    const { baseUrl, apiKey } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'searchBySpecs', baseUrl, include, exclude, path, options],
        queryFn: () => searchBySpecs(baseUrl, include, exclude, path, options, apiKey),
        ...queryOptions,
    });
}

export function useSearchByFulltextQuery(
    text: string,
    path?: string,
    options?: TiledSearchOptions,
    queryOptions?: Partial<UseQueryOptions<TiledSearchResult, Error, TiledSearchResult, unknown[]>>,
) {
    const { baseUrl, apiKey } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'searchByFulltext', baseUrl, text, path, options],
        queryFn: () => searchByFulltext(baseUrl, text, path, options, apiKey),
        enabled: text.length > 0,
        ...queryOptions,
    });
}

export function useSearchByMetadataEqualsQuery(
    key: string,
    value: string,
    path?: string,
    options?: TiledSearchOptions,
    queryOptions?: Partial<UseQueryOptions<TiledSearchResult, Error, TiledSearchResult, unknown[]>>,
) {
    const { baseUrl, apiKey } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'searchByMetadataEquals', baseUrl, key, value, path, options],
        queryFn: () => searchByMetadataEquals(baseUrl, key, value, path, options, apiKey),
        ...queryOptions,
    });
}

export function useSearchByMetadataComparisonQuery(
    key: string,
    operator: 'gt' | 'gte' | 'lt' | 'lte',
    value: string,
    path?: string,
    options?: TiledSearchOptions,
    queryOptions?: Partial<UseQueryOptions<TiledSearchResult, Error, TiledSearchResult, unknown[]>>,
) {
    const { baseUrl, apiKey } = useTiledBase();
    return useQuery({
        queryKey: [
            'tiled',
            'searchByMetadataComparison',
            baseUrl,
            key,
            operator,
            value,
            path,
            options,
        ],
        queryFn: () =>
            searchByMetadataComparison(baseUrl, key, operator, value, path, options, apiKey),
        ...queryOptions,
    });
}

export function useSearchByRegexQuery(
    key: string,
    pattern: string,
    caseSensitive?: boolean,
    path?: string,
    options?: TiledSearchOptions,
    queryOptions?: Partial<UseQueryOptions<TiledSearchResult, Error, TiledSearchResult, unknown[]>>,
) {
    const { baseUrl, apiKey } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'searchByRegex', baseUrl, key, pattern, caseSensitive, path, options],
        queryFn: () => searchByRegex(baseUrl, key, pattern, caseSensitive, path, options, apiKey),
        ...queryOptions,
    });
}

export function useSearchByStructureFamilyQuery(
    structureFamily: 'container' | 'array' | 'table' | 'awkward' | 'sparse',
    path?: string,
    options?: TiledSearchOptions,
    queryOptions?: Partial<UseQueryOptions<TiledSearchResult, Error, TiledSearchResult, unknown[]>>,
) {
    const { baseUrl, apiKey } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'searchByStructureFamily', baseUrl, structureFamily, path, options],
        queryFn: () => searchByStructureFamily(baseUrl, structureFamily, path, options, apiKey),
        ...queryOptions,
    });
}

// ---------------------------------------------------------------------------
// Item data hooks
// ---------------------------------------------------------------------------

export function useItemMetadataQuery(
    searchPath: string,
    queryOptions?: Partial<
        UseQueryOptions<
            TiledSearchMetadataResult | null,
            Error,
            TiledSearchMetadataResult | null,
            unknown[]
        >
    >,
) {
    const { baseUrl } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'itemMetadata', baseUrl, searchPath],
        queryFn: () => getItemMetadata(searchPath),
        enabled: searchPath.length > 0,
        ...queryOptions,
    });
}

export function useBlueskyPlanMetadataQuery(
    searchPath: string,
    queryOptions?: Partial<
        UseQueryOptions<
            TiledBlueskyPlanMetadataResponse | null,
            Error,
            TiledBlueskyPlanMetadataResponse | null,
            unknown[]
        >
    >,
) {
    const { baseUrl } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'blueskyPlanMetadata', baseUrl, searchPath],
        queryFn: () => getBlueskyPlanMetadata(searchPath),
        enabled: searchPath.length > 0,
        ...queryOptions,
    });
}

export function useTableDataAsSequenceQuery(
    searchPath: string,
    partition: number,
    queryOptions?: Partial<
        UseQueryOptions<TiledTableRow[] | null, Error, TiledTableRow[] | null, unknown[]>
    >,
) {
    const { baseUrl } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'tableDataAsSequence', baseUrl, searchPath, partition],
        queryFn: () => getTableDataAsSequence(searchPath, partition),
        enabled: searchPath.length > 0,
        ...queryOptions,
    });
}

export function useTableDataAsJsonQuery(
    searchPath: string,
    partition: number,
    queryOptions?: Partial<
        UseQueryOptions<
            TiledTableJSONResponse | null,
            Error,
            TiledTableJSONResponse | null,
            unknown[]
        >
    >,
) {
    const { baseUrl } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'tableDataAsJson', baseUrl, searchPath, partition],
        queryFn: () => getTableDataAsJson(searchPath, partition),
        enabled: searchPath.length > 0,
        ...queryOptions,
    });
}

export function useStructuredArrayDataQuery(
    searchPath: string,
    block: number,
    queryOptions?: Partial<
        UseQueryOptions<
            TiledStructuredArrayData | null,
            Error,
            TiledStructuredArrayData | null,
            unknown[]
        >
    >,
) {
    const { baseUrl } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'structuredArrayData', baseUrl, searchPath, block],
        queryFn: () => getStructuredArrayData(searchPath, block),
        enabled: searchPath.length > 0,
        ...queryOptions,
    });
}

export function useXArrayDataQuery(
    searchPath: string,
    stack: number[],
    queryOptions?: Partial<UseQueryOptions<number[][] | null, Error, number[][] | null, unknown[]>>,
) {
    const { baseUrl } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'xArrayData', baseUrl, searchPath, stack],
        queryFn: () => getXArrayData(searchPath, stack),
        enabled: searchPath.length > 0,
        ...queryOptions,
    });
}

// ---------------------------------------------------------------------------
// Server info
// ---------------------------------------------------------------------------

export function useServerInfoQuery(
    queryOptions?: Partial<
        UseQueryOptions<TiledInfoResponse | null, Error, TiledInfoResponse | null, unknown[]>
    >,
) {
    const { baseUrl } = useTiledBase();
    return useQuery({
        queryKey: ['tiled', 'serverInfo', baseUrl],
        queryFn: () => getServerInfo(baseUrl),
        ...queryOptions,
    });
}
