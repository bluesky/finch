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

export interface UseQueueGetQueryOptions<TData = GetQueueResponse> extends QServerQueryHookOptions<
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
export function useQueueGetQuery<TData = GetQueueResponse>(
    options: UseQueueGetQueryOptions<TData> = {},
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

export interface UseQueueGetItemQueryOptions<
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
export function useQueueGetItemQuery<TData = GetQueueItemResponse>(
    options: UseQueueGetItemQueryOptions<TData> = {},
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

export type UseQueueAddItemMutationOptions<TContext = unknown> = QServerMutationHookOptions<
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
export function useQueueAddItemMutation<TContext = unknown>(
    options: UseQueueAddItemMutationOptions<TContext> = {},
): UseMutationResult<PostItemAddResponse, QServerHookError, AddQueueItemBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.addQueueItem(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueAddItemMutation,
        ...options,
    });
}

export type UseQueueAddItemBatchMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemBatchResponse,
    AddQueueItemBatchBody,
    TContext
>;

/** Add several items at once. `results` reports per-item success. */
export function useQueueAddItemBatchMutation<TContext = unknown>(
    options: UseQueueAddItemBatchMutationOptions<TContext> = {},
): UseMutationResult<PostItemBatchResponse, QServerHookError, AddQueueItemBatchBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.addQueueItemBatch(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueAddItemBatchMutation,
        ...options,
    });
}

export type UseQueueExecuteItemMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemExecuteResponse,
    ExecuteQueueItemBody,
    TContext
>;

/** Run one item immediately, without placing it on the queue. */
export function useQueueExecuteItemMutation<TContext = unknown>(
    options: UseQueueExecuteItemMutationOptions<TContext> = {},
): UseMutationResult<PostItemExecuteResponse, QServerHookError, ExecuteQueueItemBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.executeQueueItem(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueExecuteItemMutation,
        ...options,
    });
}

export type UseQueueUpdateItemMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemUpdateResponse,
    UpdateQueueItemBody,
    TContext
>;

/** Replace an existing item, matched by its uid. `replace: true` mints a new uid. */
export function useQueueUpdateItemMutation<TContext = unknown>(
    options: UseQueueUpdateItemMutationOptions<TContext> = {},
): UseMutationResult<PostItemUpdateResponse, QServerHookError, UpdateQueueItemBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.updateQueueItem(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueUpdateItemMutation,
        ...options,
    });
}

export type UseQueueRemoveItemMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemRemoveResponse,
    RemoveQueueItemBody | void,
    TContext
>;

/** Remove one item by uid or position. With no argument the server removes the back item. */
export function useQueueRemoveItemMutation<TContext = unknown>(
    options: UseQueueRemoveItemMutationOptions<TContext> = {},
): UseMutationResult<
    PostItemRemoveResponse,
    QServerHookError,
    RemoveQueueItemBody | void,
    TContext
> {
    return useQServerMutation({
        perform: (client, body, request) => client.removeQueueItem(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueRemoveItemMutation,
        ...options,
    });
}

export type UseQueueRemoveItemBatchMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemBatchResponse,
    RemoveQueueItemBatchBody,
    TContext
>;

/** Remove several items by uid. `ignore_missing` decides whether absent uids fail the call. */
export function useQueueRemoveItemBatchMutation<TContext = unknown>(
    options: UseQueueRemoveItemBatchMutationOptions<TContext> = {},
): UseMutationResult<PostItemBatchResponse, QServerHookError, RemoveQueueItemBatchBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.removeQueueItemBatch(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueRemoveItemBatchMutation,
        ...options,
    });
}

export type UseQueueMoveItemMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    PostItemAddResponse,
    MoveQueueItemBody,
    TContext
>;

/** Reposition one item, by `pos_dest`, `before_uid` or `after_uid`. */
export function useQueueMoveItemMutation<TContext = unknown>(
    options: UseQueueMoveItemMutationOptions<TContext> = {},
): UseMutationResult<PostItemAddResponse, QServerHookError, MoveQueueItemBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.moveQueueItem(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueMoveItemMutation,
        ...options,
    });
}

