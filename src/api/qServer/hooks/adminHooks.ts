import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type {
    AdminResponse,
    KernelInterruptBody,
    ManagerStopBody,
    TestServerSleepBody,
} from '../types/admin';
import type { GetWithBodyOptions, QServerRequestOptions } from '../types/common';
import { useQServerMutation } from './internal/useQServerMutation';
import { useQServerQuery } from './internal/useQServerQuery';
import { QSERVER_MUTATION_INVALIDATIONS } from './invalidation';
import { qServerQueryKeys, type QServerQueryKeyFor } from './queryKeys';
import type { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
import { useQServerQueryScope } from './useQServerClient';

/**
 * Administrative hooks.
 *
 * All four are destructive or diagnostic, and none is in `QServerClientLike` — they reject with
 * `QServerEndpointUnavailableError` against a partial injected client.
 */

/**
 * Send a KeyboardInterrupt to the IPython kernel.
 *
 * @param mutationOptions TanStack options. `mutate()` or
 * `mutate({ interrupt_task, interrupt_plan })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueInterruptKernelMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<AdminResponse, KernelInterruptBody | void, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<AdminResponse, QServerHookError, KernelInterruptBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.interruptKernel(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueInterruptKernelMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Shut RE Manager down.
 *
 * Every subsequent request will fail until the manager is restarted out of band.
 *
 * @param mutationOptions TanStack options. `mutate({ option: 'safe_on' })` (the default) refuses
 * while the queue is running; `'safe_off'` does not.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueStopManagerMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<AdminResponse, ManagerStopBody | void, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<AdminResponse, QServerHookError, ManagerStopBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.stopManager(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueStopManagerMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Kill RE Manager to exercise recovery. A test endpoint — do not ship UI that calls it.
 *
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueTestKillManagerMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<AdminResponse, void, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<AdminResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.testKillManager(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueTestKillManagerMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Ask the server to sleep before responding — for exercising timeouts and loading states.
 *
 * Defaults to `retry: false` and `staleTime: Infinity`, since retrying or refetching a deliberate
 * delay is never what you want.
 *
 * @param body `{ time }` in seconds. Part of the query key.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueTestServerSleepQuery<TData = AdminResponse>(
    body?: TestServerSleepBody,
    queryOptions?: FinchQueryOptions<AdminResponse, TData, QServerQueryKeyFor<'testServerSleep'>>,
    requestOptions?: GetWithBodyOptions<AdminResponse>,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.testServerSleep(scope, body),
        fetch: (client, request) => client.testServerSleep(body, request),
        requestOptions,
        queryOptions,
        defaults: { retry: false, staleTime: Number.POSITIVE_INFINITY },
    });
}
