import { UseQueryResult } from '@tanstack/react-query';
import { GetWithBodyOptions } from '../types/common';
import { GetTaskResultResponse, GetTaskStatusResponse, TaskBody } from '../types/tasks';
import { QServerQueryKeyFor } from './queryKeys';
import { FinchQueryOptions, QServerHookError } from './types';
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
export declare function useQueueGetTaskStatusQuery<TData = GetTaskStatusResponse>(body: TaskBody | undefined, queryOptions?: FinchQueryOptions<GetTaskStatusResponse, TData, QServerQueryKeyFor<'taskStatus'>>, requestOptions?: GetWithBodyOptions<GetTaskStatusResponse>): UseQueryResult<TData, QServerHookError>;
/**
 * A background task's status plus its return value once complete.
 *
 * @param body **Required.** `{ task_uid }`, as returned by the mutation that started the task. Part
 * of the query key; pass `undefined` to hold the query idle until you have one.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueGetTaskResultQuery<TData = GetTaskResultResponse>(body: TaskBody | undefined, queryOptions?: FinchQueryOptions<GetTaskResultResponse, TData, QServerQueryKeyFor<'taskResult'>>, requestOptions?: GetWithBodyOptions<GetTaskResultResponse>): UseQueryResult<TData, QServerHookError>;
//# sourceMappingURL=tasksHooks.d.ts.map