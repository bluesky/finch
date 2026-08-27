import { useEffect, useMemo } from 'react';
import {
    getDefaultTiledApiClient,
    setDefaultTiledUrl,
    setGlobalApiKey,
} from '@blueskyproject/tiled';
import { useOptionalFinchConfig } from '@/app/FinchConfigProvider';
import { TILED_CLIENT_LIKE_METHODS, type TiledClientLike } from '../runtime/clientLike';
import { useTiledApiClientOptional } from '../runtime/TiledApiProvider';
import type { TiledRequestOptions } from '../types/common';
import { TiledEndpointUnavailableError } from './errors';
import { INJECTED_CLIENT_SCOPE, type TiledQueryScope } from './queryKeys';

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
export function useTiledClient(): TiledClientResolution {
    const injected = useTiledApiClientOptional();
    const config = useOptionalFinchConfig();

    // Only values the app actually configured count as overrides. Reading `useTiledApiUrls()` instead
    // would be wrong: it substitutes a window-derived URL when nothing is configured, and passing
    // that as a per-request override would quietly defeat `setDefaultTiledApiClient` /
    // `setDefaultTiledUrl`.
    const configuredBaseUrl = config?.tiledApiUrl || undefined;
    // The package models "no key" as null; Finch config models it as undefined.
    const configuredApiKey = config?.tiledApiKey || undefined;

    // Memoized on the client identity so the wrapper (and therefore `queryFn`) stays stable.
    const completed = useMemo(
        () => (injected ? completeClientSurface(injected) : null),
        [injected],
    );

    useEffect(() => {
        // Literally what the requirement asks for: Finch config lands on the default client, so the
        // package's free functions agree with the hooks. Compare before setting to stay idempotent
        // under StrictMode's double effects.
        if (injected) return;
        const client = getDefaultTiledApiClient();
        if (configuredBaseUrl !== undefined && client.getBaseUrl() !== configuredBaseUrl) {
            setDefaultTiledUrl(configuredBaseUrl);
        }
        if (configuredApiKey !== undefined && client.getApiKey() !== configuredApiKey) {
            setGlobalApiKey(configuredApiKey);
        }
    }, [injected, configuredBaseUrl, configuredApiKey]);

    return useMemo<TiledClientResolution>(() => {
        if (injected && completed) {
            return {
                client: completed,
                source: 'provider',
                requestDefaults: {},
                scope: clientScope(injected),
            };
        }

        const client = getDefaultTiledApiClient();
        // Carried on every request so the configured server is used from the very first fetch,
        // without depending on the effect above having run yet.
        const requestDefaults: TiledRequestOptions = {};
        if (configuredBaseUrl !== undefined) requestDefaults.baseUrl = configuredBaseUrl;
        if (configuredApiKey !== undefined) requestDefaults.apiKey = configuredApiKey;

        return {
            client,
            source: 'default',
            requestDefaults,
            scope: {
                baseUrl: configuredBaseUrl ?? client.getBaseUrl(),
                initialPath: client.getInitialPath(),
            },
        };
    }, [injected, completed, configuredBaseUrl, configuredApiKey]);
}

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
export function useTiledQueryScope(requestOptions?: TiledRequestOptions): TiledQueryScope {
    const { scope } = useTiledClient();
    const baseUrlOverride = requestOptions?.baseUrl;
    const initialPathOverride = requestOptions?.initialPath;
    const absolute = requestOptions?.pathMode === 'absolute';

    return useMemo(() => {
        const baseUrl = baseUrlOverride ?? scope.baseUrl;
        const initialPath = absolute ? '' : (initialPathOverride ?? scope.initialPath);
        if (baseUrl === scope.baseUrl && initialPath === scope.initialPath) return scope;
        return { baseUrl, initialPath };
    }, [scope, baseUrlOverride, initialPathOverride, absolute]);
}

/** An injected client may be a real `TiledApiClient` — ask it rather than assuming. */
function clientScope(client: TiledClientLike): TiledQueryScope {
    const baseUrl = typeof client.getBaseUrl === 'function' ? client.getBaseUrl() : undefined;
    const initialPath =
        typeof client.getInitialPath === 'function' ? client.getInitialPath() : undefined;

    return {
        baseUrl: baseUrl || INJECTED_CLIENT_SCOPE,
        initialPath: initialPath ?? '',
    };
}

/**
 * Widen a possibly-partial injected client to the whole `TiledClientLike` surface.
 *
 * A real `TiledApiClient` has every method, so it is returned untouched; only a hand-written stub gets
 * a wrapper whose missing methods throw.
 *
 * Methods are bound explicitly rather than inherited via `Object.create(client)`. A prototype-derived
 * object would read the client's fields fine but *write* new own properties, so internal mutable state
 * (the single-flight `refreshPromise` behind token refresh) would silently fork.
 */
function completeClientSurface(client: TiledClientLike): TiledClientLike {
    const candidate = client as Partial<Record<string, unknown>>;
    const missing = TILED_CLIENT_LIKE_METHODS.filter(
        (name) => typeof candidate[name] !== 'function',
    );
    if (missing.length === 0) return client;

    const surface: Record<string, unknown> = {};

    for (const name of TILED_CLIENT_LIKE_METHODS) {
        const method = candidate[name];
        surface[name] =
            typeof method === 'function'
                ? (method as (...args: unknown[]) => unknown).bind(client)
                : () => {
                      throw new TiledEndpointUnavailableError(name);
                  };
    }

    return surface as unknown as TiledClientLike;
}
