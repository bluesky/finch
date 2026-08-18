import type { UseQueryResult } from '@tanstack/react-query';
import type { GetWithBodyOptions } from '../types/common';
import type {
    GetDevicesAllowedResponse,
    GetDevicesExistingResponse,
    GetPlansAllowedResponse,
    GetPlansExistingResponse,
    PlansDevicesBody,
} from '../types/plansDevices';
import { useQServerQuery } from './internal/useQServerQuery';
import { qServerQueryKeys, type QServerQueryKeyFor } from './queryKeys';
import type { FinchQueryOptions, QServerHookError } from './types';
import { useQServerQueryScope } from './useQServerClient';

/**
 * Plan and device catalog hooks.
 *
 * All four change only when the environment is (re)opened or permissions change, so they are good
 * candidates for a long `staleTime`; the mutations that can change them already invalidate these
 * caches.
 */

/**
 * Plans the caller's user group may run, keyed by plan name, with their parameter metadata.
 *
 * @param payload `{ user_group }`; defaults to the caller's group. Part of the query key.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetPlansAllowedQuery<TData = GetPlansAllowedResponse>(
    payload?: PlansDevicesBody,
    requestOptions: GetWithBodyOptions<GetPlansAllowedResponse> = {},
    queryOptions: FinchQueryOptions<
        GetPlansAllowedResponse,
        TData,
        QServerQueryKeyFor<'plansAllowed'>
    > = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.plansAllowed(scope, payload),
        fetch: (client, request) => client.getPlansAllowed(payload, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Devices the caller's user group may use, keyed by device name.
 *
 * @param payload `{ user_group }`; defaults to the caller's group. Part of the query key.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetDevicesAllowedQuery<TData = GetDevicesAllowedResponse>(
    payload?: PlansDevicesBody,
    requestOptions: GetWithBodyOptions<GetDevicesAllowedResponse> = {},
    queryOptions: FinchQueryOptions<
        GetDevicesAllowedResponse,
        TData,
        QServerQueryKeyFor<'devicesAllowed'>
    > = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.devicesAllowed(scope, payload),
        fetch: (client, request) => client.getDevicesAllowed(payload, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Every plan in the worker namespace, allowed or not.
 *
 * @param payload `{ user_group }`; defaults to the caller's group. Part of the query key.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetPlansExistingQuery<TData = GetPlansExistingResponse>(
    payload?: PlansDevicesBody,
    requestOptions: GetWithBodyOptions<GetPlansExistingResponse> = {},
    queryOptions: FinchQueryOptions<
        GetPlansExistingResponse,
        TData,
        QServerQueryKeyFor<'plansExisting'>
    > = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.plansExisting(scope, payload),
        fetch: (client, request) => client.getPlansExisting(payload, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Every device in the worker namespace, allowed or not.
 *
 * @param payload `{ user_group }`; defaults to the caller's group. Part of the query key.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetDevicesExistingQuery<TData = GetDevicesExistingResponse>(
    payload?: PlansDevicesBody,
    requestOptions: GetWithBodyOptions<GetDevicesExistingResponse> = {},
    queryOptions: FinchQueryOptions<
        GetDevicesExistingResponse,
        TData,
        QServerQueryKeyFor<'devicesExisting'>
    > = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.devicesExisting(scope, payload),
        fetch: (client, request) => client.getDevicesExisting(payload, request),
        requestOptions,
        queryOptions,
    });
}
