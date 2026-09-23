import { GetWithBodyOptions, QServerRequestOptions, QServerSuccessResponse } from '../types/common';
import { AddQueueItemBatchBody, AddQueueItemBody, ExecuteQueueItemBody, GetQueueItemBody, GetQueueItemResponse, GetQueueResponse, MoveQueueItemBatchBody, MoveQueueItemBody, PostItemAddResponse, PostItemBatchResponse, PostItemExecuteResponse, PostItemRemoveResponse, PostItemUpdateResponse, QueueAutostartBody, QueueClearResponse, QueueModeSetBody, QueueStartResponse, RemoveQueueItemBatchBody, RemoveQueueItemBody, UpdateQueueItemBody, UploadSpreadsheetInput, UploadSpreadsheetResponse } from '../types/queue';
import { QServerEndpointDescriptor } from '../types/registry';
export interface QServerQueueEndpoints {
    /** `GET /api/queue/get` — queue contents plus the currently running item. */
    getQueue(payload?: Record<string, unknown>, options?: GetWithBodyOptions<GetQueueResponse>): Promise<GetQueueResponse>;
    /**
     * `GET /api/queue/item/get` — one item by uid or position.
     *
     * Falls back to scanning `getQueue()` in browsers, which cannot send the request body
     * this endpoint reads its arguments from.
     */
    getQueueItem(body?: GetQueueItemBody, options?: GetWithBodyOptions<GetQueueItemResponse>): Promise<GetQueueItemResponse>;
    /** `POST /api/queue/item/add` — append or insert one item. */
    addQueueItem(body: AddQueueItemBody, options?: QServerRequestOptions): Promise<PostItemAddResponse>;
    /** `POST /api/queue/item/add/batch` — insert several items atomically. */
    addQueueItemBatch(body: AddQueueItemBatchBody, options?: QServerRequestOptions): Promise<PostItemBatchResponse>;
    /** `POST /api/queue/item/execute` — run one item immediately without queueing it. */
    executeQueueItem(body: ExecuteQueueItemBody, options?: QServerRequestOptions): Promise<PostItemExecuteResponse>;
    /** `POST /api/queue/item/update` — replace an existing item, matched by uid. */
    updateQueueItem(body: UpdateQueueItemBody, options?: QServerRequestOptions): Promise<PostItemUpdateResponse>;
    /** `POST /api/queue/item/remove` — remove one item by uid or position. */
    removeQueueItem(body?: RemoveQueueItemBody, options?: QServerRequestOptions): Promise<PostItemRemoveResponse>;
    /** `POST /api/queue/item/remove/batch` — remove several items by uid. */
    removeQueueItemBatch(body: RemoveQueueItemBatchBody, options?: QServerRequestOptions): Promise<PostItemBatchResponse>;
    /** `POST /api/queue/item/move` — reposition one item. */
    moveQueueItem(body: MoveQueueItemBody, options?: QServerRequestOptions): Promise<PostItemAddResponse>;
    /** `POST /api/queue/item/move/batch` — reposition several items. */
    moveQueueItemBatch(body: MoveQueueItemBatchBody, options?: QServerRequestOptions): Promise<PostItemBatchResponse>;
    /** `POST /api/queue/upload/spreadsheet` — multipart upload converted into plans. */
    uploadQueueSpreadsheet(input: UploadSpreadsheetInput, options?: QServerRequestOptions): Promise<UploadSpreadsheetResponse>;
    /** `POST /api/queue/start` — start executing the queue. */
    startQueue(options?: QServerRequestOptions): Promise<QueueStartResponse>;
    /** `POST /api/queue/stop` — stop after the running plan completes. */
    stopQueue(options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    /** `POST /api/queue/stop/cancel` — cancel a pending stop request. */
    cancelQueueStop(options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    /** `POST /api/queue/clear` — discard every queued item. */
    clearQueue(options?: QServerRequestOptions): Promise<QueueClearResponse>;
    /** `POST /api/queue/mode/set` — toggle loop mode and failure handling. */
    setQueueMode(body: QueueModeSetBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    /** `POST /api/queue/autostart` — start the queue automatically when items arrive. */
    setQueueAutostart(body: QueueAutostartBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
}
export declare const queueEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=queueEndpoints.d.ts.map