import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { GetWithBodyOptions, QServerRequestOptions } from '../types/common';
import { GetLockInfoResponse, LockBody, LockResponse, UnlockBody } from '../types/lock';
import { QServerQueryKeyFor } from './queryKeys';
import { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
/** Lock hooks: taking and releasing the environment/queue lock, and reading lock state. */
/**
 * Lock the environment and/or the queue.
 *
 * @param mutationOptions TanStack options. `mutate({ lock_key, environment, queue, note })` —
 * `lock_key` is required, and every subsequent locked operation must present the same key.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueLockMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<LockResponse, LockBody, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<LockResponse, QServerHookError, LockBody, TContext>;
/**
 * Release the lock, using the same key it was taken with.
 *
 * @param mutationOptions TanStack options. `mutate({ lock_key })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueUnlockMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<LockResponse, UnlockBody, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<LockResponse, QServerHookError, UnlockBody, TContext>;
/**
 * Full lock state: which of the environment and queue are locked, by whom, and when.
 *
 * This endpoint requires a request body even when empty, so **in a browser** the client falls back to
 * the `lock` field of `/api/status` — that yields the two booleans but no owner, time or note. The
 * `status` field on the response says so when the fallback was used.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`. `strategy` / `fallback`
 * control what happens in a browser, where this endpoint's mandatory request body cannot be sent.
 */
export declare function useQueueGetLockInfoQuery<TData = GetLockInfoResponse>(queryOptions?: FinchQueryOptions<GetLockInfoResponse, TData, QServerQueryKeyFor<'lockInfo'>>, requestOptions?: GetWithBodyOptions<GetLockInfoResponse>): UseQueryResult<TData, QServerHookError>;
//# sourceMappingURL=lockHooks.d.ts.map