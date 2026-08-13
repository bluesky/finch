import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { GetWithBodyOptions, QServerSuccessResponse } from '../types/common';
import type {
    AddQueueItemBatchBody,
    AddQueueItemBody,
    ExecuteQueueItemBody,
    GetQueueItemBody,
    GetQueueItemResponse,
    GetQueueResponse,
    MoveQueueItemBatchBody,
    MoveQueueItemBody,
    PostItemAddResponse,
    PostItemBatchResponse,
    PostItemExecuteResponse,
    PostItemRemoveResponse,
    PostItemUpdateResponse,
    QueueAutostartBody,
    QueueClearResponse,
    QueueModeSetBody,
    QueueStartResponse,
    RemoveQueueItemBatchBody,
    RemoveQueueItemBody,
    UpdateQueueItemBody,
    UploadSpreadsheetInput,
    UploadSpreadsheetResponse,
} from '../types/queue';
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

/** Queue hooks: reading the queue, editing it, and controlling execution. */

// #region reads

export interface UseGetQueueQueryOptions<TData = GetQueueResponse> extends QServerQueryHookOptions<
    GetQueueResponse,
    TData,
    QServerQueryKeyFor<'queue'>,
    GetWithBodyOptions<GetQueueResponse>
> {
    /** Mirrors `client.getQueue(payload)`. Part of the query key. */
    payload?: Record<string, unknown>;
}

/**
 * The queue contents plus the currently running item.
 *
 * `running_item` is `{}` when nothing is running — check for `item_uid` rather than truthiness.
 */
export function useGetQueueQuery<TData = GetQueueResponse>(
    options: UseGetQueueQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.queue(scope, payload),
        fetch: (client, mergedRequest) => client.getQueue(payload, mergedRequest),
        request,
        query,
    });
}

export interface UseGetQueueItemQueryOptions<
    TData = GetQueueItemResponse,
> extends QServerQueryHookOptions<
    GetQueueItemResponse,
    TData,
    QServerQueryKeyFor<'queueItem'>,
    GetWithBodyOptions<GetQueueItemResponse>
> {
    /** Address the item by `uid`, or by `pos` (`'front'`, `'back'`, or an index). */
    body?: GetQueueItemBody;
}

/**
 * One queue item, addressed by uid or position.
 *
 * Disabled until `body` carries a `uid` or a `pos`; pass `query.enabled` to override. In a browser
 * this endpoint falls back to scanning `getQueue()`, because the real one reads its arguments from a
 * GET request body.
 */
export function useGetQueueItemQuery<TData = GetQueueItemResponse>(
    options: UseGetQueueItemQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { body, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.queueItem(scope, body),
        fetch: (client, mergedRequest) => client.getQueueItem(body, mergedRequest),
        request,
        query,
        defaultEnabled: body?.uid !== undefined || body?.pos !== undefined,
    });
}

// #endregion

// #region item writes

export type UseAddQueueItemMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemAddResponse,
    AddQueueItemBody,
    TContext
>;

/**
 * Add one item to the queue.
 *
 * A rejected item resolves with `success: false` and `qsize: null` rather than throwing — the
 * server validates plan names and reports the failure in the envelope.
 */
export function useAddQueueItemMutation<TContext = unknown>(
    options: UseAddQueueItemMutationOptions<TContext> = {},
): UseMutationResult<PostItemAddResponse, QServerHookError, AddQueueItemBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.addQueueItem(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useAddQueueItemMutation,
        ...options,
    });
}

export type UseAddQueueItemBatchMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemBatchResponse,
    AddQueueItemBatchBody,
    TContext
>;

/** Add several items at once. `results` reports per-item success. */
export function useAddQueueItemBatchMutation<TContext = unknown>(
    options: UseAddQueueItemBatchMutationOptions<TContext> = {},
): UseMutationResult<PostItemBatchResponse, QServerHookError, AddQueueItemBatchBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.addQueueItemBatch(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useAddQueueItemBatchMutation,
        ...options,
    });
}

export type UseExecuteQueueItemMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemExecuteResponse,
    ExecuteQueueItemBody,
    TContext
>;

/** Run one item immediately, without placing it on the queue. */
export function useExecuteQueueItemMutation<TContext = unknown>(
    options: UseExecuteQueueItemMutationOptions<TContext> = {},
): UseMutationResult<PostItemExecuteResponse, QServerHookError, ExecuteQueueItemBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.executeQueueItem(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useExecuteQueueItemMutation,
        ...options,
    });
}

export type UseUpdateQueueItemMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemUpdateResponse,
    UpdateQueueItemBody,
    TContext
>;

/** Replace an existing item, matched by its uid. `replace: true` mints a new uid. */
export function useUpdateQueueItemMutation<TContext = unknown>(
    options: UseUpdateQueueItemMutationOptions<TContext> = {},
): UseMutationResult<PostItemUpdateResponse, QServerHookError, UpdateQueueItemBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.updateQueueItem(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useUpdateQueueItemMutation,
        ...options,
    });
}

export type UseRemoveQueueItemMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemRemoveResponse,
    RemoveQueueItemBody | void,
    TContext
>;

/** Remove one item by uid or position. With no argument the server removes the back item. */
export function useRemoveQueueItemMutation<TContext = unknown>(
    options: UseRemoveQueueItemMutationOptions<TContext> = {},
): UseMutationResult<
    PostItemRemoveResponse,
    QServerHookError,
    RemoveQueueItemBody | void,
    TContext
