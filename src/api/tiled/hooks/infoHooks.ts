import type { UseQueryResult } from '@tanstack/react-query';
import type { TiledRequestOptions } from '../types/common';
import type { TiledInfoResponse } from '../types/info';
import { useTiledQuery } from './internal/useTiledQuery';
import { tiledQueryKeys, type TiledQueryKeyFor, type TiledServerInfoVariantKey } from './queryKeys';
import type { FinchQueryOptions, TiledHookError } from './types';
import { useTiledQueryScope } from './useTiledClient';

/** Server-info hooks: `GET /api/v1/`, `/healthz`, `/tiled-ui-settings`, `/api/v1/metrics`. */

/**
 * The Tiled server's root document: api and library versions, supported formats and aliases per
 * structure family, the queries it accepts, and its authentication providers.
 *
 * **`data` can be `null`.** The client catches an unreachable server and an unparseable response and
 * resolves `null` rather than throwing, so `isError` stays `false` and `data === null` is how failure
 * shows up here. That asymmetry with every other read is deliberate and inherited: the login screen
 * probes servers it knows nothing about and needs an answer rather than an exception. Use
 * `useTiledAboutQuery` when you want the error. Treat `data?.authentication` as the answer to "does
 * this server need a login".
 *
 * Effectively static for the lifetime of a server, so a long `staleTime` is appropriate; this hook does
 * not set one, because "how long is a deployment" is the caller's call.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides: `baseUrl`, `apiKey`, `signal`. A `baseUrl` here is the
 * usual way to probe a server the app is not otherwise configured for.
 */
export function useTiledServerInfoQuery<TData = TiledInfoResponse | null>(
    queryOptions?: FinchQueryOptions<
        TiledInfoResponse | null,
        TData,
        TiledQueryKeyFor<'serverInfo'>,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.serverInfo(scope),
        fetch: (client, request) => client.getServerInfo(request),
        requestOptions,
        queryOptions,
    });
}

/**
 * The same root document, but **rejecting** on failure instead of resolving `null`.
 *
 * Use this when a failure is a failure — a settings page showing whether the configured server is
 * reachable wants `isError` and an error message, not a silent `null` indistinguishable from a
 * server that answered with something unexpected.
 *
 * **It keys separately from `useTiledServerInfoQuery`**, under the `'about'` variant, even though
 * both read `GET /api/v1/`. They promise different things about the same endpoint — one can resolve
 * `null`, this one cannot — so a shared entry let whichever ran first satisfy the other, and this
 * hook could hand back a cached `null` its own type rules out. Two entries and one extra request is
 * the right trade for a type that tells the truth.
 */
export function useTiledAboutQuery<TData = TiledInfoResponse>(
    queryOptions?: FinchQueryOptions<
        TiledInfoResponse,
        TData,
        TiledServerInfoVariantKey,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.serverInfoVariant(scope, 'about'),
        fetch: (client, request) => client.getAbout(request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Liveness — `GET /healthz`.
 *
 * Outside `/api/v1`, so the client issues it against the server origin derived from the base URL.
 * Unauthenticated on most deployments, which makes it the right probe for "is the server up" as
 * distinct from "are my credentials good".
 */
export function useTiledHealthQuery<TData = unknown>(
    queryOptions?: FinchQueryOptions<unknown, TData, TiledServerInfoVariantKey, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.serverInfoVariant(scope, 'healthz'),
        fetch: (client, request) => client.getHealth(request),
        requestOptions,
        queryOptions,
    });
}

/** The server's hints for its own web UI — `GET /tiled-ui-settings`. Also origin-scoped. */
export function useTiledUiSettingsQuery<TData = unknown>(
    queryOptions?: FinchQueryOptions<unknown, TData, TiledServerInfoVariantKey, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.serverInfoVariant(scope, 'uiSettings'),
        fetch: (client, request) => client.getUiSettings(request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Server metrics — `GET /api/v1/metrics`.
 *
 * Prometheus-style counters. Often restricted or disabled, so expect a 403 on a hardened
 * deployment rather than treating one as a bug.
 */
export function useTiledMetricsQuery<TData = unknown>(
    queryOptions?: FinchQueryOptions<unknown, TData, TiledServerInfoVariantKey, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.serverInfoVariant(scope, 'metrics'),
        fetch: (client, request) => client.getMetrics(request),
        requestOptions,
        queryOptions,
    });
}
