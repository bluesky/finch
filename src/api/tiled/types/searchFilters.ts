import type { EntryFields, Operator, StructureFamily } from './generatedAliases';

/**
 * Tiled's search filters and search options.
 *
 * Two things are going on here, and they are independent.
 *
 * **1. The filters are now defined locally.** They used to be `@blueskyproject/tiled`'s, with only
 * the six JSON-valued ones overridden. Defining all fifteen here means the set is checked against
 * `openapi.json` rather than against a package that was, in three places, wrong about the parameter
 * names — see `client/searchParams.ts`, which is where the encoding lives and where the fixes are
 * documented. The TypeScript key names are unchanged (`keysFilter`, `keyPresent`, `accessBlob`), so
 * no call site moves; only the strings that go on the wire were wrong.
 *
 * **2. Six filter values are widened, deliberately.** `eq`, `noteq`, `comparison`, `contains`, `in`
 * and `notin` have a `value` the *server* parses with `json.loads`. The package typed that field
 * `string` and forwarded it verbatim, so matching the string `xas_scan` meant writing
 * `value: '"xas_scan"'` — quotes and all. Miss the quotes and the server rejects the query, except
 * when the value happens to be a number or a boolean, which are valid JSON bare, so the mistake
 * looks intermittent rather than systematic.
 *
 * These types accept `string | number | boolean | null` and the encoder adds the quoting. Pass
 * `'xas_scan'`, not `'"xas_scan"'`.
 *
 * The other filters are untouched: `fulltext.text`, `regex.pattern`, `like.pattern`, `lookup.key`
 * and `structureFamily.value` are plain strings server-side and must **not** be encoded, and
 * `specs.include` / `specs.exclude` are JSON-encoded as whole arrays.
 */

/** The filter names whose `value` the Tiled server parses as JSON. */
export const JSON_VALUED_FILTERS = [
    'eq',
    'noteq',
    'comparison',
    'contains',
    'in',
    'notin',
] as const;

export type TiledJsonValuedFilterName = (typeof JSON_VALUED_FILTERS)[number];

/**
 * What a JSON-valued filter accepts.
 *
 * `null` is a real value here — it matches a metadata key explicitly set to JSON `null`, which is
 * different from the key being absent (that is `keyPresent`).
 */
export type TiledFilterValue = string | number | boolean | null;

/** Full-text search across metadata. */
export interface TiledFulltextFilter {
    text: string;
}

/** Fetch one node by metadata key. */
export interface TiledLookupFilter {
    key: string;
}

/** Restrict results to these child keys. */
export interface TiledKeysFilter {
    keys: string[];
}

/** Regular-expression match on a metadata key. */
export interface TiledRegexFilter {
    key: string;
    pattern: string;
    caseSensitive?: boolean;
}

/** Equality filter (`eq` / `noteq`). Pass the value itself; it is JSON-encoded for you. */
export interface TiledEqualityFilter {
    key: string;
    value: TiledFilterValue;
}

/** Ordered comparison. Pass the value itself; it is JSON-encoded for you. */
export interface TiledComparisonFilter {
    operator: Operator;
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

/** Whether a metadata key exists at all, regardless of its value. */
export interface TiledKeyPresentFilter {
    key: string;
    exists: boolean;
}

/** SQL-style `LIKE` pattern match. */
export interface TiledLikeFilter {
    key: string;
    pattern: string;
}

/** Filter by spec name. Both lists are JSON-encoded as whole arrays. */
export interface TiledSpecsFilter {
    include: string[];
    exclude: string[];
}

/** Filter by the access-control blob: owner and tags. */
export interface TiledAccessBlobFilter {
    userId?: string | null;
    tags?: string[];
}

/** Filter by structure family. */
export interface TiledStructureFamilyFilter {
    value: StructureFamily;
}

/** Every Tiled search filter. The server's own list is in `About.queries`. */
export interface TiledSearchFilters {
    fulltext?: TiledFulltextFilter;
    lookup?: TiledLookupFilter;
    keysFilter?: TiledKeysFilter;
    regex?: TiledRegexFilter;
    eq?: TiledEqualityFilter;
    noteq?: TiledEqualityFilter;
    comparison?: TiledComparisonFilter;
    contains?: TiledContainsFilter;
    in?: TiledInFilter;
    notin?: TiledInFilter;
    keyPresent?: TiledKeyPresentFilter;
    like?: TiledLikeFilter;
    specs?: TiledSpecsFilter;
    accessBlob?: TiledAccessBlobFilter;
    structureFamily?: TiledStructureFamilyFilter;
}

/**
 * Pagination, sorting and field selection.
 *
 * `pageCursor` is new: the spec has always had `page[cursor]` and the package never sent it, so
 * cursor pagination was unreachable. `fields` is typed as {@link EntryFields} rather than `string[]`
 * — the server rejects an unknown field name with a 422, and this turns that into a compile error.
 */
export interface TiledSearchOptions {
    /** Which parts of each node to return. */
    fields?: EntryFields[];
    /** Metadata selection pattern, e.g. `'start.plan_name'`. */
    selectMetadata?: string;
    /** Offset-based pagination. */
    pageOffset?: number;
    /** Cursor-based pagination. */
    pageCursor?: number;
    /** Page size. */
    pageLimit?: number;
    /** Sort key, optionally `-`-prefixed to reverse. */
    sort?: string;
    /** Maximum depth when recursing into nested containers. */
    maxDepth?: number;
    /** Omit the `links` block from each node. */
    omitLinks?: boolean;
    /** Include each node's data sources. */
    includeDataSources?: boolean;
}

/** A search's filters and its pagination/sorting, with values passed as themselves. */
export interface TiledSearchConfig {
    searchFilters?: TiledSearchFilters;
    searchOptions?: TiledSearchOptions;
}

/**
 * What `GET /distinct/{path}` asks for: which facets to compute, over the same filter set.
 *
 * Distinct takes every search filter but none of the search options — it aggregates rather than
 * paginates.
 */
export interface TiledDistinctConfig {
    searchFilters?: TiledSearchFilters;
    /** Include a facet over structure families. */
    structureFamilies?: boolean;
    /** Include a facet over specs. */
    specs?: boolean;
    /** Metadata keys to compute distinct values for. */
    metadata?: string[];
    /** Include an occurrence count beside each distinct value. */
    counts?: boolean;
}
