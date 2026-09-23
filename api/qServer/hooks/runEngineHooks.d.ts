import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { QServerRequestOptions } from '../types/common';
import { GetReMetadataResponse, GetRunsBody, GetRunsResponse, ReControlResponse, RePauseBody, ReResumeBody } from '../types/runEngine';
import { QServerQueryKeyFor } from './queryKeys';
import { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
/** Run Engine hooks: pause/resume/stop/abort/halt, and the run lists. */
/**
 * Pause the Run Engine. Only succeeds while a plan is running.
 *
 * @param mutationOptions TanStack options. `mutate({ option: 'immediate' })` pauses now,
 * `'deferred'` at the next checkpoint; `mutate()` uses the server default.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueuePauseREMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<ReControlResponse, RePauseBody | void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<ReControlResponse, QServerHookError, RePauseBody | void, TContext>;
/**
 * Resume a paused plan.
 *
 * @param mutationOptions TanStack options. Takes no body in practice: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueResumeREMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<ReControlResponse, ReResumeBody | void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext>;
/**
 * Stop a paused plan cleanly: it lands in history as `stopped` and is not requeued.
 *
 * Requires a paused Run Engine, as do abort and halt.
 *
 * @param mutationOptions TanStack options. Takes no body in practice: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueStopREMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<ReControlResponse, ReResumeBody | void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext>;
/**
 * Abort a paused plan: recorded as failed, and the item returns to the front of the queue.
 *
 * @param mutationOptions TanStack options. Takes no body in practice: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueAbortREMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<ReControlResponse, ReResumeBody | void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext>;
/**
 * Halt a paused plan, skipping its cleanup handlers. Differs from abort only in exit status.
 *
 * @param mutationOptions TanStack options. Takes no body in practice: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueHaltREMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<ReControlResponse, ReResumeBody | void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext>;
/**
 * The run list selected by `option`.
 *
 * A query even though the endpoint is a POST: it reads state and belongs in the cache.
 *
 * @param body `{ option: 'active' | 'open' | 'closed' }`. Part of the query key.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetRunsQuery<TData = GetRunsResponse>(body?: GetRunsBody, queryOptions?: FinchQueryOptions<GetRunsResponse, TData, QServerQueryKeyFor<'runs'>>, requestOptions?: QServerRequestOptions): UseQueryResult<TData, QServerHookError>;
/**
 * Runs belonging to the currently executing plan.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetRunsActiveQuery<TData = GetRunsResponse>(queryOptions?: FinchQueryOptions<GetRunsResponse, TData, QServerQueryKeyFor<'runsActive'>>, requestOptions?: QServerRequestOptions): UseQueryResult<TData, QServerHookError>;
/**
 * Runs that have been opened but not yet closed.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetRunsOpenQuery<TData = GetRunsResponse>(queryOptions?: FinchQueryOptions<GetRunsResponse, TData, QServerQueryKeyFor<'runsOpen'>>, requestOptions?: QServerRequestOptions): UseQueryResult<TData, QServerHookError>;
/**
 * Runs completed by the current plan.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetRunsClosedQuery<TData = GetRunsResponse>(queryOptions?: FinchQueryOptions<GetRunsResponse, TData, QServerQueryKeyFor<'runsClosed'>>, requestOptions?: QServerRequestOptions): UseQueryResult<TData, QServerHookError>;
/**
 * Run Engine metadata.
 *
 * Not implemented by every RE Manager build — v0.0.19 answers 400 — so this defaults to
 * `retry: false`. Also outside `QServerClientLike`, so it rejects with
 * `QServerEndpointUnavailableError` against a partial injected client.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetREMetadataQuery<TData = GetReMetadataResponse>(queryOptions?: FinchQueryOptions<GetReMetadataResponse, TData, QServerQueryKeyFor<'reMetadata'>>, requestOptions?: QServerRequestOptions): UseQueryResult<TData, QServerHookError>;
//# sourceMappingURL=runEngineHooks.d.ts.map