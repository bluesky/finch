/**
 * Types for Tiled's entity/link graph, served over GraphQL at `{origin}/api/graphql`.
 *
 * Hand-written, like `info.ts`, because the graph is not in `openapi.json`. They mirror
 * `../graph/schema.graphql` — the committed SDL that `TiledGraph.test.tsx` validates every operation
 * document against — so a field that drifts from the server fails a test rather than a request.
 */

/** Arbitrary JSON, as carried by the `properties` fields (GraphQL `JSON` scalar). */
export type TiledGraphJSON = unknown;

/**
 * A node in the graph: a project, a sample, a dataset — whatever `entityType` says.
 *
 * An entity is either **bound** to a node in this server's catalog (`isNodeBound`) or free-standing,
 * optionally pointing elsewhere through `uri`. Bound entities are deleted with their catalog node.
 */
export interface TiledGraphEntity {
    id: string;
    /** Whether the entity is tied to a catalog node. Which node is not exposed; use `uri`. */
    isNodeBound: boolean;
    /** The category, e.g. `'project'` or `'sample'`. Upstream will rename this `kind` (#1499). */
    entityType: string;
    name: string;
    uri: string | null;
    /**
     * Arbitrary JSON. Object **keys**, at any depth, are CURIE-expanded when written and compacted
     * when read, against the namespaces registered at that moment: `schema:name` is stored as
     * `https://schema.org/name` and read back as `schema:name`. Values are never rewritten. Register
     * a prefix before writing keys that use it, or they are stored as literal text.
     */
    properties: TiledGraphJSON | null;
    /** ISO 8601 timestamp. */
    createdAt: string;
}

/** A directed edge: `subject` —`predicate`→ `object`. */
export interface TiledGraphLink {
    id: string;
    subjectId: string;
    predicate: string;
    objectId: string;
    /** Same key expansion and compaction as {@link TiledGraphEntity.properties}. */
    properties: TiledGraphJSON | null;
    accessTags: string[];
    /** ISO 8601 timestamp. */
    createdAt: string;
}

/** A registered CURIE prefix, e.g. `{ prefix: 'schema', uri: 'https://schema.org/' }`. */
export interface TiledGraphNamespace {
    prefix: string;
    uri: string;
}

/**
 * One page of a list. The server defaults to 100 and reports **no total count**: a page shorter
 * than `limit` is the only sign there is nothing more.
 */
export interface TiledGraphPage {
    limit?: number;
    offset?: number;
}

/** Filters for `entities`. Omitted filters match everything. */
export interface TiledGraphEntityFilters extends TiledGraphPage {
    entityType?: string;
    /** Only entities bound to this catalog node, as key segments: `['raw', 'S001']`. */
    nodePathParts?: string[];
}

/** Filters for `links`. Predicates may be CURIEs; the server expands them before matching. */
export interface TiledGraphLinkFilters extends TiledGraphPage {
    subjectId?: string;
    predicate?: string;
    objectId?: string;
}

export interface TiledGraphCreateEntityInput {
    entityType: string;
    name: string;
    /**
     * Bind to a catalog node by its key segments. The server resolves the path and rejects one that
     * names no node with `NODE_NOT_FOUND`.
     */
    nodePathParts?: string[] | null;
    uri?: string | null;
    properties?: TiledGraphJSON | null;
    accessTags?: string[] | null;
}

/**
 * Fields to change on an entity.
 *
 * **Three states, not two.** An omitted field is left as it is; `null` clears it (for
 * `nodePathParts`, detaches the entity from its node); a value sets it. The client sends exactly
 * what is given — `undefined` keys are dropped on the wire, `null` survives — so build this object
 * with only the fields you mean to touch.
 *
 * `properties` cannot be changed after creation; the server has no field for it.
 */
export interface TiledGraphUpdateEntityInput {
    name?: string | null;
    entityType?: string | null;
    nodePathParts?: string[] | null;
    uri?: string | null;
    accessTags?: string[] | null;
}

/**
 * What `bindGraphEntity` takes: a create input whose node binding and `uri` are filled in from the
 * node's path, and whose `name` defaults to the node's key.
 */
export interface TiledGraphBindEntityInput extends Omit<
    TiledGraphCreateEntityInput,
    'nodePathParts' | 'uri' | 'name'
> {
    /** Defaults to the node's key, the last segment of its path. */
    name?: string;
}

/** Filters for the entities bound to one node; the node itself is the path argument. */
export type TiledGraphNodeEntityFilters = Omit<TiledGraphEntityFilters, 'nodePathParts'>;

/**
 * Where an entity's `uri` says its catalog node is.
 *
 * Read from `uri` because the server does not say which node an entity is bound to. Only entities
 * whose `uri` is a Tiled metadata URL have one — `bindGraphEntity` writes it that way.
 */
export interface TiledGraphEntityNodePath {
    /**
     * The node's path from the server root, decoded: `'bl531/raw/3f2c9a1e'`. Absolute, so read it
     * with `pathMode: 'absolute'`; the client's own `initialPath` is not applied to it.
     */
    path: string;
    /**
     * Whether the URL names the server this client is configured for. `false` after a server moves
     * host, or for an entity written against another server; the path may still be right.
     */
    sameServer: boolean;
}

export interface TiledGraphCreateLinkInput {
    subjectId: string;
    predicate: string;
    objectId: string;
    properties?: TiledGraphJSON | null;
    accessTags?: string[] | null;
}

/** Fields to change on a link. Same three-state rule as {@link TiledGraphUpdateEntityInput}. */
export interface TiledGraphUpdateLinkInput {
    predicate?: string | null;
    accessTags?: string[] | null;
}

/** One entry of a GraphQL response's `errors` array. */
export interface TiledGraphQLErrorEntry {
    message: string;
    path?: (string | number)[];
    locations?: { line: number; column: number }[];
    /** Tiled puts a machine-readable `code` here for some failures, e.g. `NODE_NOT_FOUND`. */
    extensions?: { code?: string; [key: string]: unknown };
}

/** The GraphQL response envelope. `data` may be partial, or `null`, when `errors` is present. */
export interface TiledGraphQLResponse<T> {
    data?: T | null;
    errors?: TiledGraphQLErrorEntry[];
}

/** Variables for a GraphQL document. */
export type TiledGraphQLVariables = Record<string, unknown>;
