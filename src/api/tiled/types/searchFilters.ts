import type {
    TiledSearchConfig as TiledPackageSearchConfig,
    TiledSearchFilters as TiledPackageSearchFilters,
    TiledSearchOptions,
} from '@blueskyproject/tiled';

/**
 * Search filters, widened so that callers pass **real values** rather than pre-encoded JSON.
 *
 * Six of Tiled's filters — `eq`, `noteq`, `comparison`, `contains`, `in`, `notin` — have a `value`
 * the *server* parses as JSON. The package types that field `string` and forwards it verbatim, so
 * matching the string `xas_scan` meant writing `value: '"xas_scan"'`, quotes and all. Miss the quotes
 * and the server rejects the query as malformed — except when the value happens to be a number or a
 * boolean, which are valid JSON bare, so the mistake looks intermittent rather than systematic.
 *
 * These types accept `string | number | boolean | null` and the hooks encode on the way out (see
 * `hooks/internal/encodeSearchConfig.ts`). Pass `'xas_scan'`, not `'"xas_scan"'`.
 *
 * The other filters are untouched: `fulltext.text`, `regex.pattern`, `like.pattern`, `lookup.key`
 * and `structureFamily.value` are plain strings server-side and must **not** be encoded, and the
 * package already JSON-encodes `specs.include` / `specs.exclude` itself.
 */

/** The filter names whose `value` the Tiled server parses as JSON. */
export const JSON_VALUED_FILTERS = [
    'eq',
    'noteq',
    'comparison',
    'contains',
    'in',
    'notin',
] as const satisfies readonly (keyof TiledPackageSearchFilters)[];

export type TiledJsonValuedFilterName = (typeof JSON_VALUED_FILTERS)[number];

/**
 * What a JSON-valued filter accepts.
 *
 * `null` is a real value here — it matches a metadata key explicitly set to JSON `null`, which is
 * different from the key being absent (that is `keyPresent`).
 */
export type TiledFilterValue = string | number | boolean | null;

/** Equality filter (`eq` / `noteq`). Pass the value itself; it is JSON-encoded for you. */
export interface TiledEqualityFilter {
    key: string;
    value: TiledFilterValue;
}

/** Ordered comparison. Pass the value itself; it is JSON-encoded for you. */
export interface TiledComparisonFilter {
    operator: 'gt' | 'gte' | 'lt' | 'lte';
    key: string;
    value: TiledFilterValue;
}

/** Membership of an array-valued metadata key. Pass the value itself; it is JSON-encoded for you. */
export interface TiledContainsFilter {
    key: string;
    value: TiledFilterValue;
}

/** Membership of a set (`in` / `notin`). Each element is JSON-encoded for you. */
export interface TiledInFilter {
    key: string;
    value: TiledFilterValue[];
}

/**
 * Every Tiled search filter, with the six JSON-valued ones widened.
 *
 * The rest are the package's own types, unchanged — `Omit` then re-add, so a filter the package adds
 * later appears here automatically and only the six listed above are ever overridden.
 */
export interface TiledSearchFilters extends Omit<
    TiledPackageSearchFilters,
    TiledJsonValuedFilterName
> {
    eq?: TiledEqualityFilter;
    noteq?: TiledEqualityFilter;
    comparison?: TiledComparisonFilter;
    contains?: TiledContainsFilter;
    in?: TiledInFilter;
    notin?: TiledInFilter;
}

/** A search's filters and its pagination/sorting, with values passed as themselves. */
export interface TiledSearchConfig {
    searchFilters?: TiledSearchFilters;
    searchOptions?: TiledSearchOptions;
}

export type { TiledPackageSearchConfig, TiledPackageSearchFilters };
