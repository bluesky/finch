import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { GetWithBodyOptions, QServerPayload } from '../types/common';
import type { GetLockInfoResponse, LockBody, LockResponse, UnlockBody } from '../types/lock';
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

/** Lock hooks: taking and releasing the environment/queue lock, and reading lock state. */

export type UseLockMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    LockResponse,
    LockBody,
    TContext
>;

/**
 * Lock the environment and/or the queue.
 *
 * `lock_key` is required, and every subsequent locked operation must present the same key.
 */
export function useLockMutation<TContext = unknown>(
    options: UseLockMutationOptions<TContext> = {},
): UseMutationResult<LockResponse, QServerHookError, LockBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.lock(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useLockMutation,
        ...options,
    });
}

export type UseUnlockMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    LockResponse,
    UnlockBody,
    TContext
>;

/** Release the lock, using the same key it was taken with. */
export function useUnlockMutation<TContext = unknown>(
    options: UseUnlockMutationOptions<TContext> = {},
): UseMutationResult<LockResponse, QServerHookError, UnlockBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.unlock(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useUnlockMutation,
        ...options,
    });
}

export interface UseGetLockInfoQueryOptions<
    TData = GetLockInfoResponse,
> extends QServerQueryHookOptions<
    GetLockInfoResponse,
    TData,
    QServerQueryKeyFor<'lockInfo'>,
    GetWithBodyOptions<GetLockInfoResponse>
> {
    /** Mirrors `client.getLockInfo(payload)`. Part of the query key. */
    payload?: QServerPayload;
}

/**
 * Full lock state: which of the environment and queue are locked, by whom, and when.
 *
 * This endpoint requires a request body even when empty, so **in a browser** the client falls back to
 * the `lock` field of `/api/status` — that yields the two booleans but no owner, time or note. The
 * `status` field on the response says so when the fallback was used.
 */
export function useGetLockInfoQuery<TData = GetLockInfoResponse>(
    options: UseGetLockInfoQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.lockInfo(scope, payload),
        fetch: (client, mergedRequest) => client.getLockInfo(payload, mergedRequest),
        request,
        query,
    });
}
