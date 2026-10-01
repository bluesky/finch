import type { FinchQueryScope } from '@/api/shared/queryKeys';
import type { TiledDistinctConfig, TiledSearchConfig } from '../types/common';
import type {
    TiledArrayReturnType,
    TiledTableEndpoint,
    TiledTableReturnType,
} from '../types/dataOptions';
import type { TiledArrayKeyParts, TiledTableKeyParts } from './internal/keyParts';

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
export const TILED_QUERY_ROOT = 'tiled' as const;

export { INJECTED_CLIENT_SCOPE } from '@/api/shared/queryKeys';

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
 * Fourteen now, where there were five: the client covers the whole API rather than the read subset
 * the package exposed. The grouping is by **resource**, not by endpoint — all seven search hooks
 * still share the `search` root, because they call one endpoint and the `TiledSearchConfig` in the
 * args fully determines the response, so two hooks that build the same filters correctly share one
 * entry and `['tiled','search']` invalidates every search however it was expressed.
 *
 * Roots are also deliberately transport-agnostic: nothing here names HTTP. When a websocket
 * eventually pushes an update for a node, it invalidates `metadata` through the same surface.
 */
export const tiledQueryRoots = {
    search: [TILED_QUERY_ROOT, 'search'],
    distinct: [TILED_QUERY_ROOT, 'distinct'],
    metadata: [TILED_QUERY_ROOT, 'metadata'],
    array: [TILED_QUERY_ROOT, 'array'],
    table: [TILED_QUERY_ROOT, 'table'],
    container: [TILED_QUERY_ROOT, 'container'],
    node: [TILED_QUERY_ROOT, 'node'],
    awkward: [TILED_QUERY_ROOT, 'awkward'],
    ragged: [TILED_QUERY_ROOT, 'ragged'],
    revisions: [TILED_QUERY_ROOT, 'revisions'],
    asset: [TILED_QUERY_ROOT, 'asset'],
    webhooks: [TILED_QUERY_ROOT, 'webhooks'],
    serverInfo: [TILED_QUERY_ROOT, 'serverInfo'],
    auth: [TILED_QUERY_ROOT, 'auth'],
} as const satisfies Record<string, readonly [typeof TILED_QUERY_ROOT, string]>;

export type TiledQueryRootName = keyof typeof tiledQueryRoots;

/** Every resource prefix, for bulk invalidation helpers. */
export const TILED_QUERY_ROOT_NAMES = Object.keys(tiledQueryRoots) as TiledQueryRootName[];

/** Which whole-server read a `serverInfo` entry is. `null` is the About document itself. */
export type TiledServerInfoVariant = 'healthz' | 'uiSettings' | 'metrics';

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
export type TiledWebhookKeyArgs =
    | { readonly kind: 'list'; readonly path: string }
    | { readonly kind: 'history'; readonly webhookId: number; readonly limit: number | null };

/**
 * Key builders, one per resource.
 *
 * Each takes the scope first and the request's identity second. Build keys with these rather than by
 * hand — a hand-written key that differs by one element is a cache entry no mutation can refresh.
 */
export const tiledQueryKeys = {
    search: (scope: TiledQueryScope, args: TiledSearchKeyArgs) =>
        [...tiledQueryRoots.search, args, scope] as const,
    metadata: (scope: TiledQueryScope, path: string) =>
        [...tiledQueryRoots.metadata, path, scope] as const,
    array: (scope: TiledQueryScope, args: TiledArrayKeyArgs) =>
        [...tiledQueryRoots.array, args, scope] as const,
    table: (scope: TiledQueryScope, args: TiledTableKeyArgs) =>
        [...tiledQueryRoots.table, args, scope] as const,
    distinct: (scope: TiledQueryScope, args: TiledDistinctKeyArgs) =>
        [...tiledQueryRoots.distinct, args, scope] as const,
    container: (scope: TiledQueryScope, args: TiledNodeKeyArgs) =>
        [...tiledQueryRoots.container, args, scope] as const,
    node: (scope: TiledQueryScope, args: TiledNodeKeyArgs) =>
        [...tiledQueryRoots.node, args, scope] as const,
    awkward: (scope: TiledQueryScope, args: TiledNodeKeyArgs) =>
        [...tiledQueryRoots.awkward, args, scope] as const,
    ragged: (scope: TiledQueryScope, args: TiledNodeKeyArgs) =>
        [...tiledQueryRoots.ragged, args, scope] as const,
    revisions: (scope: TiledQueryScope, args: TiledRevisionsKeyArgs) =>
        [...tiledQueryRoots.revisions, args, scope] as const,
    asset: (scope: TiledQueryScope, args: TiledAssetKeyArgs) =>
        [...tiledQueryRoots.asset, args, scope] as const,
    webhooks: (scope: TiledQueryScope, args: TiledWebhookKeyArgs) =>
        [...tiledQueryRoots.webhooks, args, scope] as const,
    serverInfo: (scope: TiledQueryScope) => [...tiledQueryRoots.serverInfo, null, scope] as const,
    /**
     * The other whole-server reads — `/healthz`, `/tiled-ui-settings`, `/api/v1/metrics`.
     *
     * They share the `serverInfo` root rather than getting three roots of their own: they are all
     * "ask the server about itself", nothing invalidates one without invalidating the others, and a
     * root per endpoint would make `['tiled','serverInfo']` stop meaning what it says. The variant
     * name sits in the args slot, which is what keeps their entries distinct.
     */
    serverInfoVariant: (scope: TiledQueryScope, variant: TiledServerInfoVariant) =>
        [...tiledQueryRoots.serverInfo, variant, scope] as const,
    /**
     * Identity-scoped reads: `whoami`, and anything else that answers "who am I and what may I
     * see". `null` args because the answer is determined entirely by the credentials, which are
     * deliberately absent from every key — a secret does not belong in the Devtools cache
     * inspector. That is exactly why a credential change invalidates rather than re-keys.
     */
    auth: (scope: TiledQueryScope) => [...tiledQueryRoots.auth, null, scope] as const,
} as const;

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
