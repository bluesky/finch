import type {
    TiledFilterValue,
    TiledPackageSearchConfig,
    TiledPackageSearchFilters,
    TiledSearchConfig,
    TiledSearchFilters,
} from '../../types/searchFilters';

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
export function encodeSearchConfig(
    config?: TiledSearchConfig,
): TiledPackageSearchConfig | undefined {
    if (!config) return undefined;
    if (!config.searchFilters) return config as TiledPackageSearchConfig;

    return {
        ...config,
        searchFilters: encodeSearchFilters(config.searchFilters),
    };
}

/** The filter half of {@link encodeSearchConfig}. */
export function encodeSearchFilters(filters: TiledSearchFilters): TiledPackageSearchFilters {
    const { eq, noteq, comparison, contains, in: inFilter, notin, ...rest } = filters;

    // `rest` is every filter the package defines minus the six; spreading it forward means a filter
    // added by a future package version passes through untouched rather than being dropped.
    const encoded: TiledPackageSearchFilters = { ...rest };

    if (eq) encoded.eq = { key: eq.key, value: encodeValue(eq.value) };
    if (noteq) encoded.noteq = { key: noteq.key, value: encodeValue(noteq.value) };
    if (comparison) {
        encoded.comparison = {
            operator: comparison.operator,
            key: comparison.key,
            value: encodeValue(comparison.value),
        };
    }
    if (contains) encoded.contains = { key: contains.key, value: encodeValue(contains.value) };
    if (inFilter) encoded.in = { key: inFilter.key, value: inFilter.value.map(encodeValue) };
    if (notin) encoded.notin = { key: notin.key, value: notin.value.map(encodeValue) };

    return encoded;
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
