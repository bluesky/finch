import type { GetWithBodyOptions, QServerRequestOptions } from '../types/common';
import { QSERVER_PATHS } from '../types/paths';
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
import type { QServerSuccessResponse } from '../types/common';
import { payloadAs, type QServerEndpointDescriptor } from '../types/registry';

export interface QServerQueueEndpoints {
    /** `GET /api/queue/get` — queue contents plus the currently running item. */
    getQueue(
        payload?: Record<string, unknown>,
        options?: GetWithBodyOptions<GetQueueResponse>,
    ): Promise<GetQueueResponse>;
    /**
     * `GET /api/queue/item/get` — one item by uid or position.
     *
     * Falls back to scanning `getQueue()` in browsers, which cannot send the request body
     * this endpoint reads its arguments from.
     */
    getQueueItem(
        body?: GetQueueItemBody,
        options?: GetWithBodyOptions<GetQueueItemResponse>,
    ): Promise<GetQueueItemResponse>;
    /** `POST /api/queue/item/add` — append or insert one item. */
    addQueueItem(
        body: AddQueueItemBody,
        options?: QServerRequestOptions,
    ): Promise<PostItemAddResponse>;
    /** `POST /api/queue/item/add/batch` — insert several items atomically. */
    addQueueItemBatch(
        body: AddQueueItemBatchBody,
        options?: QServerRequestOptions,
    ): Promise<PostItemBatchResponse>;
    /** `POST /api/queue/item/execute` — run one item immediately without queueing it. */
    executeQueueItem(
        body: ExecuteQueueItemBody,
        options?: QServerRequestOptions,
    ): Promise<PostItemExecuteResponse>;
    /** `POST /api/queue/item/update` — replace an existing item, matched by uid. */
    updateQueueItem(
        body: UpdateQueueItemBody,
        options?: QServerRequestOptions,
    ): Promise<PostItemUpdateResponse>;
    /** `POST /api/queue/item/remove` — remove one item by uid or position. */
    removeQueueItem(
        body?: RemoveQueueItemBody,
        options?: QServerRequestOptions,
    ): Promise<PostItemRemoveResponse>;
    /** `POST /api/queue/item/remove/batch` — remove several items by uid. */
    removeQueueItemBatch(
        body: RemoveQueueItemBatchBody,
        options?: QServerRequestOptions,
    ): Promise<PostItemBatchResponse>;
    /** `POST /api/queue/item/move` — reposition one item. */
    moveQueueItem(
        body: MoveQueueItemBody,
        options?: QServerRequestOptions,
    ): Promise<PostItemAddResponse>;
    /** `POST /api/queue/item/move/batch` — reposition several items. */
    moveQueueItemBatch(
        body: MoveQueueItemBatchBody,
        options?: QServerRequestOptions,
    ): Promise<PostItemBatchResponse>;
    /** `POST /api/queue/upload/spreadsheet` — multipart upload converted into plans. */
    uploadQueueSpreadsheet(
        input: UploadSpreadsheetInput,
        options?: QServerRequestOptions,
    ): Promise<UploadSpreadsheetResponse>;
    /** `POST /api/queue/start` — start executing the queue. */
    startQueue(options?: QServerRequestOptions): Promise<QueueStartResponse>;
    /** `POST /api/queue/stop` — stop after the running plan completes. */
    stopQueue(options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    /** `POST /api/queue/stop/cancel` — cancel a pending stop request. */
    cancelQueueStop(options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    /** `POST /api/queue/clear` — discard every queued item. */
    clearQueue(options?: QServerRequestOptions): Promise<QueueClearResponse>;
    /** `POST /api/queue/mode/set` — toggle loop mode and failure handling. */
    setQueueMode(
        body: QueueModeSetBody,
        options?: QServerRequestOptions,
    ): Promise<QServerSuccessResponse>;
    /** `POST /api/queue/autostart` — start the queue automatically when items arrive. */
    setQueueAutostart(
        body: QueueAutostartBody,
        options?: QServerRequestOptions,
    ): Promise<QServerSuccessResponse>;
}

const SAMPLE_PLAN = {
    name: 'count',
    args: [['det1']],
    kwargs: { num: 5, delay: 1 },
    item_type: 'plan',
};

export const queueEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 'queue.get',
        group: 'queue',
        method: 'GET',
        path: QSERVER_PATHS.queueGet,
        fn: 'getQueue',
        summary: 'Queue contents and running item.',
        payloadGet: true,
        browserSafe: true,
        call: (client, input) => client.getQueue(input.payload),
    },
    {
        id: 'queue.itemGet',
        group: 'queue',
        method: 'GET',
        path: QSERVER_PATHS.queueItemGet,
        fn: 'getQueueItem',
        summary: 'One queue item by uid or position.',
        payloadGet: true,
        browserSafe: true,
        hasFallback: true,
        sampleBody: { uid: '' },
        call: (client, input) => client.getQueueItem(input.payload),
    },
    {
        id: 'queue.itemAdd',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueItemAdd,
        fn: 'addQueueItem',
        summary: 'Add an item to the queue.',
        browserSafe: true,
        sampleBody: { item: SAMPLE_PLAN, pos: 'back' },
        call: (client, input) => client.addQueueItem(payloadAs<AddQueueItemBody>(input)),
    },
    {
        id: 'queue.itemAddBatch',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueItemAddBatch,
        fn: 'addQueueItemBatch',
        summary: 'Add several items at once.',
        browserSafe: true,
        sampleBody: { items: [SAMPLE_PLAN], pos: 'back' },
        call: (client, input) => client.addQueueItemBatch(payloadAs<AddQueueItemBatchBody>(input)),
    },
    {
        id: 'queue.itemExecute',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueItemExecute,
        fn: 'executeQueueItem',
        summary: 'Execute an item immediately without queueing it.',
        browserSafe: true,
        sampleBody: { item: SAMPLE_PLAN },
        call: (client, input) => client.executeQueueItem(payloadAs<ExecuteQueueItemBody>(input)),
    },
    {
        id: 'queue.itemUpdate',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueItemUpdate,
        fn: 'updateQueueItem',
        summary: 'Replace an existing item, matched by uid.',
        browserSafe: true,
        sampleBody: { item: { ...SAMPLE_PLAN, item_uid: '' }, replace: false },
        call: (client, input) => client.updateQueueItem(payloadAs<UpdateQueueItemBody>(input)),
    },
    {
        id: 'queue.itemRemove',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueItemRemove,
        fn: 'removeQueueItem',
        summary: 'Remove one item by uid or position.',
        browserSafe: true,
        destructive: true,
        sampleBody: { uid: '' },
        call: (client, input) => client.removeQueueItem(input.payload),
    },
    {
        id: 'queue.itemRemoveBatch',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueItemRemoveBatch,
        fn: 'removeQueueItemBatch',
        summary: 'Remove several items by uid.',
        browserSafe: true,
        destructive: true,
        sampleBody: { uids: [], ignore_missing: true },
        call: (client, input) =>
            client.removeQueueItemBatch(payloadAs<RemoveQueueItemBatchBody>(input)),
    },
    {
        id: 'queue.itemMove',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueItemMove,
        fn: 'moveQueueItem',
        summary: 'Reposition one item.',
        browserSafe: true,
        sampleBody: { uid: '', pos_dest: 'front' },
        call: (client, input) => client.moveQueueItem(payloadAs<MoveQueueItemBody>(input)),
    },
    {
        id: 'queue.itemMoveBatch',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueItemMoveBatch,
        fn: 'moveQueueItemBatch',
        summary: 'Reposition several items.',
        browserSafe: true,
        sampleBody: { uids: [], pos_dest: 'front', reorder: false },
        call: (client, input) =>
            client.moveQueueItemBatch(payloadAs<MoveQueueItemBatchBody>(input)),
    },
    {
        id: 'queue.uploadSpreadsheet',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueUploadSpreadsheet,
        fn: 'uploadQueueSpreadsheet',
        summary: 'Upload a spreadsheet converted into queue items.',
        browserSafe: true,
        multipart: true,
        call: (client, input) => {
            if (!input.file) throw new Error('Choose a spreadsheet file first.');
            const dataType = input.params?.data_type;
            return client.uploadQueueSpreadsheet({
                spreadsheet: input.file,
                fileName: input.file.name,
                ...(dataType ? { dataType } : {}),
            });
        },
    },
    {
        id: 'queue.start',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueStart,
        fn: 'startQueue',
        summary: 'Start executing the queue.',
        browserSafe: true,
        call: (client) => client.startQueue(),
    },
    {
        id: 'queue.stop',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueStop,
        fn: 'stopQueue',
        summary: 'Stop the queue after the running plan finishes.',
        browserSafe: true,
        call: (client) => client.stopQueue(),
    },
    {
        id: 'queue.stopCancel',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueStopCancel,
        fn: 'cancelQueueStop',
        summary: 'Cancel a pending stop request.',
        browserSafe: true,
        call: (client) => client.cancelQueueStop(),
    },
    {
        id: 'queue.clear',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueClear,
        fn: 'clearQueue',
        summary: 'Discard every queued item.',
        browserSafe: true,
        destructive: true,
        call: (client) => client.clearQueue(),
    },
    {
        id: 'queue.modeSet',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueModeSet,
        fn: 'setQueueMode',
        summary: 'Set loop mode and failure handling.',
        browserSafe: true,
        sampleBody: { mode: { loop: false, ignore_failures: false } },
        call: (client, input) => client.setQueueMode(payloadAs<QueueModeSetBody>(input)),
    },
    {
        id: 'queue.autostart',
        group: 'queue',
        method: 'POST',
        path: QSERVER_PATHS.queueAutostart,
        fn: 'setQueueAutostart',
        summary: 'Enable or disable queue autostart.',
        browserSafe: true,
        sampleBody: { enable: false },
        call: (client, input) => client.setQueueAutostart(payloadAs<QueueAutostartBody>(input)),
    },
];
