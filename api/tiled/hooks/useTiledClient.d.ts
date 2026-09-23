import { TiledClientLike } from '../runtime/clientLike';
import { TiledRequestOptions } from '../types/common';
import { TiledQueryScope } from './queryKeys';
export interface TiledClientResolution {
    /**
     * The client the hooks should call.
     *
     * On a partial injected client the missing methods are present but throw
     * `TiledEndpointUnavailableError`, so every hook can be typed against the whole surface without a
     * cast or a runtime check.
     */
    readonly client: TiledClientLike;
    readonly source: 'provider' | 'default';
    /**
     * Transport defaults merged *under* each caller's request options.
     *
     * Non-empty only for the default client: an injected client is the caller's explicit choice and is
     * never redirected to another server.
     */
    readonly requestDefaults: TiledRequestOptions;
    /** Cache scope — which Tiled namespace these hooks read from. */
    readonly scope: TiledQueryScope;
}
/**
 * Resolve the Tiled client the hooks should use, and the transport defaults to apply.
 *
 * Precedence:
 *
 * 1. a client injected through `TiledApiProvider` — the seam that lets a stub or fake drive
 *    hook-based components in tests and Storybook;
 * 2. otherwise the package's module-level singleton (`getDefaultTiledApiClient()`), configured from
 *    `FinchConfigProvider`.
 *
 * Config correctness does not depend on the singleton's stored state: the configured base URL and key
 * are returned as `requestDefaults` and travel with every request, so the very first fetch of the
 * first render already goes to the right server — there is nothing that can be stale. The singleton is
 * *also* synced in an effect, so the package's own free functions (`getTiledSearch`, …) and anything
 * else reaching for the default client agree with the hooks.
 *
 * Note that `tiledApiUrl` must include the API version segment — `http://host:8000/api/v1` — because
 * that is what the package expects. Nothing here appends it: guessing would silently point a
 * misconfigured app at a URL it never asked for.
 */
export declare function useTiledClient(): TiledClientResolution;
/**
 * The cache scope a query hook should key on, given its own request options.
 *
 * Normally the resolver's scope. A per-call `baseUrl` or `initialPath` overrides it, so two instances
 * of the same hook pointed at different servers — or at different path prefixes on one server — keep
 * separate cache entries instead of overwriting each other's data.
 *
 * `pathMode: 'absolute'` resolves the prefix to `''`, because such a request ignores `initialPath`
 * entirely; the scope then always describes the namespace the data actually came from.
 */
export declare function useTiledQueryScope(requestOptions?: TiledRequestOptions): TiledQueryScope;
//# sourceMappingURL=useTiledClient.d.ts.map