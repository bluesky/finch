import type {
    TiledDistinctConfig,
    TiledFilterValue,
    TiledSearchConfig,
    TiledSearchFilters,
    TiledSearchOptions,
} from '../types/searchFilters';

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
export function buildSearchParams(config: TiledSearchConfig = {}): TiledQueryParams {
    return {
        ...buildSearchOptionParams(config.searchOptions),
        ...buildFilterParams(config.searchFilters),
    };
}

/** Encode a distinct request: the same filters, plus which facets to compute. */
export function buildDistinctParams(config: TiledDistinctConfig = {}): TiledQueryParams {
    const params: TiledQueryParams = { ...buildFilterParams(config.searchFilters) };

    if (config.structureFamilies !== undefined)
        params.structure_families = config.structureFamilies;
    if (config.specs !== undefined) params.specs = config.specs;
    if (config.counts !== undefined) params.counts = config.counts;
    if (config.metadata?.length) params.metadata = config.metadata;

    return params;
}

/** Pagination, sorting and field selection. */
export function buildSearchOptionParams(options?: TiledSearchOptions): TiledQueryParams {
    const params: TiledQueryParams = {};
    if (!options) return params;

    if (options.pageOffset !== undefined) params['page[offset]'] = options.pageOffset;
    if (options.pageCursor !== undefined) params['page[cursor]'] = options.pageCursor;
    if (options.pageLimit !== undefined) params['page[limit]'] = options.pageLimit;
    if (options.sort) params.sort = options.sort;
    if (options.selectMetadata) params.select_metadata = options.selectMetadata;
    if (options.maxDepth !== undefined) params.max_depth = options.maxDepth;
    if (options.omitLinks !== undefined) params.omit_links = options.omitLinks;
    if (options.includeDataSources !== undefined) {
        params.include_data_sources = options.includeDataSources;
    }
    if (options.fields?.length) params.fields = [...options.fields];

    return params;
}

/** The filter half, shared by search and distinct. */
export function buildFilterParams(filters?: TiledSearchFilters): TiledQueryParams {
    const params: TiledQueryParams = {};
    if (!filters) return params;

    const {
        fulltext,
        lookup,
        keysFilter,
        regex,
        eq,
        noteq,
        comparison,
        contains,
        in: inFilter,
        notin,
        keyPresent,
        like,
        specs,
        accessBlob,
        structureFamily,
    } = filters;

    if (fulltext) params[condition('fulltext', 'text')] = fulltext.text;

    if (lookup) params[condition('lookup', 'key')] = lookup.key;

    // `keys_filter`, not `keys`, and one JSON array rather than repeated keys — see the header.
    if (keysFilter?.keys.length) {
        params[condition('keys_filter', 'keys')] = JSON.stringify(keysFilter.keys);
    }

    if (regex) {
        params[condition('regex', 'key')] = regex.key;
        params[condition('regex', 'pattern')] = regex.pattern;
        if (regex.caseSensitive !== undefined) {
            params[condition('regex', 'case_sensitive')] = regex.caseSensitive;
        }
    }

    if (eq) {
        params[condition('eq', 'key')] = eq.key;
        params[condition('eq', 'value')] = encodeValue(eq.value);
    }

    if (noteq) {
        params[condition('noteq', 'key')] = noteq.key;
        params[condition('noteq', 'value')] = encodeValue(noteq.value);
    }

    if (comparison) {
        params[condition('comparison', 'operator')] = comparison.operator;
        params[condition('comparison', 'key')] = comparison.key;
        params[condition('comparison', 'value')] = encodeValue(comparison.value);
    }

    if (contains) {
        params[condition('contains', 'key')] = contains.key;
        params[condition('contains', 'value')] = encodeValue(contains.value);
    }

    // One JSON array, not repeated keys — see the header.
    if (inFilter) {
        params[condition('in', 'key')] = inFilter.key;
        params[condition('in', 'value')] = JSON.stringify(inFilter.value);
    }

    if (notin) {
        params[condition('notin', 'key')] = notin.key;
        params[condition('notin', 'value')] = JSON.stringify(notin.value);
    }

    // `keypresent`, not `key_present` — see the header table.
    if (keyPresent) {
        params[condition('keypresent', 'key')] = keyPresent.key;
        params[condition('keypresent', 'exists')] = keyPresent.exists;
    }

    if (like) {
        params[condition('like', 'key')] = like.key;
        params[condition('like', 'pattern')] = like.pattern;
    }

    // Both lists travel as whole JSON arrays, which is what the server parses here.
    if (specs) {
        params[condition('specs', 'include')] = JSON.stringify(specs.include);
        params[condition('specs', 'exclude')] = JSON.stringify(specs.exclude);
    }

    // `access_blob_filter`, not `access_blob` — see the header table.
    if (accessBlob) {
        if (accessBlob.userId) {
            params[condition('access_blob_filter', 'user_id')] = accessBlob.userId;
        }
        // Encoded like its sibling list filters. Unverified against a live server: this one 500s
        // on a deployment with access control disabled, whatever the encoding, so there was nothing
        // to probe against.
        if (accessBlob.tags?.length) {
            params[condition('access_blob_filter', 'tags')] = JSON.stringify(accessBlob.tags);
        }
    }

    if (structureFamily) {
        params[condition('structure_family', 'value')] = structureFamily.value;
    }

    return params;
}

/** `filter[<name>][condition][<field>]` — the only shape Tiled's filter parameters take. */
function condition(filter: string, field: string): string {
    return `filter[${filter}][condition][${field}]`;
}

/**
 * One value to its JSON text.
 *
 * `undefined` is not part of `TiledFilterValue`, but it is what a caller gets from an absent object
 * property, and `JSON.stringify(undefined)` returns `undefined` rather than a string — which would
 * put the literal text `undefined` in the query. It is normalised to JSON `null` instead, so the
 * request stays well-formed and the server answers "nothing matches null" rather than 422.
 */
function encodeValue(value: TiledFilterValue): string {
    return JSON.stringify(value ?? null);
}