export type UseQueueMoveItemBatchMutationOptions<TContext = unknown> = QServerMutationHookOptions<
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
export function useQueueMoveItemBatchMutation<TContext = unknown>(
    options: UseQueueMoveItemBatchMutationOptions<TContext> = {},
): UseMutationResult<PostItemBatchResponse, QServerHookError, MoveQueueItemBatchBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.moveQueueItemBatch(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueMoveItemBatchMutation,
        ...options,
    });
}

export type UseQueueUploadSpreadsheetMutationOptions<TContext = unknown> =
    QServerMutationHookOptions<UploadSpreadsheetResponse, UploadSpreadsheetInput, TContext>;

/**
 * Upload a spreadsheet that a server-side function converts into queue items.
 *
 * Multipart, and not part of `QServerClientLike`.
 */
export function useQueueUploadSpreadsheetMutation<TContext = unknown>(
    options: UseQueueUploadSpreadsheetMutationOptions<TContext> = {},
): UseMutationResult<
    UploadSpreadsheetResponse,
    QServerHookError,
    UploadSpreadsheetInput,
    TContext
> {
    return useQServerMutation({
        perform: (client, input, request) => client.uploadQueueSpreadsheet(input, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueUploadSpreadsheetMutation,
        ...options,
    });
}

// #endregion

// #region queue control

export type UseQueueStartMutationOptions<TContext = unknown> = QServerMutationHookOptions<
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
export function useQueueStartMutation<TContext = unknown>(
    options: UseQueueStartMutationOptions<TContext> = {},
): UseMutationResult<QueueStartResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.startQueue(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueStartMutation,
        ...options,
    });
}

export type UseQueueStopMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    QServerSuccessResponse,
    void,
    TContext
>;

/** Stop the queue once the running plan finishes. Sets `queue_stop_pending`. */
export function useQueueStopMutation<TContext = unknown>(
    options: UseQueueStopMutationOptions<TContext> = {},
): UseMutationResult<QServerSuccessResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.stopQueue(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueStopMutation,
        ...options,
    });
}

export type UseQueueCancelStopMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    QServerSuccessResponse,
    void,
    TContext
>;

/** Cancel a pending stop request. */
export function useQueueCancelStopMutation<TContext = unknown>(
    options: UseQueueCancelStopMutationOptions<TContext> = {},
): UseMutationResult<QServerSuccessResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.cancelQueueStop(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueCancelStopMutation,
        ...options,
    });
}

export type UseQueueClearMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    QueueClearResponse,
    void,
    TContext
>;

/** Discard every queued item. Does not affect the running plan. */
export function useQueueClearMutation<TContext = unknown>(
    options: UseQueueClearMutationOptions<TContext> = {},
): UseMutationResult<QueueClearResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.clearQueue(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueClearMutation,
        ...options,
    });
}

export type UseQueueSetModeMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    QServerSuccessResponse,
    QueueModeSetBody,
    TContext
>;

/** Set loop mode and failure handling: `{ mode: { loop, ignore_failures } }`. */
export function useQueueSetModeMutation<TContext = unknown>(
    options: UseQueueSetModeMutationOptions<TContext> = {},
): UseMutationResult<QServerSuccessResponse, QServerHookError, QueueModeSetBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.setQueueMode(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueSetModeMutation,
        ...options,
    });
}

export type UseQueueSetAutostartMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    QServerSuccessResponse,
    QueueAutostartBody,
    TContext
>;

/** Start the queue automatically whenever an item is added: `{ enable: boolean }`. */
export function useQueueSetAutostartMutation<TContext = unknown>(
    options: UseQueueSetAutostartMutationOptions<TContext> = {},
): UseMutationResult<QServerSuccessResponse, QServerHookError, QueueAutostartBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.setQueueAutostart(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueSetAutostartMutation,
        ...options,
    });
}

// #endregion
