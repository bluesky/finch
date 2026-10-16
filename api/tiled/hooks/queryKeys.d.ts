import { FinchQueryScope } from '../../shared/queryKeys';
import { TiledDistinctConfig, TiledSearchConfig } from '../types/common';
import { TiledArrayReturnType, TiledTableEndpoint, TiledTableReturnType } from '../types/dataOptions';
import { TiledGraphEntityFilters, TiledGraphLinkFilters, TiledGraphNodeEntityFilters, TiledGraphQLVariables } from '../types/graph';
import { TiledArrayKeyParts, TiledTableKeyParts } from './internal/keyParts';
/**
 * Query keys for the Tiled hooks.
 *
 * Every key has the four-element shape every Finch backend uses — see `@/api/shared/queryKeys` for
 * why the scope is last and why credentials never appear in a key:
 *
 * ```
 * [ 'tiled', <resource>, <args | null>, <scope> ]
 * ```
 *
 * Two things are specific to Tiled, and both are load-bearing:
 *
 * - **The scope carries `initialPath` as well as `baseUrl`.** Tiled prepends the client's initial path
 *   to every relative request path, so the same relative path against two different prefixes is two
 *   different pieces of data. Keying on the base URL alone would serve one from the other's cache.
 * - **Args are projections, never raw option objects.** See `internal/keyParts.ts`: an array or
 *   table options object can carry a whole `arrayItem`, a `signal` with a fresh identity every
 *   render, and possibly a substitute client — none of which identify a request. Keying on one
 *   directly would rewrite the key every render and refetch forever.
 *
 * Call `invalidateAllTiledQueries` after logging in or rotating a key.
 */
export declare const TILED_QUERY_ROOT: "tiled";
export { INJECTED_CLIENT_SCOPE } from '../../shared/queryKeys';
/**
 * Which Tiled namespace a cached entry belongs to. Always the last element of a key.
 *
 * `initialPath` is `''` for a client with no prefix, and also for any request made with
 * `pathMode: 'absolute'` — which is correct, because such a request ignores the prefix entirely.
 */
export interface TiledQueryScope extends FinchQueryScope {
    readonly initialPath: string;
}
/**
 * The resource prefix of every query hook.
 *
 * Fifteen now, where there were five: the client covers the whole API rather than the read subset
 * the package exposed, plus the graph-of-links GraphQL endpoint (`graph`). The grouping is by **resource**, not by endpoint — all seven search hooks
 * still share the `search` root, because they call one endpoint and the `TiledSearchConfig` in the
 * args fully determines the response, so two hooks that build the same filters correctly share one
 * entry and `['tiled','search']` invalidates every search however it was expressed.
 *
 * Roots are also deliberately transport-agnostic: nothing here names HTTP. When a websocket
 * eventually pushes an update for a node, it invalidates `metadata` through the same surface.
 */
export declare const tiledQueryRoots: {
    readonly search: readonly ["tiled", "search"];
    readonly distinct: readonly ["tiled", "distinct"];
    readonly metadata: readonly ["tiled", "metadata"];
    readonly array: readonly ["tiled", "array"];
    readonly table: readonly ["tiled", "table"];
    readonly container: readonly ["tiled", "container"];
    readonly node: readonly ["tiled", "node"];
    readonly awkward: readonly ["tiled", "awkward"];
    readonly ragged: readonly ["tiled", "ragged"];
    readonly revisions: readonly ["tiled", "revisions"];
    readonly asset: readonly ["tiled", "asset"];
    readonly webhooks: readonly ["tiled", "webhooks"];
    readonly serverInfo: readonly ["tiled", "serverInfo"];
    readonly auth: readonly ["tiled", "auth"];
    readonly graph: readonly ["tiled", "graph"];
};
export type TiledQueryRootName = keyof typeof tiledQueryRoots;
/** Every resource prefix, for bulk invalidation helpers. */
export declare const TILED_QUERY_ROOT_NAMES: TiledQueryRootName[];
/**
 * Which whole-server read a `serverInfo` entry is. `null` is `useTiledServerInfoQuery`.
 *
 * `'about'` is the strict reader (`useTiledAboutQuery`). It is a separate entry from the `null` one
 * even though both `GET /api/v1/`, because they do not return the same thing: the nullable hook
 * resolves `null` for an unreachable server where the strict one rejects. Sharing a key let the
 * strict hook hand a caller a cached `null` its type says is impossible.
 */
