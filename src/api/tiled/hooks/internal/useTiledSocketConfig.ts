import { useMemo } from 'react';
import { getDefaultTiledApiClient } from '../../client/defaultClient';
import { resolveTiledPath } from '../../client/urlUtils';
import { INJECTED_CLIENT_SCOPE } from '../queryKeys';
import { useTiledClient } from '../useTiledClient';

export interface TiledSocketConfig {
    /** `undefined` when an injected stub client has no URL, so there is nothing to connect to. */
    baseUrl: string | undefined;
    /** `path` with the client's `initialPath` applied, the same way HTTP requests are resolved. */
    path: string;
    apiKey: string | undefined;
    accessToken: string | undefined;
}

/**
 * Where a streaming hook should connect, and with which credentials, using the same resolution as the
 * HTTP hooks:
 *
 * - With a client injected through `TiledApiProvider`, its URL, initial path and API key are used.
 * - Otherwise `FinchConfigProvider`'s `tiledApiUrl` / `tiledApiKey` are used, falling back to the
 *   default client.
 * - A login session's access token is read from the default client, and only when no client is
 *   injected. `TiledClientLike` does not expose tokens, and widening it for this is not worth it.
 */
export function useTiledSocketConfig(path: string): TiledSocketConfig {
    const { client, source, requestDefaults, scope } = useTiledClient();

    let accessToken: string | undefined;
    if (source === 'default') {
        const fallback = getDefaultTiledApiClient();
        accessToken =
            fallback.getBearerToken() ?? fallback.getStoredTokens()?.accessToken ?? undefined;
    }

    const apiKey = requestDefaults.apiKey ?? readOptional(() => client.getApiKey()) ?? undefined;
    const scopeUrl = scope.baseUrl === INJECTED_CLIENT_SCOPE ? undefined : scope.baseUrl;
    const baseUrl = requestDefaults.baseUrl ?? scopeUrl;
    const resolvedPath = resolveTiledPath(path, scope.initialPath);

    return useMemo(
        () => ({ baseUrl, path: resolvedPath, apiKey, accessToken }),
        [baseUrl, resolvedPath, apiKey, accessToken],
    );
}

/**
 * A partial injected stub has a throwing placeholder for each method it lacks (see
 * `completeClientSurface`). For a socket, a missing credential getter just means "no credential",
 * not a broken render.
 */
function readOptional<T>(read: () => T): T | undefined {
    try {
        return read();
    } catch {
        return undefined;
    }
}
