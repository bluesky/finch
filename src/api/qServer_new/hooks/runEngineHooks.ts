import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { QServerRequestOptions } from '../types/common';
import type {
    GetReMetadataResponse,
    GetRunsBody,
    GetRunsResponse,
    ReControlResponse,
    RePauseBody,
    ReResumeBody,
} from '../types/runEngine';
import { useQServerMutation } from './internal/useQServerMutation';
import { useQServerQuery } from './internal/useQServerQuery';
import { QSERVER_MUTATION_INVALIDATIONS } from './invalidation';
import { qServerQueryKeys, type QServerQueryKeyFor } from './queryKeys';
import type { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
import { useQServerQueryScope } from './useQServerClient';

/** Run Engine hooks: pause/resume/stop/abort/halt, and the run lists. */

// #region control

/**
 * Pause the Run Engine. Only succeeds while a plan is running.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. `mutate({ option: 'immediate' })` pauses now,
 * `'deferred'` at the next checkpoint; `mutate()` uses the server default.
 */
export function useQueuePauseREMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<ReControlResponse, RePauseBody | void, TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, RePauseBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.pauseRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueuePauseREMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Resume a paused plan.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. Takes no body in practice: call `mutate()`.
 */
export function useQueueResumeREMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<ReControlResponse, ReResumeBody | void, TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.resumeRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueResumeREMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Stop a paused plan cleanly: it lands in history as `stopped` and is not requeued.
 *
 * Requires a paused Run Engine, as do abort and halt.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. Takes no body in practice: call `mutate()`.
 */
export function useQueueStopREMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<ReControlResponse, ReResumeBody | void, TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.stopRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueStopREMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Abort a paused plan: recorded as failed, and the item returns to the front of the queue.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. Takes no body in practice: call `mutate()`.
 */
export function useQueueAbortREMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<ReControlResponse, ReResumeBody | void, TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.abortRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueAbortREMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Halt a paused plan, skipping its cleanup handlers. Differs from abort only in exit status.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. Takes no body in practice: call `mutate()`.
 */
export function useQueueHaltREMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<ReControlResponse, ReResumeBody | void, TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.haltRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueHaltREMutation,
        requestOptions,
        mutationOptions,
    });
}

// #endregion

// #region run lists

/**
 * The run list selected by `option`.
 *
 * A query even though the endpoint is a POST: it reads state and belongs in the cache.
 *
 * @param body `{ option: 'active' | 'open' | 'closed' }`. Part of the query key.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetRunsQuery<TData = GetRunsResponse>(
    body?: GetRunsBody,
    requestOptions: QServerRequestOptions = {},
    queryOptions: FinchQueryOptions<GetRunsResponse, TData, QServerQueryKeyFor<'runs'>> = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.runs(scope, body),
        fetch: (client, request) => client.getRuns(body, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Runs belonging to the currently executing plan.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetRunsActiveQuery<TData = GetRunsResponse>(
    requestOptions: QServerRequestOptions = {},
    queryOptions: FinchQueryOptions<GetRunsResponse, TData, QServerQueryKeyFor<'runsActive'>> = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.runsActive(scope),
        fetch: (client, request) => client.getRunsActive(request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Runs that have been opened but not yet closed.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetRunsOpenQuery<TData = GetRunsResponse>(
    requestOptions: QServerRequestOptions = {},
    queryOptions: FinchQueryOptions<GetRunsResponse, TData, QServerQueryKeyFor<'runsOpen'>> = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.runsOpen(scope),
        fetch: (client, request) => client.getRunsOpen(request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Runs completed by the current plan.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetRunsClosedQuery<TData = GetRunsResponse>(
    requestOptions: QServerRequestOptions = {},
    queryOptions: FinchQueryOptions<GetRunsResponse, TData, QServerQueryKeyFor<'runsClosed'>> = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.runsClosed(scope),
        fetch: (client, request) => client.getRunsClosed(request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Run Engine metadata.
 *
 * Not implemented by every RE Manager build — v0.0.19 answers 400 — so this defaults to
 * `retry: false`. Also outside `QServerClientLike`, so it rejects with
 * `QServerEndpointUnavailableError` against a partial injected client.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetREMetadataQuery<TData = GetReMetadataResponse>(
    requestOptions: QServerRequestOptions = {},
    queryOptions: FinchQueryOptions<
        GetReMetadataResponse,
        TData,
        QServerQueryKeyFor<'reMetadata'>
    > = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.reMetadata(scope),
        fetch: (client, request) => client.getREMetadata(undefined, request),
        requestOptions,
        queryOptions,
        defaults: { retry: false },
    });
}

// #endregion
