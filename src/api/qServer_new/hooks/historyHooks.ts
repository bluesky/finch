import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { GetWithBodyOptions, QServerPayload } from '../types/common';
import type { ClearHistoryResponse, GetHistoryResponse } from '../types/history';
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

/** History hooks: `/api/history/get`, `/api/history/clear`. */

export interface UseGetQueueHistoryQueryOptions<
    TData = GetHistoryResponse,
> extends QServerQueryHookOptions<
    GetHistoryResponse,
    TData,
    QServerQueryKeyFor<'history'>,
    GetWithBodyOptions<GetHistoryResponse>
> {
    /** Mirrors `client.getQueueHistory(payload)`. Part of the query key. */
    payload?: QServerPayload;
}

/** Completed plans, oldest first, each with its `result` (exit status, run uids, timings). */
export function useGetQueueHistoryQuery<TData = GetHistoryResponse>(
    options: UseGetQueueHistoryQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.history(scope, payload),
        fetch: (client, mergedRequest) => client.getQueueHistory(payload, mergedRequest),
        request,
        query,
    });
}

export type UseClearHistoryMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    ClearHistoryResponse,
    void,
    TContext
>;

/** Discard the plan history. */
export function useClearHistoryMutation<TContext = unknown>(
    options: UseClearHistoryMutationOptions<TContext> = {},
): UseMutationResult<ClearHistoryResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.clearHistory(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useClearHistoryMutation,
        ...options,
    });
}