> {
    return useQServerMutation({
        perform: (client, body, request) => client.removeQueueItem(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useRemoveQueueItemMutation,
        ...options,
    });
}

export type UseRemoveQueueItemBatchMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemBatchResponse,
    RemoveQueueItemBatchBody,
    TContext
>;

/** Remove several items by uid. `ignore_missing` decides whether absent uids fail the call. */
export function useRemoveQueueItemBatchMutation<TContext = unknown>(
    options: UseRemoveQueueItemBatchMutationOptions<TContext> = {},
): UseMutationResult<PostItemBatchResponse, QServerHookError, RemoveQueueItemBatchBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.removeQueueItemBatch(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useRemoveQueueItemBatchMutation,
        ...options,
    });
}

export type UseMoveQueueItemMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemAddResponse,
    MoveQueueItemBody,
    TContext
>;

/** Reposition one item, by `pos_dest`, `before_uid` or `after_uid`. */
export function useMoveQueueItemMutation<TContext = unknown>(
    options: UseMoveQueueItemMutationOptions<TContext> = {},
): UseMutationResult<PostItemAddResponse, QServerHookError, MoveQueueItemBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.moveQueueItem(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useMoveQueueItemMutation,
        ...options,
    });
}

export type UseMoveQueueItemBatchMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemBatchResponse,
    MoveQueueItemBatchBody,
    TContext
>;

/**
 * Reposition several items.
 *
 * Not part of `QServerClientLike`, so this rejects with `QServerEndpointUnavailableError` against a
 * partial injected client.
 */
export function useMoveQueueItemBatchMutation<TContext = unknown>(
    options: UseMoveQueueItemBatchMutationOptions<TContext> = {},
): UseMutationResult<PostItemBatchResponse, QServerHookError, MoveQueueItemBatchBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.moveQueueItemBatch(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useMoveQueueItemBatchMutation,
        ...options,
    });
}

export type UseUploadQueueSpreadsheetMutationOptions<TContext = unknown> =
    QServerMutationHookOptions<UploadSpreadsheetResponse, UploadSpreadsheetInput, TContext>;

/**
 * Upload a spreadsheet that a server-side function converts into queue items.
 *
 * Multipart, and not part of `QServerClientLike`.
 */
export function useUploadQueueSpreadsheetMutation<TContext = unknown>(
    options: UseUploadQueueSpreadsheetMutationOptions<TContext> = {},
): UseMutationResult<
    UploadSpreadsheetResponse,
    QServerHookError,
    UploadSpreadsheetInput,
    TContext
> {
    return useQServerMutation({
        perform: (client, input, request) => client.uploadQueueSpreadsheet(input, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useUploadQueueSpreadsheetMutation,
        ...options,
    });
}

// #endregion

// #region queue control

export type UseStartQueueMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    QueueStartResponse,
    void,
    TContext
>;

/**
 * Start executing the queue.
 *
 * Refuses with `success: false` when the environment is closed, the queue is empty, or the manager
 * is not idle.
 */
export function useStartQueueMutation<TContext = unknown>(
    options: UseStartQueueMutationOptions<TContext> = {},
): UseMutationResult<QueueStartResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.startQueue(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useStartQueueMutation,
        ...options,
    });
}

export type UseStopQueueMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    QServerSuccessResponse,
    void,
    TContext
>;

/** Stop the queue once the running plan finishes. Sets `queue_stop_pending`. */
export function useStopQueueMutation<TContext = unknown>(
    options: UseStopQueueMutationOptions<TContext> = {},
): UseMutationResult<QServerSuccessResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.stopQueue(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useStopQueueMutation,
        ...options,
    });
}

export type UseCancelQueueStopMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    QServerSuccessResponse,
    void,
    TContext
>;

/** Cancel a pending stop request. */
export function useCancelQueueStopMutation<TContext = unknown>(
    options: UseCancelQueueStopMutationOptions<TContext> = {},
): UseMutationResult<QServerSuccessResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.cancelQueueStop(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useCancelQueueStopMutation,
        ...options,
    });
}

export type UseClearQueueMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    QueueClearResponse,
    void,
    TContext
>;

/** Discard every queued item. Does not affect the running plan. */
export function useClearQueueMutation<TContext = unknown>(
    options: UseClearQueueMutationOptions<TContext> = {},
): UseMutationResult<QueueClearResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.clearQueue(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useClearQueueMutation,
        ...options,
    });
}

export type UseSetQueueModeMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    QServerSuccessResponse,
    QueueModeSetBody,
    TContext
>;

/** Set loop mode and failure handling: `{ mode: { loop, ignore_failures } }`. */
export function useSetQueueModeMutation<TContext = unknown>(
    options: UseSetQueueModeMutationOptions<TContext> = {},
): UseMutationResult<QServerSuccessResponse, QServerHookError, QueueModeSetBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.setQueueMode(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useSetQueueModeMutation,
        ...options,
    });
}

export type UseSetQueueAutostartMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    QServerSuccessResponse,
    QueueAutostartBody,
    TContext
>;

/** Start the queue automatically whenever an item is added: `{ enable: boolean }`. */
export function useSetQueueAutostartMutation<TContext = unknown>(
    options: UseSetQueueAutostartMutationOptions<TContext> = {},
): UseMutationResult<QServerSuccessResponse, QServerHookError, QueueAutostartBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.setQueueAutostart(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useSetQueueAutostartMutation,
        ...options,
    });
}

// #endregion
