import type { UseQueryResult } from '@tanstack/react-query';
import type { GetWithBodyOptions, QServerPayload } from '../types/common';
import type { GetConfigResponse, GetStatusResponse, PingResponse } from '../types/status';
import { useQServerQuery } from './internal/useQServerQuery';
import { qServerQueryKeys, type QServerQueryKeyFor } from './queryKeys';
import type { QServerHookError, QServerQueryHookOptions } from './types';
import { useQServerClient } from './useQServerClient';

/** Status hooks: `/api/ping`, `/api/`, `/api/status`, `/api/config/get`. */

export interface UsePingQueryOptions<TData = PingResponse> extends QServerQueryHookOptions<
    PingResponse,
    TData,
    QServerQueryKeyFor<'ping'>,
    GetWithBodyOptions<PingResponse>
> {
    /** Mirrors `client.ping(payload)`. Part of the query key. */
    payload?: QServerPayload;
}

/** Liveness check. Returns the same payload as `useGetStatusQuery`. */
export function usePingQuery<TData = PingResponse>(
    options: UsePingQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.ping(scope, payload),
        fetch: (client, mergedRequest) => client.ping(payload, mergedRequest),
        request,
        query,
    });
}

export interface UseGetRootQueryOptions<TData = PingResponse> extends QServerQueryHookOptions<
    PingResponse,
    TData,
    QServerQueryKeyFor<'root'>,
    GetWithBodyOptions<PingResponse>
> {
    /** Mirrors `client.getRoot(payload)`. Part of the query key. */
    payload?: QServerPayload;
}

/** `GET /api/` — identical payload to `usePingQuery`. */
export function useGetRootQuery<TData = PingResponse>(
    options: UseGetRootQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.root(scope, payload),
        fetch: (client, mergedRequest) => client.getRoot(payload, mergedRequest),
        request,
        query,
    });
}

export interface UseGetStatusQueryOptions<
    TData = GetStatusResponse,
> extends QServerQueryHookOptions<
    GetStatusResponse,
    TData,
    QServerQueryKeyFor<'status'>,
    GetWithBodyOptions<GetStatusResponse>
> {
    /** Mirrors `client.getStatus(payload)`. Part of the query key. */
    payload?: QServerPayload;
}

/**
 * RE Manager status: manager and Run Engine state, queue and history sizes, and the change uids.
 *
 * The usual way to keep a UI live is `query: { refetchInterval: 1000 }`; for push updates instead,
 * see `useQServerStatusSocket`.
 */
export function useGetStatusQuery<TData = GetStatusResponse>(
    options: UseGetStatusQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.status(scope, payload),
        fetch: (client, mergedRequest) => client.getStatus(payload, mergedRequest),
        request,
        query,
    });
}

export interface UseGetConfigQueryOptions<
    TData = GetConfigResponse,
> extends QServerQueryHookOptions<
    GetConfigResponse,
    TData,
    QServerQueryKeyFor<'config'>,
    GetWithBodyOptions<GetConfigResponse>
> {
    /** Mirrors `client.getConfig(payload)`. Part of the query key. */
    payload?: QServerPayload;
}

/**
 * Server configuration, e.g. IPython kernel connection info.
 *
 * Not part of `QServerClientLike`, so this rejects with `QServerEndpointUnavailableError` when a
 * partial client (such as the simulator's) is injected through `QServerApiProvider`.
 */
export function useGetConfigQuery<TData = GetConfigResponse>(
    options: UseGetConfigQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.config(scope, payload),
        fetch: (client, mergedRequest) => client.getConfig(payload, mergedRequest),
        request,
        query,
    });
}
