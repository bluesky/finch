import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { QServerRequestOptions } from '../types/common';
import type {
    GetPermissionsResponse,
    PermissionsResponse,
    ReloadPermissionsBody,
    SetPermissionsBody,
} from '../types/permissions';
import { useQServerMutation } from './internal/useQServerMutation';
import { useQServerQuery } from './internal/useQServerQuery';
import { QSERVER_MUTATION_INVALIDATIONS } from './invalidation';
import { qServerQueryKeys, type QServerQueryKeyFor } from './queryKeys';
import type {
    QServerHookError,
    QServerMutationHookOptions,
    QServerQueryHookOptions,
} from './types';
import { useQServerClient } from './useQServerClient';

/**
 * User-group permission hooks.
 *
 * None of these are in `QServerClientLike`, so all three reject with
 * `QServerEndpointUnavailableError` against a partial injected client such as the simulator's.
 * Changing permissions changes which plans and devices are allowed, so the catalogs are invalidated
 * too.
 */

export type UseGetPermissionsQueryOptions<TData = GetPermissionsResponse> = QServerQueryHookOptions<
    GetPermissionsResponse,
    TData,
    QServerQueryKeyFor<'permissions'>,
    QServerRequestOptions
>;

/** The current user-group permissions: allow/forbid lists of regular expressions per group. */
export function useGetPermissionsQuery<TData = GetPermissionsResponse>(
    options: UseGetPermissionsQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.permissions(scope),
        fetch: (client, mergedRequest) => client.getPermissions(mergedRequest),
        request,
        query,
    });
}

export type UseSetPermissionsMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PermissionsResponse,
    SetPermissionsBody,
    TContext
>;

/** Replace the user-group permissions wholesale. */
export function useSetPermissionsMutation<TContext = unknown>(
    options: UseSetPermissionsMutationOptions<TContext> = {},
): UseMutationResult<PermissionsResponse, QServerHookError, SetPermissionsBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.setPermissions(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useSetPermissionsMutation,
        ...options,
    });
}

export type UseReloadPermissionsMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PermissionsResponse,
    ReloadPermissionsBody | void,
    TContext
>;

/** Reload permissions from disk, optionally restoring the plan and device lists as well. */
export function useReloadPermissionsMutation<TContext = unknown>(
    options: UseReloadPermissionsMutationOptions<TContext> = {},
): UseMutationResult<
    PermissionsResponse,
    QServerHookError,
    ReloadPermissionsBody | void,
    TContext
> {
    return useQServerMutation({
        perform: (client, body, request) => client.reloadPermissions(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useReloadPermissionsMutation,
        ...options,
    });
}
