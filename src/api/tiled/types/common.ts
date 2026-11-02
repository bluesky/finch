import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * The Tiled types consumers import, gathered in one place.
 *
 * Everything here is now **defined in this folder**. It used to be a re-export surface over
 * `@blueskyproject/tiled`, with `packageAliases.ts` beside it reconstructing the types the package
 * declined to export. Import these from `@/api/tiled` rather than reaching for a sibling module
 * directly, so a future reshuffle is a single-file change.
 *
 * The primitives below — interceptors and the shared body/response aliases — are defined right
 * here, mirroring `qServer/types/common.ts`. The domain types are re-exported from their own
 * modules at the bottom.
 */

// #region interceptors

export type TiledRequestInterceptor = (
    config: InternalAxiosRequestConfig,
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

export type TiledResponseInterceptor = (
    response: AxiosResponse,
) => AxiosResponse | Promise<AxiosResponse>;

export type TiledErrorInterceptor = (error: unknown) => unknown;

/** Handle returned when registering an interceptor; pass it to `ejectInterceptor`. */
export interface InterceptorHandle {
    readonly kind: 'request' | 'response';
    readonly id: number;
}

// #endregion

// #region request bodies

/**
 * A JSON request body.
 *
 * Deliberately loose. The typed bodies are per-endpoint (`PostMetadataRequest` and friends from
 * `./generatedAliases`); this is what the generic `request`/`post`/`put` funnels accept.
 */
export type TiledBody = Record<string, unknown> | unknown[];

/**
 * A binary payload for the array, table, ragged and node write endpoints.
 *
 * `ArrayBufferView` covers every typed array (`Float64Array`, `Uint8Array`, …) as well as
 * `DataView`, which is what a caller holding decoded array data actually has.
 */
export type TiledBinaryBody = ArrayBuffer | ArrayBufferView | Blob;

// #endregion

// #region re-exports

export type {
    TiledRequestOptions,
    TiledPathMode,
    TiledLoginTokens,
    TiledAuthErrorCallback,
    TiledApiKeyLocation,
    TiledApiKeyScheme,
} from './requestOptions';

export type {
    TiledSearchConfig,
    TiledSearchFilters,
    TiledSearchOptions,
    TiledDistinctConfig,
    TiledFilterValue,
    TiledJsonValuedFilterName,
    TiledFulltextFilter,
    TiledLookupFilter,
    TiledKeysFilter,
    TiledRegexFilter,
    TiledEqualityFilter,
    TiledComparisonFilter,
    TiledContainsFilter,
    TiledInFilter,
    TiledKeyPresentFilter,
    TiledLikeFilter,
    TiledSpecsFilter,
    TiledAccessBlobFilter,
    TiledStructureFamilyFilter,
} from './searchFilters';
export { JSON_VALUED_FILTERS } from './searchFilters';

export type {
    TiledDtype,
    ArrayStructure,
    StructuredArrayStructure,
    StructuredArrayField,
    TableStructure,
    ContainerStructure,
    AwkwardStructure,
    AwkwardForm,
    SparseStructure,
    RaggedStructure,
    XArrayStructure,
    TiledStructures,
    TiledStructureFamily,
} from './structures';
export {
    isArrayStructure,
    isTableStructure,
    isContainerStructure,
    isAwkwardStructure,
    isSparseStructure,
    isRaggedStructure,
    isStructuredArrayStructure,
} from './structures';

export type {
    TiledSearchItem,
    TiledSearchResult,
    TiledMetadataResult,
    TiledItemLinks,
    TiledSorting,
    TiledMetadata,
    TiledTableRow,
    TiledTableJSONResponse,
    TiledTableData,
    TiledStructuredArrayRow,
    TiledStructuredArrayData,
    TiledBlueskyPlanMetadataResponse,
} from './nodes';

export type {
    TiledInfoResponse,
    TiledAuthProvider,
    TiledAuthProviderMode,
    TiledAuthLinks,
    TiledAuthenticationInfo,
    TiledFormatMap,
    TiledAliasMap,
} from './info';
export { isValidTiledInfoResponse } from './info';

export type {
    TiledArrayItem,
    TiledTableItem,
    TiledRaggedItem,
    TiledArrayEndpointParams,
    TiledArrayRequestOptions,
    TiledArrayReturnType,
    TiledArrayReturnMap,
    TiledArrayOptionsMap,
    TiledArrayJSONOptions,
    TiledArrayPngOptions,
    TiledArrayBufferOptions,
    TiledArrayImagePathOptions,
    TiledArrayAnyOptions,
    TiledArrayEndpointOptionsMap,
    TiledArrayJSONEndpointOptions,
    TiledArrayPngEndpointOptions,
    TiledArrayBufferEndpointOptions,
    TiledArrayImagePathEndpointOptions,
    TiledArrayAnyEndpointOptions,
    TiledTableEndpointParams,
    TiledTableRequestOptions,
    TiledTableReturnType,
    TiledTableEndpoint,
    TiledTableReturnMap,
    TiledTableOptionsMap,
    TiledTableJSONOptions,
    TiledTableJSONSequenceOptions,
    TiledTableAnyOptions,
    TiledTableEndpointOptionsMap,
    TiledTableJSONEndpointOptions,
    TiledTableJSONSequenceEndpointOptions,
    TiledTableAnyEndpointOptions,
    TiledTableJSONData,
    TiledTableJSONSequenceData,
    TiledNodeEndpointParams,
    TiledNodeRequestOptions,
    TiledRaggedEndpointParams,
    TiledRaggedRequestOptions,
    TiledAwkwardEndpointParams,
    TiledAwkwardRequestOptions,
} from './dataOptions';

export type { TiledHttpMethod } from './errors';
export { TiledApiError, isTiledApiError, formatValidationErrors } from './errors';

// #endregion
