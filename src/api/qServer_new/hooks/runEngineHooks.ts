import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { GetWithBodyOptions, QServerPayload, QServerRequestOptions } from '../types/common';
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
import type {
    QServerHookError,
    QServerMutationHookOptions,
    QServerQueryHookOptions,
} from './types';
import { useQServerClient } from './useQServerClient';

/** Run Engine hooks: pause/resume/stop/abort/halt, and the run lists. */

// #region control

export type UseQueuePauseREMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    ReControlResponse,
    RePauseBody | void,
    TContext
>;

/**
 * Pause the Run Engine. `{ option: 'immediate' }` pauses now, `'deferred'` at the next checkpoint.
 *
 * Only succeeds while a plan is running.
 */
export function useQueuePauseREMutation<TContext = unknown>(
    options: UseQueuePauseREMutationOptions<TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, RePauseBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.pauseRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueuePauseREMutation,
        ...options,
    });
}

export type UseQueueResumeREMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    ReControlResponse,
    ReResumeBody | void,
    TContext
>;

/** Resume a paused plan. */
export function useQueueResumeREMutation<TContext = unknown>(
    options: UseQueueResumeREMutationOptions<TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.resumeRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueResumeREMutation,
        ...options,
    });
}

export type UseQueueStopREMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    ReControlResponse,
    ReResumeBody | void,
    TContext
>;

/**
 * Stop a paused plan cleanly: it lands in history as `stopped` and is not requeued.
 *
 * Requires a paused Run Engine, as do abort and halt.
 */
export function useQueueStopREMutation<TContext = unknown>(
    options: UseQueueStopREMutationOptions<TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.stopRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueStopREMutation,
        ...options,
    });
}

export type UseQueueAbortREMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    ReControlResponse,
    ReResumeBody | void,
    TContext
>;

/** Abort a paused plan: recorded as failed, and the item returns to the front of the queue. */
export function useQueueAbortREMutation<TContext = unknown>(
    options: UseQueueAbortREMutationOptions<TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.abortRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueAbortREMutation,
        ...options,
    });
}

export type UseQueueHaltREMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    ReControlResponse,
    ReResumeBody | void,
    TContext
>;

/** Halt a paused plan, skipping its cleanup handlers. Differs from abort only in exit status. */
export function useQueueHaltREMutation<TContext = unknown>(
    options: UseQueueHaltREMutationOptions<TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.haltRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueHaltREMutation,
        ...options,
    });
}

// #endregion

// #region run lists

export interface UseQueueGetRunsQueryOptions<
    TData = GetRunsResponse,
> extends QServerQueryHookOptions<
    GetRunsResponse,
    TData,
    QServerQueryKeyFor<'runs'>,
    QServerRequestOptions
> {
    /** `{ option: 'active' | 'open' | 'closed' }`. Part of the query key. */
    body?: GetRunsBody;
}

/**
 * The run list selected by `option`.
 *
 * A query even though the endpoint is a POST: it reads state and belongs in the cache.
 */
export function useQueueGetRunsQuery<TData = GetRunsResponse>(
    options: UseQueueGetRunsQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { body, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.runs(scope, body),
        fetch: (client, mergedRequest) => client.getRuns(body, mergedRequest),
        request,
        query,
    });
}

export type UseQueueGetRunsActiveQueryOptions<TData = GetRunsResponse> = QServerQueryHookOptions<
    GetRunsResponse,
    TData,
    QServerQueryKeyFor<'runsActive'>,
    QServerRequestOptions
>;

/** Runs belonging to the currently executing plan. */
export function useQueueGetRunsActiveQuery<TData = GetRunsResponse>(
    options: UseQueueGetRunsActiveQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.runsActive(scope),
        fetch: (client, mergedRequest) => client.getRunsActive(mergedRequest),
        request,
        query,
    });
}

export type UseQueueGetRunsOpenQueryOptions<TData = GetRunsResponse> = QServerQueryHookOptions<
    GetRunsResponse,
    TData,
    QServerQueryKeyFor<'runsOpen'>,
    QServerRequestOptions
>;

/** Runs that have been opened but not yet closed. */
export function useQueueGetRunsOpenQuery<TData = GetRunsResponse>(
    options: UseQueueGetRunsOpenQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.runsOpen(scope),
        fetch: (client, mergedRequest) => client.getRunsOpen(mergedRequest),
        request,
        query,
    });
}

export type UseQueueGetRunsClosedQueryOptions<TData = GetRunsResponse> = QServerQueryHookOptions<
    GetRunsResponse,
    TData,
    QServerQueryKeyFor<'runsClosed'>,
    QServerRequestOptions
>;

/** Runs completed by the current plan. */
export function useQueueGetRunsClosedQuery<TData = GetRunsResponse>(
    options: UseQueueGetRunsClosedQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.runsClosed(scope),
        fetch: (client, mergedRequest) => client.getRunsClosed(mergedRequest),
        request,
        query,
    });
}

export interface UseQueueGetREMetadataQueryOptions<
    TData = GetReMetadataResponse,
> extends QServerQueryHookOptions<
    GetReMetadataResponse,
    TData,
    QServerQueryKeyFor<'reMetadata'>,
    GetWithBodyOptions<GetReMetadataResponse>
> {
    /** Mirrors `client.getREMetadata(payload)`. Part of the query key. */
    payload?: QServerPayload;
}

/**
 * Run Engine metadata.
 *
 * Not implemented by every RE Manager build — v0.0.19 answers 400 — so this defaults to
 * `retry: false`. Also outside `QServerClientLike`, so it rejects with
 * `QServerEndpointUnavailableError` against a partial injected client.
 */
export function useQueueGetREMetadataQuery<TData = GetReMetadataResponse>(
    options: UseQueueGetREMetadataQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.reMetadata(scope, payload),
        fetch: (client, mergedRequest) => client.getREMetadata(payload, mergedRequest),
        request,
        query,
        defaults: { retry: false },
    });
}

// #endregion