export type TiledServerInfoVariant = 'about' | 'healthz' | 'uiSettings' | 'metrics';
/** What identifies one search request: where it looked, and what it asked for. */
export interface TiledSearchKeyArgs {
    readonly searchPath: string;
    readonly config: TiledSearchConfig | null;
}
/** What identifies one array read. `options` is the projection, not the caller's object. */
export interface TiledArrayKeyArgs {
    readonly arrayPath: string;
    readonly type: TiledArrayReturnType;
    readonly options: TiledArrayKeyParts;
}
/** What identifies one table read. */
export interface TiledTableKeyArgs {
    readonly tablePath: string;
    readonly type: TiledTableReturnType;
    readonly endpoint: TiledTableEndpoint;
    readonly options: TiledTableKeyParts;
}
/** What identifies one distinct request: where it looked, and which facets it asked for. */
export interface TiledDistinctKeyArgs {
    readonly searchPath: string;
    readonly config: TiledDistinctConfig | null;
}
/**
 * What identifies a container / node / awkward / ragged read.
 *
 * One shape for four resources, because they take the same three things: a path, a field or buffer
 * selection, and a format. The root keeps them in separate namespaces.
 */
export interface TiledNodeKeyArgs {
    readonly path: string;
    readonly selection: readonly string[] | null;
    readonly format: string | null;
}
/** What identifies one page of a node's revision history. */
export interface TiledRevisionsKeyArgs {
    readonly path: string;
    readonly pageOffset: number | null;
    readonly pageCursor: number | null;
    readonly pageLimit: number | null;
}
/** What identifies one asset read. */
export interface TiledAssetKeyArgs {
    readonly path: string;
    readonly id: number;
    readonly kind: 'bytes' | 'manifest';
    readonly relativePath: string | null;
}
/** What identifies a webhook read: a node's registrations, or one webhook's delivery history. */
export type TiledWebhookKeyArgs = {
    readonly kind: 'list';
    readonly path: string;
} | {
    readonly kind: 'history';
    readonly webhookId: number;
    readonly limit: number | null;
};
/**
 * What identifies one graph read.
 *
 * Every graph read shares the one `graph` root, distinguished by `op`, because graph writes ripple
 * across all of them: deleting an entity deletes its links, and registering a namespace changes how
 * every predicate and property is rendered. One root means every graph mutation can refresh
 * everything graph-shaped, including raw documents whose contents the client cannot inspect.
 *
 * Filters are the caller's plain object — no signal or client rides along — and keys hash through
 * JSON, so `{}` and `{ entityType: undefined }` are one entry.
 */
export type TiledGraphKeyArgs = {
    readonly op: 'entity';
    readonly id: string;
} | {
    readonly op: 'entities';
    readonly filters: TiledGraphEntityFilters;
} | {
    readonly op: 'nodeEntities';
    /** As the caller wrote it; the scope's `initialPath` completes it. */
    readonly path: string;
    readonly filters: TiledGraphNodeEntityFilters;
} | {
    readonly op: 'link';
    readonly id: string;
} | {
    readonly op: 'links';
    readonly filters: TiledGraphLinkFilters;
} | {
    readonly op: 'namespaces';
} | {
    readonly op: 'raw';
    readonly document: string;
    readonly variables: TiledGraphQLVariables;
};
/**
 * Key builders, one per resource.
 *
 * Each takes the scope first and the request's identity second. Build keys with these rather than by
 * hand — a hand-written key that differs by one element is a cache entry no mutation can refresh.
 */
