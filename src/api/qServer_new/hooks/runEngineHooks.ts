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

export type UsePauseREMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    ReControlResponse,
    RePauseBody | void,
    TContext
>;

/**
 * Pause the Run Engine. `{ option: 'immediate' }` pauses now, `'deferred'` at the next checkpoint.
 *
 * Only succeeds while a plan is running.
 */
export function usePauseREMutation<TContext = unknown>(
    options: UsePauseREMutationOptions<TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, RePauseBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.pauseRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.usePauseREMutation,
        ...options,
    });
}

export type UseResumeREMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    ReControlResponse,
    ReResumeBody | void,
    TContext
>;

/** Resume a paused plan. */
export function useResumeREMutation<TContext = unknown>(
    options: UseResumeREMutationOptions<TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.resumeRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useResumeREMutation,
        ...options,
    });
}

export type UseStopREMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    ReControlResponse,
    ReResumeBody | void,
    TContext
>;

/**
 * Stop a paused plan cleanly: it lands in history as `stopped` and is not requeued.
 *
 * Requires a paused Run Engine, as do abort and halt.
 */
export function useStopREMutation<TContext = unknown>(
    options: UseStopREMutationOptions<TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.stopRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useStopREMutation,
        ...options,
    });
}

export type UseAbortREMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    ReControlResponse,
    ReResumeBody | void,
    TContext
>;

/** Abort a paused plan: recorded as failed, and the item returns to the front of the queue. */
export function useAbortREMutation<TContext = unknown>(
    options: UseAbortREMutationOptions<TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.abortRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useAbortREMutation,
        ...options,
    });
}

export type UseHaltREMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    ReControlResponse,
    ReResumeBody | void,
    TContext
>;

/** Halt a paused plan, skipping its cleanup handlers. Differs from abort only in exit status. */
export function useHaltREMutation<TContext = unknown>(
    options: UseHaltREMutationOptions<TContext> = {},
): UseMutationResult<ReControlResponse, QServerHookError, ReResumeBody | void, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.haltRE(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useHaltREMutation,
        ...options,
    });
}

// #endregion

// #region run lists

export interface UseGetRunsQueryOptions<TData = GetRunsResponse> extends QServerQueryHookOptions<
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
export function useGetRunsQuery<TData = GetRunsResponse>(
    options: UseGetRunsQueryOptions<TData> = {},
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

export type UseGetRunsActiveQueryOptions<TData = GetRunsResponse> = QServerQueryHookOptions<
    GetRunsResponse,
    TData,
    QServerQueryKeyFor<'runsActive'>,
    QServerRequestOptions
>;

/** Runs belonging to the currently executing plan. */
export function useGetRunsActiveQuery<TData = GetRunsResponse>(
    options: UseGetRunsActiveQueryOptions<TData> = {},
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

export type UseGetRunsOpenQueryOptions<TData = GetRunsResponse> = QServerQueryHookOptions<
    GetRunsResponse,
    TData,
    QServerQueryKeyFor<'runsOpen'>,
    QServerRequestOptions
>;

/** Runs that have been opened but not yet closed. */
export function useGetRunsOpenQuery<TData = GetRunsResponse>(
    options: UseGetRunsOpenQueryOptions<TData> = {},
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

export type UseGetRunsClosedQueryOptions<TData = GetRunsResponse> = QServerQueryHookOptions<
    GetRunsResponse,
    TData,
    QServerQueryKeyFor<'runsClosed'>,
    QServerRequestOptions
>;

/** Runs completed by the current plan. */
export function useGetRunsClosedQuery<TData = GetRunsResponse>(
    options: UseGetRunsClosedQueryOptions<TData> = {},
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

export interface UseGetREMetadataQueryOptions<
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
export function useGetREMetadataQuery<TData = GetReMetadataResponse>(
    options: UseGetREMetadataQueryOptions<TData> = {},
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
