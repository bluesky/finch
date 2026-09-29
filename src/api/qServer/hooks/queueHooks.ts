import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type {
    GetWithBodyOptions,
    QServerRequestOptions,
    QServerSuccessResponse,
} from '../types/common';
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
import type { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
import { useQServerQueryScope } from './useQServerClient';

/** Queue hooks: reading the queue, editing it, and controlling execution. */

// #region reads

/**
 * The queue contents plus the currently running item.
 *
 * `running_item` is `{}` when nothing is running — check for `item_uid` rather than truthiness.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetQuery<TData = GetQueueResponse>(
    queryOptions?: FinchQueryOptions<GetQueueResponse, TData, QServerQueryKeyFor<'queue'>>,
    requestOptions?: QServerRequestOptions,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.queue(scope),
        fetch: (client, request) => client.getQueue(undefined, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * One queue item, addressed by uid or position.
 *
 * In a browser this endpoint falls back to scanning `getQueue()`, because the real one reads its
 * arguments from a GET request body.
 *
 * @param body **Required.** Address the item by `uid`, or by `pos` (`'front'`, `'back'`, or an
 * index). Pass `undefined` — or an object with neither field — to hold the query idle until you have
 * an address; override with `queryOptions.enabled`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetItemQuery<TData = GetQueueItemResponse>(
    body: GetQueueItemBody | undefined,
    queryOptions?: FinchQueryOptions<GetQueueItemResponse, TData, QServerQueryKeyFor<'queueItem'>>,
    requestOptions?: GetWithBodyOptions<GetQueueItemResponse>,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.queueItem(scope, body),
        fetch: (client, request) => client.getQueueItem(body, request),
        requestOptions,
        queryOptions,
        defaultEnabled: body?.uid !== undefined || body?.pos !== undefined,
    });
}

// #endregion

// #region item writes

/**
 * Add one item to the queue.
 *
 * A rejected item resolves with `success: false` and `qsize: null` rather than throwing — the
 * server validates plan names and reports the failure in the envelope.
 *
 * @param mutationOptions TanStack options. The item itself goes to
 * `mutate({ item: { name, args, kwargs, item_type } })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueAddItemMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<PostItemAddResponse, AddQueueItemBody, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<PostItemAddResponse, QServerHookError, AddQueueItemBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.addQueueItem(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueAddItemMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Add several items at once. `results` reports per-item success.
 *
 * @param mutationOptions TanStack options. The items go to `mutate({ items })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueAddItemBatchMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<PostItemBatchResponse, AddQueueItemBatchBody, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<PostItemBatchResponse, QServerHookError, AddQueueItemBatchBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.addQueueItemBatch(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueAddItemBatchMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Run one item immediately, without placing it on the queue.
 *
 * @param mutationOptions TanStack options. The item goes to `mutate({ item })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueExecuteItemMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<PostItemExecuteResponse, ExecuteQueueItemBody, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<PostItemExecuteResponse, QServerHookError, ExecuteQueueItemBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.executeQueueItem(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueExecuteItemMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Replace an existing item, matched by its uid. `replace: true` mints a new uid.
 *
 * @param mutationOptions TanStack options. The replacement goes to `mutate({ item, replace })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueUpdateItemMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<PostItemUpdateResponse, UpdateQueueItemBody, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<PostItemUpdateResponse, QServerHookError, UpdateQueueItemBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.updateQueueItem(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueUpdateItemMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Remove one item by uid or position.
 *
 * @param mutationOptions TanStack options. Call `mutate({ uid })` or `mutate({ pos })`; with
 * `mutate()` the server removes the back item.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueRemoveItemMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        PostItemRemoveResponse,
        RemoveQueueItemBody | void,
        TContext
    >,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<
    PostItemRemoveResponse,
    QServerHookError,
    RemoveQueueItemBody | void,
    TContext
> {
    return useQServerMutation({
        perform: (client, body, request) => client.removeQueueItem(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueRemoveItemMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Remove several items by uid.
 *
 * @param mutationOptions TanStack options. `mutate({ uids, ignore_missing })` — `ignore_missing`
 * decides whether absent uids fail the call.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueRemoveItemBatchMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        PostItemBatchResponse,
        RemoveQueueItemBatchBody,
        TContext
    >,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<PostItemBatchResponse, QServerHookError, RemoveQueueItemBatchBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.removeQueueItemBatch(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueRemoveItemBatchMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Reposition one item.
 *
 * @param mutationOptions TanStack options. `mutate({ uid | pos, pos_dest | before_uid | after_uid })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueMoveItemMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<PostItemAddResponse, MoveQueueItemBody, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<PostItemAddResponse, QServerHookError, MoveQueueItemBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.moveQueueItem(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueMoveItemMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Reposition several items.
 *
 * Not part of `QServerClientLike`, so this rejects with `QServerEndpointUnavailableError` against a
 * partial injected client.
 *
 * @param mutationOptions TanStack options. `mutate({ uids, pos_dest | before_uid | after_uid })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueMoveItemBatchMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<PostItemBatchResponse, MoveQueueItemBatchBody, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<PostItemBatchResponse, QServerHookError, MoveQueueItemBatchBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.moveQueueItemBatch(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueMoveItemBatchMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Upload a spreadsheet that a server-side function converts into queue items.
 *
 * Multipart, and not part of `QServerClientLike`.
 *
 * @param mutationOptions TanStack options. `mutate({ file, fileName?, dataType?, userGroup? })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueUploadSpreadsheetMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        UploadSpreadsheetResponse,
        UploadSpreadsheetInput,
        TContext
    >,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<
    UploadSpreadsheetResponse,
    QServerHookError,
    UploadSpreadsheetInput,
    TContext
> {
    return useQServerMutation({
        perform: (client, input, request) => client.uploadQueueSpreadsheet(input, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueUploadSpreadsheetMutation,
        requestOptions,
        mutationOptions,
    });
}

// #endregion

// #region queue control

/**
 * Start executing the queue.
 *
 * Refuses with `success: false` when the environment is closed, the queue is empty, or the manager
 * is not idle.
 *
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueStartMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<QueueStartResponse, void, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<QueueStartResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.startQueue(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueStartMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Stop the queue once the running plan finishes. Sets `queue_stop_pending`.
 *
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueStopMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<QServerSuccessResponse, void, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<QServerSuccessResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.stopQueue(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueStopMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Cancel a pending stop request.
 *
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueCancelStopMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<QServerSuccessResponse, void, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<QServerSuccessResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.cancelQueueStop(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueCancelStopMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Discard every queued item. Does not affect the running plan.
 *
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueClearMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<QueueClearResponse, void, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<QueueClearResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.clearQueue(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueClearMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Set loop mode and failure handling.
 *
 * @param mutationOptions TanStack options. `mutate({ mode: { loop, ignore_failures } })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueSetModeMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<QServerSuccessResponse, QueueModeSetBody, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<QServerSuccessResponse, QServerHookError, QueueModeSetBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.setQueueMode(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueSetModeMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Start the queue automatically whenever an item is added.
 *
 * @param mutationOptions TanStack options. `mutate({ enable: boolean })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueSetAutostartMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<QServerSuccessResponse, QueueAutostartBody, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<QServerSuccessResponse, QServerHookError, QueueAutostartBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.setQueueAutostart(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueSetAutostartMutation,
        requestOptions,
        mutationOptions,
    });
}

// #endregion
