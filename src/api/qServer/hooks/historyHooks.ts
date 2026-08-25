import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { QServerRequestOptions } from '../types/common';
import type { ClearHistoryResponse, GetHistoryResponse } from '../types/history';
import { useQServerMutation } from './internal/useQServerMutation';
import { useQServerQuery } from './internal/useQServerQuery';
import { QSERVER_MUTATION_INVALIDATIONS } from './invalidation';
import { qServerQueryKeys, type QServerQueryKeyFor } from './queryKeys';
import type { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
import { useQServerQueryScope } from './useQServerClient';

/** History hooks: `/api/history/get`, `/api/history/clear`. */

/**
 * Completed plans, oldest first, each with its `result` (exit status, run uids, timings).
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetHistoryQuery<TData = GetHistoryResponse>(
    queryOptions?: FinchQueryOptions<GetHistoryResponse, TData, QServerQueryKeyFor<'history'>>,
    requestOptions?: QServerRequestOptions,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.history(scope),
        fetch: (client, request) => client.getQueueHistory(undefined, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Discard the plan history.
 *
 * @param mutationOptions TanStack options. `onSuccess` runs after the history and status caches have
 * been refreshed.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueClearHistoryMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<ClearHistoryResponse, void, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<ClearHistoryResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.clearHistory(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueClearHistoryMutation,
        requestOptions,
        mutationOptions,
    });
}
