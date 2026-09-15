/**
 * Tiled query layer — the only import path a consumer needs.
 *
 * ```tsx
 * import {
 *     TiledApiProvider,
 *     useTiledSearchBySpecsQuery,
 *     setDefaultTiledUrl,
 * } from '@/api/tiled';
 * ```
 *
 * Three things live here:
 *
 * 1. **Hooks** over `@blueskyproject/tiled` — one per client method, positional arguments, correct
 *    cache keys, `FinchConfigProvider` awareness. See `hooks/`.
 * 2. **A provider** (`TiledApiProvider`) for injecting a client, so components can be driven by a stub
 *    in tests and Storybook. See `runtime/`.
 * 3. **Re-exports** of the package's own client, configuration functions and types, so nothing needs to
 *    import `@blueskyproject/tiled` directly.
 *
 * This folder replaced the hand-rolled hooks now parked in `src/api/tiled_archive/hooks.ts`, which
 * nothing imports and which is excluded from the typecheck (it cannot compile against the current
 * package). Every Finch component now reads Tiled through this layer.
 */

// The hook layer
export * from './hooks';

// The injection seam
export * from './runtime';

// Types — the package's own, plus aliases for the ones it fails to export
export type * from './types';

/**
 * The client class and the module-level default client.
 *
 * The hooks use the default client whenever no `TiledApiProvider` is mounted, so these setters are how
 * you configure Tiled outside React. `FinchConfigProvider` already applies `tiledApiUrl` /
 * `tiledApiKey` to it, so most apps need none of this.
 *
 * `resetDefaultTiledApiClient()` discards the singleton — call it in `beforeEach` so tests do not leak
 * configuration into one another.
 */
export {
    TiledApiClient,
    getDefaultTiledApiClient,
    setDefaultTiledApiClient,
    resetDefaultTiledApiClient,
    setDefaultTiledUrl,
    setDefaultInitialPath,
    getDefaultTiledInitialPath,
    setDefaultBearerToken,
    setDefaultAuthErrorCallback,
} from '@blueskyproject/tiled';

/**
 * Global API key and array-size limit for the default Tiled client.
 *
 * Re-exported under Tiled-specific names: the package calls them `setGlobalApiKey` and
 * `setGlobalMaxArrayBytes`, which is ambiguous in an app that also talks to the queue server. The
 * original names are exported too, for code moving over from `@blueskyproject/tiled`.
 */
export {
    setGlobalApiKey as setGlobalTiledApiKey,
    setGlobalMaxArrayBytes as setGlobalTiledMaxArrayBytes,
    setGlobalApiKey,
    setGlobalMaxArrayBytes,
} from '@blueskyproject/tiled';

/**
 * The package's own request functions, for call sites that are not React components.
 *
 * Inside a component prefer the hooks: these are hard-wired to the default client, so they ignore
 * `TiledApiProvider` and take no part in the query cache. They are the right tool in a `useEffect`, an
 * event handler, a `useQueries` map, or a plain module function.
 */
export {
    getTiledSearch,
    getTiledSearchBySpecs,
    getTiledSearchByFullText,
    getTiledSearchByMetadataEquals,
    getTiledSearchByStructureFamily,
    getTiledMetadata,
    getTiledServerInfo,
    getTiledArrayAs,
    getTiledArrayAsJSON,
    getTiledArrayAsPng,
    getTiledArrayAsBuffer,
    getTiledArrayAsImagePath,
    getTiledTableAs,
    getTiledTablePartitionAsJSON,
    getTiledTablePartitionAsJSONSequence,
    getTiledTableFullAsJSON,
    getTiledTableFullAsJSONSequence,
    loginWithDefaultTiledClient,
} from '@blueskyproject/tiled';

/** Structure-family narrowing for a `TiledSearchItem`, straight from the package. */
export { isArrayStructure, isTableStructure, isContainerStructure } from '@blueskyproject/tiled';

export type { AuthErrorCallback } from '@blueskyproject/tiled';
