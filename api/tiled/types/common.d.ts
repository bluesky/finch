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
export type { TiledRequestOptions, TiledPathMode, TiledArrayRequestOptions, TiledTableRequestOptions, TiledSearchOptions, TiledSpecsFilter, TiledFulltextFilter, TiledRegexFilter, TiledStructureFamilyFilter, TiledLookupFilter, TiledKeysFilter, TiledKeyPresentFilter, TiledLikeFilter, TiledAccessBlobFilter, TiledSearchResult, TiledSearchItem, TiledItemLinks, TiledTableRow, TiledTableJSONResponse, TiledBlueskyPlanMetadataResponse, TiledStructures, ArrayStructure, TableStructure, ContainerStructure, AwkwardStructure, AwkwardForm, SparseStructure, TiledAuthProvider, TiledApiClientConfig, } from '@blueskyproject/tiled';
export type { TiledSearchConfig, TiledSearchFilters, TiledFilterValue, TiledEqualityFilter, TiledComparisonFilter, TiledContainsFilter, TiledInFilter, TiledJsonValuedFilterName, TiledPackageSearchConfig, TiledPackageSearchFilters, } from './searchFilters';
export { JSON_VALUED_FILTERS } from './searchFilters';
export type { TiledArrayReturnType, TiledArrayReturnMap, TiledArrayOptionsMap, TiledArrayJSONOptions, TiledArrayPngOptions, TiledArrayBufferOptions, TiledArrayImagePathOptions, TiledArrayAnyOptions, TiledArrayEndpointOptionsMap, TiledArrayJSONEndpointOptions, TiledArrayPngEndpointOptions, TiledArrayBufferEndpointOptions, TiledArrayImagePathEndpointOptions, TiledArrayAnyEndpointOptions, TiledTableReturnType, TiledTableEndpoint, TiledTableReturnMap, TiledTableOptionsMap, TiledTableJSONOptions, TiledTableJSONSequenceOptions, TiledTableJSONData, TiledTableJSONSequenceData, TiledTableAnyOptions, TiledTableEndpointOptionsMap, TiledTableJSONEndpointOptions, TiledTableJSONSequenceEndpointOptions, TiledTableAnyEndpointOptions, TiledInfoResponse, TiledLoginTokens, TiledPackageClient, } from './packageAliases';
//# sourceMappingURL=common.d.ts.map