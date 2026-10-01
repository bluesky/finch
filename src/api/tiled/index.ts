/**
 * Tiled API client and query layer — the only import path a consumer needs.
 *
 * ```tsx
 * import {
 *     TiledApiProvider,
 *     useTiledSearchBySpecsQuery,
 *     setDefaultTiledUrl,
 * } from '@/api/tiled';
 * ```
 *
 * Four things live here:
 *
 * 1. **The client** (`TiledApiClient`) — every operation in `openapi.json`, plus the auth routes the
 *    spec omits. Built on the client in
 *    [`tiled-viewer-react`](https://github.com/bluesky/tiled-viewer-react/tree/main/src/components/Tiled/api)
 *    and shaped like [`@/api/qServer`](../qServer). See `client/`.
 * 2. **Hooks** — one TanStack Query hook per operation, positional arguments, correct cache keys,
 *    `FinchConfigProvider` awareness. See `hooks/`.
 * 3. **A provider** (`TiledApiProvider`) for injecting a client, so components can be driven by a
 *    stub in tests and Storybook. See `runtime/`.
 * 4. **Free functions** — one per operation, against the app-wide client, for code outside React.
 *
 * ## This no longer wraps `@blueskyproject/tiled`
 *
 * Nothing under `src/api/tiled` imports that package any more. Every name it used to re-export is
 * exported from here instead, with the same signature, so no call site had to change — but the
 * implementation is Finch's, the types come from Tiled's own OpenAPI schema, and the write half of
 * the API exists for the first time.
 *
 * The package is still a dependency for the `<Tiled>` **viewer component** and its CSS. That
 * component keeps its own internal client and its own singleton, so `setGlobalTiledApiKey` here does
 * **not** configure it — `src/components/Tiled/Tiled.tsx` passes the URL and key as props from Finch
 * config, which is the arrangement to keep. Login tokens *are* shared: both write
 * `tiledAccessToken` / `tiledRefreshToken` to `localStorage` under the same keys.
 */

// The hook layer
export * from './hooks';

// The injection seam
export * from './runtime';

// Types — the package's own, plus aliases for the ones it fails to export
export type * from './types';

/**
 * The client class, the module-level default client, and the configuration functions.
 *
 * The hooks use the default client whenever no `TiledApiProvider` is mounted, so these setters are
 * how you configure Tiled outside React. `FinchConfigProvider` already applies `tiledApiUrl` /
 * `tiledApiKey` to it, so most apps need none of this.
 *
 * `resetDefaultTiledApiClient()` discards the singleton — call it in `beforeEach` so tests do not
 * leak configuration into one another.
 */
export { TiledApiClient } from './client/TiledApiClient';
export type { TiledApiClientConfig } from './client/TiledApiClient';

export {
    createTiledApiClient,
    getDefaultTiledApiClient,
    setDefaultTiledApiClient,
    resetDefaultTiledApiClient,
    configureTiledClient,
    // transport
    setDefaultTiledUrl,
    getDefaultTiledUrl,
    setDefaultInitialPath,
    getDefaultTiledInitialPath,
    setGlobalTiledAxiosClient,
    getGlobalTiledAxiosClient,
    // auth
    setDefaultBearerToken,
    setDefaultAuthErrorCallback,
    clearGlobalTiledAuth,
    setGlobalTiledApiKeyLocation,
    setGlobalTiledApiKeyScheme,
    setGlobalTiledTokenStorage,
    getGlobalApiKey,
    // interceptors
    addRequestInterceptor,
    addResponseInterceptor,
    ejectInterceptor,
    clearInterceptors,
    listInterceptors,
} from './client/defaultClient';

/**
 * Global API key and array-size limit for the default Tiled client.
 *
 * Exported under both names: the Tiled-specific one, because `setGlobalApiKey` is ambiguous in an
 * app that also talks to the queue server, and the original, for code moving over from
 * `@blueskyproject/tiled`.
 */
