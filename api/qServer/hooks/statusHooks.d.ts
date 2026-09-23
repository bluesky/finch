import { UseQueryResult } from '@tanstack/react-query';
import { QServerRequestOptions } from '../types/common';
import { GetConfigResponse, GetStatusResponse, PingResponse } from '../types/status';
import { QServerQueryKeyFor } from './queryKeys';
import { FinchQueryOptions, QServerHookError } from './types';
/** Status hooks: `/api/ping`, `/api/`, `/api/status`, `/api/config/get`. */
/**
 * Liveness check. Returns the same payload as `useQueueGetStatusQuery`.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides: `baseUrl`, `apiKey`, `headers`, `signal`, `axiosConfig`.
 */
export declare function useQueuePingQuery<TData = PingResponse>(queryOptions?: FinchQueryOptions<PingResponse, TData, QServerQueryKeyFor<'ping'>>, requestOptions?: QServerRequestOptions): UseQueryResult<TData, QServerHookError>;
/**
 * `GET /api/` — identical payload to `useQueuePingQuery`.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetRootQuery<TData = PingResponse>(queryOptions?: FinchQueryOptions<PingResponse, TData, QServerQueryKeyFor<'root'>>, requestOptions?: QServerRequestOptions): UseQueryResult<TData, QServerHookError>;
/**
 * RE Manager status: manager and Run Engine state, queue and history sizes, and the change uids.
 *
 * The usual way to keep a UI live is `{ refetchInterval: 1000 }` in `queryOptions`; for push updates
 * instead, see `useQServerStatusSocket`.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetStatusQuery<TData = GetStatusResponse>(queryOptions?: FinchQueryOptions<GetStatusResponse, TData, QServerQueryKeyFor<'status'>>, requestOptions?: QServerRequestOptions): UseQueryResult<TData, QServerHookError>;
/**
 * Server configuration, e.g. IPython kernel connection info.
 *
 * Not part of `QServerClientLike`, so this rejects with `QServerEndpointUnavailableError` when a
 * partial client (such as the simulator's) is injected through `QServerApiProvider`.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetConfigQuery<TData = GetConfigResponse>(queryOptions?: FinchQueryOptions<GetConfigResponse, TData, QServerQueryKeyFor<'config'>>, requestOptions?: QServerRequestOptions): UseQueryResult<TData, QServerHookError>;
//# sourceMappingURL=statusHooks.d.ts.map