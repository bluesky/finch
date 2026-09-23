import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { QServerRequestOptions } from '../types/common';
import { ClearHistoryResponse, GetHistoryResponse } from '../types/history';
import { QServerQueryKeyFor } from './queryKeys';
import { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
/** History hooks: `/api/history/get`, `/api/history/clear`. */
/**
 * Completed plans, oldest first, each with its `result` (exit status, run uids, timings).
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetHistoryQuery<TData = GetHistoryResponse>(queryOptions?: FinchQueryOptions<GetHistoryResponse, TData, QServerQueryKeyFor<'history'>>, requestOptions?: QServerRequestOptions): UseQueryResult<TData, QServerHookError>;
/**
 * Discard the plan history.
 *
 * @param mutationOptions TanStack options. `onSuccess` runs after the history and status caches have
 * been refreshed.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueClearHistoryMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<ClearHistoryResponse, void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<ClearHistoryResponse, QServerHookError, void, TContext>;
//# sourceMappingURL=historyHooks.d.ts.map