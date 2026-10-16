import { TiledDistinctConfig, TiledSearchConfig, TiledSearchFilters, TiledSearchOptions } from '../types/searchFilters';
/**
 * Turn a {@link TiledSearchConfig} into query parameters.
 *
 * This lives in `client/` rather than `hooks/internal/`, where its predecessor did, because it is
 * transport: a caller using the free functions from a `useEffect` or a plain module needs the same
 * encoding a hook gets, and the hook layer is not where that belongs.
 *
 * Everything below was verified against a live Tiled 0.2.15b1, not just read off the spec. That
 * mattered: the spec says a parameter's type, but not whether a list travels as repeated keys or as
 * one JSON array, and Tiled uses **both** depending on the filter.
 *
 * ## Three parameter names are corrections
 *
 * `@blueskyproject/tiled` sends three names the server does not have. FastAPI drops an unknown
 * query parameter rather than rejecting it, so the filter simply never applied and the search came
 * back unfiltered — which reads as "the filter matched everything", not as a bug.
 *
 * | Filter | Package sends | Server expects |
 * | --- | --- | --- |
 * | `keysFilter` | `filter[keys][condition][keys][]` | `filter[keys_filter][condition][keys]` |
 * | `keyPresent` | `filter[key_present][condition][…]` | `filter[keypresent][condition][…]` |
 * | `accessBlob` | `filter[access_blob][condition][…]` | `filter[access_blob_filter][condition][…]` |
 *
 * Confirmed twice over: the spec's query parameter list, and the live server's own `About.queries`
 * (`['fulltext', 'lookup', 'keys_filter', 'regex', …, 'keypresent', 'like', 'specs',
 * 'access_blob_filter', 'structure_family']`).
 *
 * ## Lists travel two different ways, and getting it wrong is a 500
 *
 * **Repeated keys** — `fields`, `sort`, `column`, `field`, `form_key`, and `distinct`'s `metadata`:
 * `fields=specs&fields=metadata`. Axios's default serialiser writes `fields[]=…`, which the server
 * ignores, so the client sets `paramsSerializer: { indexes: null }`; see `TILED_PARAMS_SERIALIZER`
 * in `TiledApiClient.ts`.
 *
 * **One JSON array in one parameter** — `keys_filter.keys`, `in.value`, `notin.value`, and
 * `specs.include` / `specs.exclude`: `filter[in][condition][value]=["count"]`. Sent as repeated
 * keys instead, `in` matches nothing and `keys_filter` answers **500**.
 *
 * `specs` additionally needs **both** `include` and `exclude` present; sending `include` alone is a
 * 500. Both are always written, which is why `TiledSpecsFilter` requires both fields.
 *
 * ## Scalar values
 *
 * Six filters have a `value` the server reads with `json.loads`, so a string has to arrive quoted.
 * Encoding is unconditional and there is deliberately no attempt to detect an already-encoded
 * value, because it is not decidable: given `"5"` there is no telling "the caller already encoded
 * the number 5" from "the caller wants the two-character string `5`". `value` always means a real
 * JavaScript value; pre-quoting is a bug the widened types in `types/searchFilters.ts` now catch.
 */
export type TiledQueryParams = Record<string, string | number | boolean | string[] | undefined>;
/** Encode filters and options together — what `getSearch` sends. */
export declare function buildSearchParams(config?: TiledSearchConfig): TiledQueryParams;
/** Encode a distinct request: the same filters, plus which facets to compute. */
export declare function buildDistinctParams(config?: TiledDistinctConfig): TiledQueryParams;
/** Pagination, sorting and field selection. */
export declare function buildSearchOptionParams(options?: TiledSearchOptions): TiledQueryParams;
/** The filter half, shared by search and distinct. */
export declare function buildFilterParams(filters?: TiledSearchFilters): TiledQueryParams;
//# sourceMappingURL=searchParams.d.ts.map