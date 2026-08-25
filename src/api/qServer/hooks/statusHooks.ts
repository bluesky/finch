import type { UseQueryResult } from '@tanstack/react-query';
import type { QServerRequestOptions } from '../types/common';
import type { GetConfigResponse, GetStatusResponse, PingResponse } from '../types/status';
import { useQServerQuery } from './internal/useQServerQuery';
import { qServerQueryKeys, type QServerQueryKeyFor } from './queryKeys';
import type { FinchQueryOptions, QServerHookError } from './types';
import { useQServerQueryScope } from './useQServerClient';

/** Status hooks: `/api/ping`, `/api/`, `/api/status`, `/api/config/get`. */

/**
 * Liveness check. Returns the same payload as `useQueueGetStatusQuery`.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides: `baseUrl`, `apiKey`, `headers`, `signal`, `axiosConfig`.
 */
export function useQueuePingQuery<TData = PingResponse>(
    queryOptions?: FinchQueryOptions<PingResponse, TData, QServerQueryKeyFor<'ping'>>,
    requestOptions?: QServerRequestOptions,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.ping(scope),
        fetch: (client, request) => client.ping(undefined, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * `GET /api/` — identical payload to `useQueuePingQuery`.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetRootQuery<TData = PingResponse>(
    queryOptions?: FinchQueryOptions<PingResponse, TData, QServerQueryKeyFor<'root'>>,
    requestOptions?: QServerRequestOptions,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.root(scope),
        fetch: (client, request) => client.getRoot(undefined, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * RE Manager status: manager and Run Engine state, queue and history sizes, and the change uids.
 *
 * The usual way to keep a UI live is `{ refetchInterval: 1000 }` in `queryOptions`; for push updates
 * instead, see `useQServerStatusSocket`.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetStatusQuery<TData = GetStatusResponse>(
    queryOptions?: FinchQueryOptions<GetStatusResponse, TData, QServerQueryKeyFor<'status'>>,
    requestOptions?: QServerRequestOptions,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.status(scope),
        fetch: (client, request) => client.getStatus(undefined, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Server configuration, e.g. IPython kernel connection info.
 *
 * Not part of `QServerClientLike`, so this rejects with `QServerEndpointUnavailableError` when a
 * partial client (such as the simulator's) is injected through `QServerApiProvider`.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetConfigQuery<TData = GetConfigResponse>(
    queryOptions?: FinchQueryOptions<GetConfigResponse, TData, QServerQueryKeyFor<'config'>>,
    requestOptions?: QServerRequestOptions,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.config(scope),
        fetch: (client, request) => client.getConfig(undefined, request),
        requestOptions,
        queryOptions,
    });
}
