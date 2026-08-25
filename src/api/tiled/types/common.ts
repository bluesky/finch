/**
 * The package types the hooks expose, re-exported from one place.
 *
 * Consumers should import these from `@/api/tiled` rather than reaching for
 * `@blueskyproject/tiled` directly, so that a future package rename or a locally widened type is a
 * single-file change. Nothing here redefines a package type — these are pure re-exports, with the
 * derived aliases in `packageAliases.ts` covering only what the package fails to export.
 */

export type {
    // request/transport
    TiledRequestOptions,
    TiledPathMode,
    TiledArrayRequestOptions,
    TiledTableRequestOptions,
    // search
    TiledSearchConfig,
    TiledSearchOptions,
    TiledSearchFilters,
    TiledSpecsFilter,
    TiledFulltextFilter,
    TiledRegexFilter,
    TiledEqualityFilter,
    TiledComparisonFilter,
    TiledStructureFamilyFilter,
    TiledLookupFilter,
    TiledKeysFilter,
    TiledContainsFilter,
    TiledInFilter,
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