export {
    setGlobalApiKey as setGlobalTiledApiKey,
    setGlobalMaxArrayBytes as setGlobalTiledMaxArrayBytes,
    getGlobalMaxArrayBytes as getGlobalTiledMaxArrayBytes,
    setGlobalApiKey,
    setGlobalMaxArrayBytes,
} from './client/defaultClient';

/** Where login tokens are persisted. Swap for an in-memory store in tests. */
export {
    createBrowserTokenStorage,
    createMemoryTokenStorage,
    createDefaultTokenStorage,
    TILED_ACCESS_TOKEN_KEY,
    TILED_REFRESH_TOKEN_KEY,
} from './client/tokenStorage';
export type { TiledTokenStorage, TiledStoredTokens } from './client/tokenStorage';

/**
 * One free function per operation, against the app-wide client.
 *
 * The right tool outside a React component — a `useEffect`, an event handler, a plain module
 * function. Inside a component prefer the hooks: these ignore `TiledApiProvider` and take no part in
 * the query cache.
 */
export * from './client/facade';

/** Content negotiation: format names, their media types, and the JSON-sequence parser. */
export { TILED_FORMATS, resolveFormat, parseJsonSequence } from './client/formats';
export type { TiledFormatName, TiledFormatSpec, TiledFormatReturnMap } from './client/formats';

/** Search parameter encoding, for callers assembling a request by hand. */
export { buildSearchParams, buildDistinctParams, buildFilterParams } from './client/searchParams';

/** Array downsampling maths, exposed for components that size a request before making it. */
export {
    getDisplayShape,
    computeDownsampleSteps,
    buildArraySlice,
    resolveArrayStructure,
    hasArrayStructure,
} from './client/arraySlicing';

/** URL and path helpers. */
export {
    normalizeTiledBaseUrl,
    normalizeTiledPath,
    encodeTiledPath,
    resolveTiledPath,
    tiledOriginFromBaseUrl,
    defaultTiledBaseUrl,
    formatIndexTuple,
} from './client/urlUtils';

/** Spec paths, for the registry and for callers building a URL themselves. */
export { TILED_PATHS, TILED_API_PREFIX, buildPath, toClientPath, isApiPath } from './types/paths';
export type { TiledPathAlias, TiledRegisteredPath, TiledPathScope } from './types/paths';

/** Errors. Every client rejection is one of these, or an `AbortError`. */
export { TiledApiError, isTiledApiError, formatValidationErrors } from './types/errors';

/** Structure-family narrowing for a `TiledSearchItem`. */
export {
    isArrayStructure,
    isTableStructure,
    isContainerStructure,
    isAwkwardStructure,
    isSparseStructure,
    isRaggedStructure,
    isStructuredArrayStructure,
} from './types/structures';

/** Whether a response really is Tiled's About document. */
export { isValidTiledInfoResponse } from './types/info';

/** The filter names whose values are JSON-encoded on the way out. */
export { JSON_VALUED_FILTERS } from './types/searchFilters';

export type { TiledAuthErrorCallback as AuthErrorCallback } from './types/requestOptions';

/** Readable names over the generated OpenAPI schema — request bodies, enums, envelopes. */
export type * from './types/generatedAliases';

/**
 * The endpoint registry: every operation described as data.
 *
 * What the manual test harness renders and what `TiledRegistry.test.ts` diffs against
 * `openapi.json`. Exported so a consumer can build their own harness, or enumerate the API for
 * documentation, without a hand-maintained list going stale.
 */
export {
    TILED_ENDPOINTS,
    TILED_ENDPOINT_GROUPS,
    TILED_GROUP_LABELS,
    getEndpointById,
    getEndpointsByGroup,
    getReadOnlyEndpoints,
    getWriteEndpoints,
} from './endpointRegistry';
export type {
    TiledEndpointDescriptor,
    TiledEndpointGroup,
    TiledEndpointInvocation,
    TiledEndpointParam,
} from './types/registry';
export { payloadAs, numberParam, tupleParam } from './types/registry';
