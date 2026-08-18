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
    TiledArrayOptionsMap,
    TiledArrayJSONOptions,
    TiledArrayPngOptions,
    TiledArrayBufferOptions,
    TiledArrayImagePathOptions,
    TiledArrayAnyOptions,
    TiledTableReturnType,
    TiledTableEndpoint,
    TiledTableReturnMap,
    TiledTableOptionsMap,
    TiledTableJSONOptions,
    TiledTableJSONSequenceOptions,
    TiledTableJSONData,
    TiledTableJSONSequenceData,
    TiledTableAnyOptions,
    TiledInfoResponse,
    TiledLoginTokens,
} from './packageAliases';
