import type { UseQueryResult } from '@tanstack/react-query';
import type { GetWithBodyOptions } from '../types/common';
import type { GetTaskResultResponse, GetTaskStatusResponse, TaskBody } from '../types/tasks';
import { useQServerQuery } from './internal/useQServerQuery';
import { qServerQueryKeys, type QServerQueryKeyFor } from './queryKeys';
import type { FinchQueryOptions, QServerHookError } from './types';
import { useQServerQueryScope } from './useQServerClient';

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

/**
 * Whether a background task is `running`, `completed`, or `not_found`.
 *
 * @param body **Required.** `{ task_uid }`, as returned by the mutation that started the task. Part
 * of the query key; pass `undefined` to hold the query idle until you have one.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetTaskStatusQuery<TData = GetTaskStatusResponse>(
    body: TaskBody | undefined,
    requestOptions: GetWithBodyOptions<GetTaskStatusResponse> = {},
    queryOptions: FinchQueryOptions<
        GetTaskStatusResponse,
        TData,
        QServerQueryKeyFor<'taskStatus'>
    > = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.taskStatus(scope, body),
        fetch: (client, request) => client.getTaskStatus(body as TaskBody, request),
        requestOptions,
        queryOptions,
        defaults: { retry: false },
        defaultEnabled: Boolean(body?.task_uid),
    });
}

/**
 * A background task's status plus its return value once complete.
 *
 * @param body **Required.** `{ task_uid }`, as returned by the mutation that started the task. Part
 * of the query key; pass `undefined` to hold the query idle until you have one.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetTaskResultQuery<TData = GetTaskResultResponse>(
    body: TaskBody | undefined,
    requestOptions: GetWithBodyOptions<GetTaskResultResponse> = {},
    queryOptions: FinchQueryOptions<
        GetTaskResultResponse,
        TData,
        QServerQueryKeyFor<'taskResult'>
    > = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.taskResult(scope, body),
        fetch: (client, request) => client.getTaskResult(body as TaskBody, request),
        requestOptions,
        queryOptions,
        defaults: { retry: false },
        defaultEnabled: Boolean(body?.task_uid),
    });
}
