import type { UseQueryResult } from '@tanstack/react-query';
import { requireArg } from '@/api/shared/errors';
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
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetTaskStatusQuery<TData = GetTaskStatusResponse>(
    body: TaskBody | undefined,
    queryOptions?: FinchQueryOptions<
        GetTaskStatusResponse,
        TData,
        QServerQueryKeyFor<'taskStatus'>
    >,
    requestOptions?: GetWithBodyOptions<GetTaskStatusResponse>,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.taskStatus(scope, body),
        // `requireArg` rather than a cast, so a caller who forces `enabled: true` past the guard
        // below gets a named error in `error` instead of a request with `undefined` in it. Note the
        // guard is the stricter of the two: `{ task_uid: '' }` passes here and 422s at the server,
        // which is a legible enough failure not to warrant validating fields in the hook layer.
        fetch: (client, request) =>
            client.getTaskStatus(requireArg(body, 'useQueueGetTaskStatusQuery', 'body'), request),
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
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetTaskResultQuery<TData = GetTaskResultResponse>(
    body: TaskBody | undefined,
    queryOptions?: FinchQueryOptions<
        GetTaskResultResponse,
        TData,
        QServerQueryKeyFor<'taskResult'>
    >,
    requestOptions?: GetWithBodyOptions<GetTaskResultResponse>,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.taskResult(scope, body),
        fetch: (client, request) =>
            client.getTaskResult(requireArg(body, 'useQueueGetTaskResultQuery', 'body'), request),
        requestOptions,
        queryOptions,
        defaults: { retry: false },
        defaultEnabled: Boolean(body?.task_uid),
    });
}
