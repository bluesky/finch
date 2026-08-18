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
 * Every key has the same four-element shape:
 *
 * ```
 * [ 'tiled', <resource>, <args | null>, <scope> ]
 * ```
 *
 * Three properties of that layout are load-bearing:
 *
 * - **The scope is last.** Existing code invalidates with prefixes like `['tiled','search']`, and
 *   TanStack matches prefixes positionally — putting the server discriminator earlier would break
 *   every one of those calls. (The legacy hooks in `src/api/tiled/hooks.ts` put `baseUrl` third,
 *   which is exactly the mistake this avoids.)
 * - **The scope carries `initialPath` as well as `baseUrl`.** Tiled prepends the client's initial path
 *   to every relative request path, so the same relative path against two different prefixes is two
 *   different pieces of data. Keying on the base URL alone would serve one from the other's cache.
 * - **Args are projections, never raw option objects.** See `internal/keyParts.ts`: an options object
 *   carries a `signal`, a `client` and possibly a whole `arrayItem`, none of which belong in a cache
 *   key — a fresh `signal` per render would rewrite the key on every render and refetch forever.
 *
 * The API key is deliberately *not* part of any key: it would put a secret into the Devtools cache
 * inspector, and because auth is applied at request time a credential change invalidates everything
 * rather than one entry. Call `invalidateAllTiledQueries` after logging in or rotating a key.
 */
export const TILED_QUERY_ROOT = 'tiled' as const;

/** Stand-in scope for an injected client that cannot report a base URL. */
export const INJECTED_CLIENT_SCOPE = 'client:injected' as const;

/**
 * Which Tiled namespace a cached entry belongs to. Always the last element of a key.
 *
 * `initialPath` is `''` for a client with no prefix, and also for any request made with
 * `pathMode: 'absolute'` — which is correct, because such a request ignores the prefix entirely.
 */
export interface TiledQueryScope {
    readonly baseUrl: string;
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
