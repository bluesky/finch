import type { TiledApiClient } from '@blueskyproject/tiled';

/**
 * The Tiled operations the hooks call.
 *
 * A `Pick` of `TiledApiClient`, so a real client satisfies it structurally for free — and so does any
 * stub or fake that implements the same methods. That is the seam that lets a component run against a
 * live Tiled server, against a stub in tests, and (eventually) against a simulator, without knowing
 * which.
 *
 * The three config *getters* are included because the hooks need them to build cache keys: a cached
 * entry belongs to a `{ baseUrl, initialPath }` namespace, and only the client can say what its own
 * is. The config *setters* are deliberately absent — the hooks never reconfigure an injected client.
 */
export type TiledClientLike = Pick<
    TiledApiClient,
    // search
    | 'getSearch'
    // metadata
    | 'getMetadata'
    // arrays
    | 'getArrayAs'
    | 'getArrayAsJSON'
    | 'getArrayAsPng'
    | 'getArrayAsBuffer'
    | 'getArrayAsImagePath'
    // tables
    | 'getTableAs'
    | 'getTablePartitionAsJSON'
    | 'getTablePartitionAsJSONSequence'
    | 'getTableFullAsJSON'
    | 'getTableFullAsJSONSequence'
    // server
    | 'getServerInfo'
    // auth
    | 'loginWithUsernamePassword'
    // read-only config, for cache scoping
    | 'getBaseUrl'
    | 'getInitialPath'
    | 'getApiKey'
>;

/**
 * Every method name in `TiledClientLike`, for runtime feature detection.
 *
 * `satisfies` ties the array to the type, so widening `TiledClientLike` without extending this list
 * (or the reverse) fails to compile. `useTiledClient` walks this list to decide whether an injected
 * client is complete, and substitutes a thrower for whatever is missing.
 */
export const TILED_CLIENT_LIKE_METHODS = [
    'getSearch',
    'getMetadata',
    'getArrayAs',
    'getArrayAsJSON',
    'getArrayAsPng',
    'getArrayAsBuffer',
    'getArrayAsImagePath',
    'getTableAs',
    'getTablePartitionAsJSON',
    'getTablePartitionAsJSONSequence',
    'getTableFullAsJSON',
    'getTableFullAsJSONSequence',
    'getServerInfo',
    'loginWithUsernamePassword',
    'getBaseUrl',
    'getInitialPath',
    'getApiKey',
] as const satisfies readonly (keyof TiledClientLike)[];

/** The method names, as a union. */
export type TiledClientLikeMethod = (typeof TILED_CLIENT_LIKE_METHODS)[number];
