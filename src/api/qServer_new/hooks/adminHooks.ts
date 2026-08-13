import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type {
    AdminResponse,
    KernelInterruptBody,
    ManagerStopBody,
    TestServerSleepBody,
} from '../types/admin';
import type { GetWithBodyOptions } from '../types/common';
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
 * Administrative hooks.
 *
 * All four are destructive or diagnostic, and none is in `QServerClientLike` — they reject with
 * `QServerEndpointUnavailableError` against a partial injected client.
 */

export type UseInterruptKernelMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    AdminResponse,
    KernelInterruptBody | void,
    TContext
>;

/** Send a KeyboardInterrupt to the IPython kernel: `{ interrupt_task, interrupt_plan }`. */
export function useInterruptKernelMutation<TContext = unknown>(
    options: UseInterruptKernelMutationOptions<TContext> = {},
): UseMutationResult<AdminResponse, QServerHookError, KernelInterruptBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.interruptKernel(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useInterruptKernelMutation,
        ...options,
    });
}

export type UseStopManagerMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    AdminResponse,
    ManagerStopBody | void,
    TContext
>;

/**
 * Shut RE Manager down.
 *
 * `{ option: 'safe_on' }` (the default) refuses while the queue is running; `'safe_off'` does not.
 * Every subsequent request will fail until the manager is restarted out of band.
 */
export function useStopManagerMutation<TContext = unknown>(
    options: UseStopManagerMutationOptions<TContext> = {},
): UseMutationResult<AdminResponse, QServerHookError, ManagerStopBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.stopManager(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useStopManagerMutation,
        ...options,
    });
}

export type UseTestKillManagerMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    AdminResponse,
    void,
    TContext
>;

/** Kill RE Manager to exercise recovery. A test endpoint — do not ship UI that calls it. */
export function useTestKillManagerMutation<TContext = unknown>(
    options: UseTestKillManagerMutationOptions<TContext> = {},
): UseMutationResult<AdminResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.testKillManager(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useTestKillManagerMutation,
        ...options,
    });
}

export interface UseTestServerSleepQueryOptions<
    TData = AdminResponse,
> extends QServerQueryHookOptions<
    AdminResponse,
    TData,
    QServerQueryKeyFor<'testServerSleep'>,
    GetWithBodyOptions<AdminResponse>
> {
    /** `{ time }` in seconds. Part of the query key. */
    payload?: TestServerSleepBody;
}

/**
 * Ask the server to sleep before responding — for exercising timeouts and loading states.
 *
 * Defaults to `retry: false` and `staleTime: Infinity`, since retrying or refetching a deliberate
 * delay is never what you want.
 */
export function useTestServerSleepQuery<TData = AdminResponse>(
    options: UseTestServerSleepQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.testServerSleep(scope, payload),
        fetch: (client, mergedRequest) => client.testServerSleep(payload, mergedRequest),
        request,
        query,
        defaults: { retry: false, staleTime: Number.POSITIVE_INFINITY },
    });
}
