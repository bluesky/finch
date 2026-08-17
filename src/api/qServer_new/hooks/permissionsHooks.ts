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
import type { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
import { useQServerQueryScope } from './useQServerClient';

/**
 * User-group permission hooks.
 *
 * None of these are in `QServerClientLike`, so all three reject with
 * `QServerEndpointUnavailableError` against a partial injected client such as the simulator's.
 * Changing permissions changes which plans and devices are allowed, so the catalogs are invalidated
 * too.
 */

/**
 * The current user-group permissions: allow/forbid lists of regular expressions per group.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetPermissionsQuery<TData = GetPermissionsResponse>(
    requestOptions: QServerRequestOptions = {},
    queryOptions: FinchQueryOptions<
        GetPermissionsResponse,
        TData,
        QServerQueryKeyFor<'permissions'>
    > = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.permissions(scope),
        fetch: (client, request) => client.getPermissions(request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Replace the user-group permissions wholesale.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. `mutate({ user_group_permissions })`.
 */
export function useQueueSetPermissionsMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<PermissionsResponse, SetPermissionsBody, TContext> = {},
): UseMutationResult<PermissionsResponse, QServerHookError, SetPermissionsBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.setPermissions(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueSetPermissionsMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Reload permissions from disk, optionally restoring the plan and device lists as well.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. `mutate()` or
 * `mutate({ restore_plans_devices, restore_permissions })`.
 */
export function useQueueReloadPermissionsMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<
        PermissionsResponse,
        ReloadPermissionsBody | void,
        TContext
    > = {},
): UseMutationResult<
    PermissionsResponse,
    QServerHookError,
    ReloadPermissionsBody | void,
    TContext
> {
    return useQServerMutation({
        perform: (client, body, request) => client.reloadPermissions(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueReloadPermissionsMutation,
        requestOptions,
        mutationOptions,
    });
}
