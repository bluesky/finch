import type { FinchQueryScope } from '@/api/shared/queryKeys';
import type { TiledSearchConfig } from '../types/common';
import type {
    TiledArrayReturnType,
    TiledTableEndpoint,
    TiledTableReturnType,
} from '../types/packageAliases';
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
 * - **Args are projections, never raw option objects.** See `internal/keyParts.ts`: the package's
 *   option objects can carry a whole `arrayItem`, which identifies no request of its own.
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
 * Only five, because Tiled has few endpoints and many parameters. In particular all seven search
 * hooks share the `search` root: they call one endpoint, and the `TiledSearchConfig` in the args
 * fully determines the response — so two hooks that build the same filters correctly share one
 * entry, and `['tiled','search']` invalidates every search however it was expressed.
 */
export const tiledQueryRoots = {
    search: [TILED_QUERY_ROOT, 'search'],
    metadata: [TILED_QUERY_ROOT, 'metadata'],
    array: [TILED_QUERY_ROOT, 'array'],
    table: [TILED_QUERY_ROOT, 'table'],
    serverInfo: [TILED_QUERY_ROOT, 'serverInfo'],
} as const satisfies Record<string, readonly [typeof TILED_QUERY_ROOT, string]>;

export type TiledQueryRootName = keyof typeof tiledQueryRoots;

/** Every resource prefix, for bulk invalidation helpers. */
export const TILED_QUERY_ROOT_NAMES = Object.keys(tiledQueryRoots) as TiledQueryRootName[];

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
    serverInfo: (scope: TiledQueryScope) => [...tiledQueryRoots.serverInfo, null, scope] as const,
} as const;

/** The key type a given resource produces, for parameterizing `FinchQueryOptions`. */
export type TiledQueryKeyFor<N extends TiledQueryRootName> = ReturnType<(typeof tiledQueryKeys)[N]>;
