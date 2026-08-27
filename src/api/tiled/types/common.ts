/**
 * The package types the hooks expose, re-exported from one place.
 *
 * Consumers should import these from `@/api/tiled` rather than reaching for
 * `@blueskyproject/tiled` directly, so that a future package rename or a locally widened type is a
 * single-file change. Almost nothing here redefines a package type — these are pure re-exports, with
 * the derived aliases in `packageAliases.ts` covering only what the package fails to export.
 *
 * The one exception is the search filters: `searchFilters.ts` widens the six whose `value` the Tiled
 * server parses as JSON, so callers pass real values instead of hand-quoted JSON. Those names are
 * exported from there rather than from the package, deliberately shadowing it.
 */

export type {
    // request/transport
    TiledRequestOptions,
    TiledPathMode,
    TiledArrayRequestOptions,
    TiledTableRequestOptions,
    // search — note the six JSON-valued filters come from `./searchFilters`, not from here
    TiledSearchOptions,
    TiledSpecsFilter,
    TiledFulltextFilter,
    TiledRegexFilter,
    TiledStructureFamilyFilter,
    TiledLookupFilter,
    TiledKeysFilter,
    TiledKeyPresentFilter,
    TiledLikeFilter,
    TiledAccessBlobFilter,
    // results
    TiledSearchResult,
    TiledSearchItem,
    TiledItemLinks,
    TiledTableRow,
    TiledTableJSONResponse,
    TiledBlueskyPlanMetadataResponse,
    // structures
    TiledStructures,
    ArrayStructure,
    TableStructure,
    ContainerStructure,
    AwkwardStructure,
    AwkwardForm,
    SparseStructure,
    // auth
    TiledAuthProvider,
    // client
    TiledApiClientConfig,
} from '@blueskyproject/tiled';

// The widened search filters. These shadow the package's same-named types on purpose.
export type {
    TiledSearchConfig,
    TiledSearchFilters,
    TiledFilterValue,
    TiledEqualityFilter,
    TiledComparisonFilter,
    TiledContainsFilter,
    TiledInFilter,
    TiledJsonValuedFilterName,
    TiledPackageSearchConfig,
    TiledPackageSearchFilters,
} from './searchFilters';
export { JSON_VALUED_FILTERS } from './searchFilters';

export type {
    TiledArrayReturnType,
    TiledArrayReturnMap,
    // The package's merged option types — endpoint parameters *and* transport in one object. The
    // hooks do not use these directly; they are here because a caller building a request by hand
    // does.
    TiledArrayOptionsMap,
    TiledArrayJSONOptions,
    TiledArrayPngOptions,
    TiledArrayBufferOptions,
    TiledArrayImagePathOptions,
    TiledArrayAnyOptions,
    // The endpoint half, with transport `Omit`ted — what the hooks' `arrayOptions` slot accepts.
    TiledArrayEndpointOptionsMap,
    TiledArrayJSONEndpointOptions,
    TiledArrayPngEndpointOptions,
    TiledArrayBufferEndpointOptions,
    TiledArrayImagePathEndpointOptions,
    TiledArrayAnyEndpointOptions,
    TiledTableReturnType,
    TiledTableEndpoint,
    TiledTableReturnMap,
    TiledTableOptionsMap,
    TiledTableJSONOptions,
    TiledTableJSONSequenceOptions,
    TiledTableJSONData,
    TiledTableJSONSequenceData,
    TiledTableAnyOptions,
    // …and the table endpoint half.
    TiledTableEndpointOptionsMap,
    TiledTableJSONEndpointOptions,
    TiledTableJSONSequenceEndpointOptions,
    TiledTableAnyEndpointOptions,
    TiledInfoResponse,
    TiledLoginTokens,
    TiledPackageClient,
} from './packageAliases';