export declare const tiledQueryKeys: {
    readonly search: (scope: TiledQueryScope, args: TiledSearchKeyArgs) => readonly ["tiled", "search", TiledSearchKeyArgs, TiledQueryScope];
    readonly metadata: (scope: TiledQueryScope, path: string) => readonly ["tiled", "metadata", string, TiledQueryScope];
    readonly array: (scope: TiledQueryScope, args: TiledArrayKeyArgs) => readonly ["tiled", "array", TiledArrayKeyArgs, TiledQueryScope];
    readonly table: (scope: TiledQueryScope, args: TiledTableKeyArgs) => readonly ["tiled", "table", TiledTableKeyArgs, TiledQueryScope];
    readonly distinct: (scope: TiledQueryScope, args: TiledDistinctKeyArgs) => readonly ["tiled", "distinct", TiledDistinctKeyArgs, TiledQueryScope];
    readonly container: (scope: TiledQueryScope, args: TiledNodeKeyArgs) => readonly ["tiled", "container", TiledNodeKeyArgs, TiledQueryScope];
    readonly node: (scope: TiledQueryScope, args: TiledNodeKeyArgs) => readonly ["tiled", "node", TiledNodeKeyArgs, TiledQueryScope];
    readonly awkward: (scope: TiledQueryScope, args: TiledNodeKeyArgs) => readonly ["tiled", "awkward", TiledNodeKeyArgs, TiledQueryScope];
    readonly ragged: (scope: TiledQueryScope, args: TiledNodeKeyArgs) => readonly ["tiled", "ragged", TiledNodeKeyArgs, TiledQueryScope];
    readonly revisions: (scope: TiledQueryScope, args: TiledRevisionsKeyArgs) => readonly ["tiled", "revisions", TiledRevisionsKeyArgs, TiledQueryScope];
    readonly asset: (scope: TiledQueryScope, args: TiledAssetKeyArgs) => readonly ["tiled", "asset", TiledAssetKeyArgs, TiledQueryScope];
    readonly webhooks: (scope: TiledQueryScope, args: TiledWebhookKeyArgs) => readonly ["tiled", "webhooks", TiledWebhookKeyArgs, TiledQueryScope];
    readonly serverInfo: (scope: TiledQueryScope) => readonly ["tiled", "serverInfo", null, TiledQueryScope];
    /**
     * The other whole-server reads — the strict About reader, `/healthz`, `/tiled-ui-settings` and
     * `/api/v1/metrics`.
     *
     * They share the `serverInfo` root rather than getting four roots of their own: they are all
     * "ask the server about itself", nothing invalidates one without invalidating the others, and a
     * root per endpoint would make `['tiled','serverInfo']` stop meaning what it says. The variant
     * name sits in the args slot, which is what keeps their entries distinct.
     */
    readonly serverInfoVariant: (scope: TiledQueryScope, variant: TiledServerInfoVariant) => readonly ["tiled", "serverInfo", TiledServerInfoVariant, TiledQueryScope];
    /**
     * Identity-scoped reads: `whoami`, and anything else that answers "who am I and what may I
     * see". `null` args because the answer is determined entirely by the credentials, which are
     * deliberately absent from every key — a secret does not belong in the Devtools cache
     * inspector. That is exactly why a credential change invalidates rather than re-keys.
     */
    readonly auth: (scope: TiledQueryScope) => readonly ["tiled", "auth", null, TiledQueryScope];
    readonly graph: (scope: TiledQueryScope, args: TiledGraphKeyArgs) => readonly ["tiled", "graph", TiledGraphKeyArgs, TiledQueryScope];
};
/** The key type a given resource produces, for parameterizing `FinchQueryOptions`. */
export type TiledQueryKeyFor<N extends TiledQueryRootName> = ReturnType<(typeof tiledQueryKeys)[N]>;
/**
 * The key type of the non-About whole-server reads.
 *
 * Separate from `TiledQueryKeyFor<'serverInfo'>` because they differ in the args slot — `null` for
 * the About document, a variant name for the others — and a hook's `FinchQueryOptions` is
 * parameterised by its exact key type.
 */
export type TiledServerInfoVariantKey = ReturnType<typeof tiledQueryKeys.serverInfoVariant>;
//# sourceMappingURL=queryKeys.d.ts.map