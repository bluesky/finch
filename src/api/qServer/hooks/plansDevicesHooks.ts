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
 * @param body `{ user_group }`; defaults to the caller's group. Part of the query key.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetPlansAllowedQuery<TData = GetPlansAllowedResponse>(
    body?: PlansDevicesBody,
    queryOptions?: FinchQueryOptions<
        GetPlansAllowedResponse,
        TData,
        QServerQueryKeyFor<'plansAllowed'>
    >,
    requestOptions?: GetWithBodyOptions<GetPlansAllowedResponse>,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.plansAllowed(scope, body),
        fetch: (client, request) => client.getPlansAllowed(body, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Devices the caller's user group may use, keyed by device name.
 *
 * @param body `{ user_group }`; defaults to the caller's group. Part of the query key.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetDevicesAllowedQuery<TData = GetDevicesAllowedResponse>(
    body?: PlansDevicesBody,
    queryOptions?: FinchQueryOptions<
        GetDevicesAllowedResponse,
        TData,
        QServerQueryKeyFor<'devicesAllowed'>
    >,
    requestOptions?: GetWithBodyOptions<GetDevicesAllowedResponse>,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.devicesAllowed(scope, body),
        fetch: (client, request) => client.getDevicesAllowed(body, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Every plan in the worker namespace, allowed or not.
 *
 * @param body `{ user_group }`; defaults to the caller's group. Part of the query key.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetPlansExistingQuery<TData = GetPlansExistingResponse>(
    body?: PlansDevicesBody,
    queryOptions?: FinchQueryOptions<
        GetPlansExistingResponse,
        TData,
        QServerQueryKeyFor<'plansExisting'>
    >,
    requestOptions?: GetWithBodyOptions<GetPlansExistingResponse>,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.plansExisting(scope, body),
        fetch: (client, request) => client.getPlansExisting(body, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Every device in the worker namespace, allowed or not.
 *
 * @param body `{ user_group }`; defaults to the caller's group. Part of the query key.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetDevicesExistingQuery<TData = GetDevicesExistingResponse>(
    body?: PlansDevicesBody,
    queryOptions?: FinchQueryOptions<
        GetDevicesExistingResponse,
        TData,
        QServerQueryKeyFor<'devicesExisting'>
    >,
    requestOptions?: GetWithBodyOptions<GetDevicesExistingResponse>,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.devicesExisting(scope, body),
        fetch: (client, request) => client.getDevicesExisting(body, request),
        requestOptions,
        queryOptions,
    });
}
