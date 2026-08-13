import { useEffect, useMemo } from 'react';
import { useOptionalFinchConfig } from '@/app/FinchConfigProvider';
import type { QServerClientLike } from '@/api/qServerRuntime/clientLike';
import { QSERVER_CLIENT_LIKE_METHODS } from '@/api/qServerRuntime/clientLike';
import { useQServerApiClientOptional } from '@/api/qServerRuntime/QServerApiProvider';
import { getDefaultQServerClient } from '../client/defaultClient';
import { normalizeQServerBaseUrl } from '../client/urlUtils';
import type { QServerEndpoints } from '../types/clientSurface';
import type { QServerRequestOptions } from '../types/common';
import { QServerEndpointUnavailableError } from './errors';
import { INJECTED_CLIENT_SCOPE, type QServerQueryScope } from './queryKeys';

/**
 * Operations in `QServerEndpoints` but not in `QServerClientLike`.
 *
 * Kept beside the resolver because it is the list that decides which hooks can work against an
 * injected client. `QServerNewHooks.test.tsx` asserts it is exactly the set difference, so widening
 * `QServerClientLike` cannot leave this stale.
 */
export const QSERVER_NON_CORE_METHODS = [
    'getConfig',
    'moveQueueItemBatch',
    'uploadQueueSpreadsheet',
    'updateEnvironment',
    'getREMetadata',
    'getPermissions',
    'setPermissions',
    'reloadPermissions',
    'executeFunction',
    'uploadScript',
    'streamConsoleOutput',
    'interruptKernel',
    'stopManager',
    'testKillManager',
    'testServerSleep',
    'whoami',
    'getScopes',
    'listPrincipals',
    'getPrincipal',
    'createApiKeyForPrincipal',
    'createApiKey',
    'getCurrentApiKeyInfo',
    'revokeApiKey',
    'refreshSession',
    'revokeSession',
    'logout',
] as const satisfies readonly (keyof QServerEndpoints)[];

/**
 * Key used when nothing configures one — the same default `src/utils/apiUtils.ts` has always applied
 * for the queue server, kept so local development against an unauthenticated server keeps working.
 */
const DEFAULT_QSERVER_DEV_API_KEY = 'test';

export interface QServerClientResolution {
    /**
     * The full 70-operation surface.
     *
     * On a partial injected client the missing operations are present but throw
     * `QServerEndpointUnavailableError` when called, so every hook can be typed against the whole
     * surface without a cast.
     */
    readonly client: QServerEndpoints;
    readonly source: 'provider' | 'default';
    /**
     * Transport defaults merged *under* each caller's `request`.
     *
     * Non-empty only for the default client: an injected client is the caller's explicit choice and
     * is never redirected to another server.
     */
    readonly requestDefaults: QServerRequestOptions;
    /** Cache scope — which server these hooks talk to. */
    readonly scope: QServerQueryScope;
}

/**
 * Resolve the client the hooks should use, and the transport defaults to apply.
 *
 * Precedence:
 *
 * 1. a client injected through `QServerApiProvider` — this is what lets `qserver-sim` (and any test
 *    stub) drive hook-based components;
 * 2. otherwise the app-wide default client, with the base URL and API key from
 *    `FinchConfigProvider` (via `useQueueServerApiUrls`).
 *
 * Config correctness does not depend on the singleton's stored state: the resolved base URL and key
 * are returned as `requestDefaults` and travel with every request, so the very first fetch already
 * uses the configured server — there is nothing that can be stale. The singleton is *also* synced in
 * an effect so the free functions in `client/facade.ts` and the socket hooks agree with the hooks.
 */
