import { TiledPackageSearchConfig, TiledPackageSearchFilters, TiledSearchConfig, TiledSearchFilters } from '../../types/searchFilters';
/**
 * JSON-encode the filter values the Tiled server parses as JSON.
 *
 * `filter[contains][condition][value]` and its five siblings are read server-side with `json.loads`,
 * so matching the string `xas_scan` requires sending `"xas_scan"` — quotes included. The package
 * forwards `value` verbatim, which left every caller hand-quoting, and every caller who forgot with a
 * query the server rejects as malformed. Numbers and booleans are valid JSON bare, so the mistake
 * shows up only for strings and reads as intermittent.
 *
 * Encoding is unconditional. There is deliberately no attempt to detect an already-encoded value,
 * because it is not decidable: given the string `"5"` there is no way to tell "the caller already
 * encoded the number 5" from "the caller wants the two-character string `5`". `value` therefore
 * always means a real JavaScript value, and pre-quoting is a bug the widened types now catch.
 *
 * Filters not listed here are left exactly as they are: `fulltext.text`, `regex.pattern`,
 * `like.pattern`, `lookup.key` and `structureFamily.value` are plain strings server-side and encoding
 * them would break them, and the package already JSON-encodes `specs.include` / `specs.exclude`.
 */
export declare function encodeSearchConfig(config?: TiledSearchConfig): TiledPackageSearchConfig | undefined;
/** The filter half of {@link encodeSearchConfig}. */
export declare function encodeSearchFilters(filters: TiledSearchFilters): TiledPackageSearchFilters;
//# sourceMappingURL=encodeSearchConfig.d.ts.map