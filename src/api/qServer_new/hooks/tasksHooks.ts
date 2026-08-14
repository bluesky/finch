import type { UseQueryResult } from '@tanstack/react-query';
import type { GetWithBodyOptions } from '../types/common';
import type { GetTaskResultResponse, GetTaskStatusResponse, TaskBody } from '../types/tasks';
import { useQServerQuery } from './internal/useQServerQuery';
import { qServerQueryKeys, type QServerQueryKeyFor } from './queryKeys';
import type { QServerHookError, QServerQueryHookOptions } from './types';
import { useQServerClient } from './useQServerClient';

/**
 * Background-task hooks.
 *
 * **Neither works from a browser.** Both endpoints are `GET`s that require a JSON request body,
 * which browsers cannot send, and unlike the other body-required endpoints they have no fallback —
 * expect a 422 or a `QServerGetBodyUnsupportedError`. They are provided for completeness and for
 * Node/SSR callers; from a browser, observe a task's progress through status or the console socket
 * instead.
 *
 * Both default to `retry: false`, since neither the missing-body failure nor `not_found` improves on
 * a retry.
 */

export interface UseQueueGetTaskStatusQueryOptions<
    TData = GetTaskStatusResponse,
> extends QServerQueryHookOptions<
    GetTaskStatusResponse,
    TData,
    QServerQueryKeyFor<'taskStatus'>,
    GetWithBodyOptions<GetTaskStatusResponse>
> {
    /** `{ task_uid }`. Part of the query key; the query stays idle until it is present. */
    body?: TaskBody;
}

/** Whether a background task is `running`, `completed`, or `not_found`. */
export function useQueueGetTaskStatusQuery<TData = GetTaskStatusResponse>(
    options: UseQueueGetTaskStatusQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { body, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.taskStatus(scope, body),
        fetch: (client, mergedRequest) => client.getTaskStatus(body as TaskBody, mergedRequest),
        request,
        query,
        defaults: { retry: false },
        defaultEnabled: Boolean(body?.task_uid),
    });
}

export interface UseQueueGetTaskResultQueryOptions<
    TData = GetTaskResultResponse,
> extends QServerQueryHookOptions<
    GetTaskResultResponse,
    TData,
    QServerQueryKeyFor<'taskResult'>,
    GetWithBodyOptions<GetTaskResultResponse>
> {
    /** `{ task_uid }`. Part of the query key; the query stays idle until it is present. */
    body?: TaskBody;
}

/** A background task's status plus its return value once complete. */
export function useQueueGetTaskResultQuery<TData = GetTaskResultResponse>(
    options: UseQueueGetTaskResultQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { body, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.taskResult(scope, body),
        fetch: (client, mergedRequest) => client.getTaskResult(body as TaskBody, mergedRequest),
        request,
        query,
        defaults: { retry: false },
        defaultEnabled: Boolean(body?.task_uid),
    });
}
