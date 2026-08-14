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
import type { QServerHookError, QServerQueryHookOptions } from './types';
import { useQServerClient } from './useQServerClient';

/**
 * Plan and device catalog hooks.
 *
 * All four change only when the environment is (re)opened or permissions change, so they are good
 * candidates for a long `query.staleTime`; the mutations that can change them already invalidate
 * these caches.
 */

export interface UseQueueGetPlansAllowedQueryOptions<
    TData = GetPlansAllowedResponse,
> extends QServerQueryHookOptions<
    GetPlansAllowedResponse,
    TData,
    QServerQueryKeyFor<'plansAllowed'>,
    GetWithBodyOptions<GetPlansAllowedResponse>
> {
    /** `{ user_group }`; defaults to the caller's group. Part of the query key. */
    payload?: PlansDevicesBody;
}

/** Plans the caller's user group may run, keyed by plan name, with their parameter metadata. */
export function useQueueGetPlansAllowedQuery<TData = GetPlansAllowedResponse>(
    options: UseQueueGetPlansAllowedQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.plansAllowed(scope, payload),
        fetch: (client, mergedRequest) => client.getPlansAllowed(payload, mergedRequest),
        request,
        query,
    });
}

export interface UseQueueGetDevicesAllowedQueryOptions<
    TData = GetDevicesAllowedResponse,
> extends QServerQueryHookOptions<
    GetDevicesAllowedResponse,
    TData,
    QServerQueryKeyFor<'devicesAllowed'>,
    GetWithBodyOptions<GetDevicesAllowedResponse>
> {
    /** `{ user_group }`; defaults to the caller's group. Part of the query key. */
    payload?: PlansDevicesBody;
}

/** Devices the caller's user group may use, keyed by device name. */
export function useQueueGetDevicesAllowedQuery<TData = GetDevicesAllowedResponse>(
    options: UseQueueGetDevicesAllowedQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.devicesAllowed(scope, payload),
        fetch: (client, mergedRequest) => client.getDevicesAllowed(payload, mergedRequest),
        request,
        query,
    });
}

export interface UseQueueGetPlansExistingQueryOptions<
    TData = GetPlansExistingResponse,
> extends QServerQueryHookOptions<
    GetPlansExistingResponse,
    TData,
    QServerQueryKeyFor<'plansExisting'>,
    GetWithBodyOptions<GetPlansExistingResponse>
> {
    payload?: PlansDevicesBody;
}

/** Every plan in the worker namespace, allowed or not. */
export function useQueueGetPlansExistingQuery<TData = GetPlansExistingResponse>(
    options: UseQueueGetPlansExistingQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.plansExisting(scope, payload),
        fetch: (client, mergedRequest) => client.getPlansExisting(payload, mergedRequest),
        request,
        query,
    });
}

export interface UseQueueGetDevicesExistingQueryOptions<
    TData = GetDevicesExistingResponse,
> extends QServerQueryHookOptions<
    GetDevicesExistingResponse,
    TData,
    QServerQueryKeyFor<'devicesExisting'>,
    GetWithBodyOptions<GetDevicesExistingResponse>
> {
    payload?: PlansDevicesBody;
}

/** Every device in the worker namespace, allowed or not. */
export function useQueueGetDevicesExistingQuery<TData = GetDevicesExistingResponse>(
    options: UseQueueGetDevicesExistingQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.devicesExisting(scope, payload),
        fetch: (client, mergedRequest) => client.getDevicesExisting(payload, mergedRequest),
        request,
        query,
    });
}
