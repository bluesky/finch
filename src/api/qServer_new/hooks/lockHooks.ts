import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { GetWithBodyOptions, QServerRequestOptions } from '../types/common';
import type { GetLockInfoResponse, LockBody, LockResponse, UnlockBody } from '../types/lock';
import { useQServerMutation } from './internal/useQServerMutation';
import { useQServerQuery } from './internal/useQServerQuery';
import { QSERVER_MUTATION_INVALIDATIONS } from './invalidation';
import { qServerQueryKeys, type QServerQueryKeyFor } from './queryKeys';
import type { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
import { useQServerQueryScope } from './useQServerClient';

/** Lock hooks: taking and releasing the environment/queue lock, and reading lock state. */

/**
 * Lock the environment and/or the queue.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. `mutate({ lock_key, environment, queue, note })` —
 * `lock_key` is required, and every subsequent locked operation must present the same key.
 */
export function useQueueLockMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<LockResponse, LockBody, TContext> = {},
): UseMutationResult<LockResponse, QServerHookError, LockBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.lock(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueLockMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Release the lock, using the same key it was taken with.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. `mutate({ lock_key })`.
 */
export function useQueueUnlockMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<LockResponse, UnlockBody, TContext> = {},
): UseMutationResult<LockResponse, QServerHookError, UnlockBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.unlock(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueUnlockMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Full lock state: which of the environment and queue are locked, by whom, and when.
 *
 * This endpoint requires a request body even when empty, so **in a browser** the client falls back to
 * the `lock` field of `/api/status` — that yields the two booleans but no owner, time or note. The
 * `status` field on the response says so when the fallback was used.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`. `strategy` / `fallback`
 * control what happens in a browser, where this endpoint's mandatory request body cannot be sent.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetLockInfoQuery<TData = GetLockInfoResponse>(
    requestOptions: GetWithBodyOptions<GetLockInfoResponse> = {},
    queryOptions: FinchQueryOptions<
        GetLockInfoResponse,
        TData,
        QServerQueryKeyFor<'lockInfo'>
    > = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.lockInfo(scope),
        fetch: (client, request) => client.getLockInfo(undefined, request),
        requestOptions,
        queryOptions,
    });
}
