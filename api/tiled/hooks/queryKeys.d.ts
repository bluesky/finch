import { FinchQueryScope } from '../../shared/queryKeys';
import { TiledSearchConfig } from '../types/common';
import { TiledArrayReturnType, TiledTableEndpoint, TiledTableReturnType } from '../types/packageAliases';
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
 * - **Args are projections, never raw option objects.** See `internal/keyParts.ts`: the package's
 *   option objects can carry a whole `arrayItem`, which identifies no request of its own.
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
 * Only five, because Tiled has few endpoints and many parameters. In particular all seven search
 * hooks share the `search` root: they call one endpoint, and the `TiledSearchConfig` in the args
 * fully determines the response — so two hooks that build the same filters correctly share one
 * entry, and `['tiled','search']` invalidates every search however it was expressed.
 */
export declare const tiledQueryRoots: {
    readonly search: readonly ["tiled", "search"];
    readonly metadata: readonly ["tiled", "metadata"];
    readonly array: readonly ["tiled", "array"];
    readonly table: readonly ["tiled", "table"];
    readonly serverInfo: readonly ["tiled", "serverInfo"];
};
export type TiledQueryRootName = keyof typeof tiledQueryRoots;
/** Every resource prefix, for bulk invalidation helpers. */
export declare const TILED_QUERY_ROOT_NAMES: TiledQueryRootName[];
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
export declare const tiledQueryKeys: {
    readonly search: (scope: TiledQueryScope, args: TiledSearchKeyArgs) => readonly ["tiled", "search", TiledSearchKeyArgs, TiledQueryScope];
    readonly metadata: (scope: TiledQueryScope, path: string) => readonly ["tiled", "metadata", string, TiledQueryScope];
    readonly array: (scope: TiledQueryScope, args: TiledArrayKeyArgs) => readonly ["tiled", "array", TiledArrayKeyArgs, TiledQueryScope];
    readonly table: (scope: TiledQueryScope, args: TiledTableKeyArgs) => readonly ["tiled", "table", TiledTableKeyArgs, TiledQueryScope];
    readonly serverInfo: (scope: TiledQueryScope) => readonly ["tiled", "serverInfo", null, TiledQueryScope];
};
/** The key type a given resource produces, for parameterizing `FinchQueryOptions`. */
export type TiledQueryKeyFor<N extends TiledQueryRootName> = ReturnType<(typeof tiledQueryKeys)[N]>;
//# sourceMappingURL=queryKeys.d.ts.map