import { UseQueryResult } from '@tanstack/react-query';
import { GetWithBodyOptions } from '../types/common';
import { GetDevicesAllowedResponse, GetDevicesExistingResponse, GetPlansAllowedResponse, GetPlansExistingResponse, PlansDevicesBody } from '../types/plansDevices';
import { QServerQueryKeyFor } from './queryKeys';
import { FinchQueryOptions, QServerHookError } from './types';
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
export declare function useQueueGetPlansAllowedQuery<TData = GetPlansAllowedResponse>(body?: PlansDevicesBody, queryOptions?: FinchQueryOptions<GetPlansAllowedResponse, TData, QServerQueryKeyFor<'plansAllowed'>>, requestOptions?: GetWithBodyOptions<GetPlansAllowedResponse>): UseQueryResult<TData, QServerHookError>;
/**
 * Devices the caller's user group may use, keyed by device name.
 *
 * @param body `{ user_group }`; defaults to the caller's group. Part of the query key.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetDevicesAllowedQuery<TData = GetDevicesAllowedResponse>(body?: PlansDevicesBody, queryOptions?: FinchQueryOptions<GetDevicesAllowedResponse, TData, QServerQueryKeyFor<'devicesAllowed'>>, requestOptions?: GetWithBodyOptions<GetDevicesAllowedResponse>): UseQueryResult<TData, QServerHookError>;
/**
 * Every plan in the worker namespace, allowed or not.
 *
 * @param body `{ user_group }`; defaults to the caller's group. Part of the query key.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetPlansExistingQuery<TData = GetPlansExistingResponse>(body?: PlansDevicesBody, queryOptions?: FinchQueryOptions<GetPlansExistingResponse, TData, QServerQueryKeyFor<'plansExisting'>>, requestOptions?: GetWithBodyOptions<GetPlansExistingResponse>): UseQueryResult<TData, QServerHookError>;
/**
 * Every device in the worker namespace, allowed or not.
 *
 * @param body `{ user_group }`; defaults to the caller's group. Part of the query key.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetDevicesExistingQuery<TData = GetDevicesExistingResponse>(body?: PlansDevicesBody, queryOptions?: FinchQueryOptions<GetDevicesExistingResponse, TData, QServerQueryKeyFor<'devicesExisting'>>, requestOptions?: GetWithBodyOptions<GetDevicesExistingResponse>): UseQueryResult<TData, QServerHookError>;
//# sourceMappingURL=plansDevicesHooks.d.ts.map