export function useQServerClient(): QServerClientResolution {
    const injected = useQServerApiClientOptional();
    const config = useOptionalFinchConfig();

    // Only values the app actually configured count as overrides. Reading `useQueueServerApiUrls()`
    // instead would be wrong: it substitutes a window-derived URL and the literal key `'test'` when
    // nothing is configured, and passing those as per-request overrides would quietly defeat
    // `setDefaultQServerClient` / `setGlobalBaseUrl`.
    const configuredBaseUrl = config?.qServerApiUrl
        ? normalizeQServerBaseUrl(config.qServerApiUrl)
        : undefined;
    const configuredApiKey = config?.qServerApiKey || undefined;

    // Memoized on the client identity so the wrapper (and therefore `queryFn`) stays stable.
    const completed = useMemo(
        () => (injected ? completeEndpointSurface(injected) : null),
        [injected],
    );

    useEffect(() => {
        // Literally what the requirement asks for: Finch config lands on the default client, so the
        // free functions in `client/facade.ts` and the socket hooks agree with the hooks. Compare
        // before setting to stay idempotent under StrictMode's double effects.
        if (injected) return;
        const client = getDefaultQServerClient();
        if (configuredBaseUrl !== undefined && client.getBaseUrl() !== configuredBaseUrl) {
            client.setBaseUrl(configuredBaseUrl);
        }
        if (configuredApiKey !== undefined && client.getApiKey() !== configuredApiKey) {
            client.setApiKey(configuredApiKey);
        }
    }, [injected, configuredBaseUrl, configuredApiKey]);

    return useMemo<QServerClientResolution>(() => {
        if (injected && completed) {
            return {
                client: completed,
                source: 'provider',
                requestDefaults: {},
                scope: { baseUrl: injectedScope(injected) },
            };
        }

        const client = getDefaultQServerClient();
        // Carried on every request so the configured server is used from the very first fetch,
        // without depending on the effect above having run yet.
        const requestDefaults: QServerRequestOptions = {};
        if (configuredBaseUrl !== undefined) requestDefaults.baseUrl = configuredBaseUrl;
        if (configuredApiKey !== undefined) requestDefaults.apiKey = configuredApiKey;
        else if (client.getApiKey() === null) {
            // Preserves the long-standing local-dev default from `apiUtils`, without overriding a
            // client that has a key of its own.
            requestDefaults.apiKey = DEFAULT_QSERVER_DEV_API_KEY;
        }

        return {
            client,
            source: 'default',
            requestDefaults,
            scope: { baseUrl: configuredBaseUrl ?? client.getBaseUrl() },
        };
    }, [injected, completed, configuredBaseUrl, configuredApiKey]);
}

/** An injected client may well be a real `QServerApiClient` — ask it rather than assuming. */
function injectedScope(client: QServerClientLike): string {
    const candidate = client as { getBaseUrl?: () => string };
    return typeof candidate.getBaseUrl === 'function'
        ? normalizeQServerBaseUrl(candidate.getBaseUrl())
        : INJECTED_CLIENT_SCOPE;
}

/**
 * Widen a `QServerClientLike` to the full endpoint surface.
 *
 * A provider is *typed* on the 44-method `QServerClientLike` but is usually handed a real
 * `QServerApiClient` with all 70, so this feature-detects rather than assuming: a complete client is
 * returned untouched, and only a partial one gets a wrapper whose missing methods throw.
 *
 * Methods are bound explicitly rather than inherited via `Object.create(client)`. A
 * prototype-derived object would read the client's fields fine but *write* new own properties, so
 * internal mutable state (the single-flight `refreshPromise`) would silently fork.
 */
function completeEndpointSurface(client: QServerClientLike): QServerEndpoints {
    const candidate = client as Partial<QServerEndpoints>;
    const missing = QSERVER_NON_CORE_METHODS.filter(
        (name) => typeof candidate[name] !== 'function',
    );
    if (missing.length === 0) return client as QServerEndpoints;

    const surface: Record<string, unknown> = {};

    for (const name of QSERVER_CLIENT_LIKE_METHODS) {
        const method = (client as Record<string, unknown>)[name];
        if (typeof method === 'function') {
            surface[name] = (method as (...args: unknown[]) => unknown).bind(client);
        }
    }

    for (const name of QSERVER_NON_CORE_METHODS) {
        const method = (candidate as Record<string, unknown>)[name];
        surface[name] =
            typeof method === 'function'
                ? (method as (...args: unknown[]) => unknown).bind(client)
                : () => {
                      throw new QServerEndpointUnavailableError(name);
                  };
    }

    return surface as unknown as QServerEndpoints;
}
