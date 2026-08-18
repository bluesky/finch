import type { QServerSuccessResponse } from './common';
import type { PlanQueueMode } from './status';

/** Metadata dictionary attached to a plan via its `md` kwarg. */
export interface MetadataKwarg {
    [key: string]: string;
}

/**
 * Plan keyword arguments.
 *
 * Ideally every plan on a queue server takes kwargs only, but that depends on how the
 * beamline defines its plans, so `args` remains supported alongside.
 */
export interface ArbitraryKwargs {
    [key: string]: unknown;
    md?: MetadataKwarg;
}

export interface BaseQueueItem {
    name: string;
    kwargs?: ArbitraryKwargs;
    args?: unknown[];
    /** `'plan'`, `'instruction'` or `'function'`. */
    item_type: string;
}

export interface QueueItem extends BaseQueueItem {
    user: string;
    user_group: string;
    item_uid: string;
}

/** An item rejected by validation comes back without the server-assigned fields. */
export type FailedQueueItem = BaseQueueItem;

export interface RunningQueueItem extends QueueItem {
    properties: {
        time_start: number;
    };
}

export interface GetQueueResponse extends QServerSuccessResponse {
    items: QueueItem[];
    plan_queue_uid: string;
    /** `{}` when nothing is running. */
    running_item: RunningQueueItem | Record<string, never>;
}

/** Address an item by uid or by position (`'front'`, `'back'`, or an index). */
export interface QueueItemAddress {
    uid?: string;
    pos?: string | number;
}

export type GetQueueItemBody = QueueItemAddress;

export interface GetQueueItemResponse extends QServerSuccessResponse {
    item: QueueItem | Record<string, never>;
}

export interface AddQueueItemBody {
    item: BaseQueueItem;
    pos?: string | number;
    before_uid?: string;
    after_uid?: string;
    user?: string;
    user_group?: string;
}

export interface AddQueueItemBatchBody {
    items: BaseQueueItem[];
    pos?: string | number;
    before_uid?: string;
    after_uid?: string;
    user?: string;
    user_group?: string;
}

export interface ExecuteQueueItemBody {
    item: BaseQueueItem;
    user?: string;
    user_group?: string;
}

export interface UpdateQueueItemBody {
    item: QueueItem;
    /** Replace the item and assign a new uid instead of updating it in place. */
    replace?: boolean;
    user?: string;
    user_group?: string;
}

export type RemoveQueueItemBody = QueueItemAddress;

export interface RemoveQueueItemBatchBody {
    uids: string[];
    ignore_missing?: boolean;
}

export interface MoveQueueItemBody extends QueueItemAddress {
    pos_dest?: string | number;
    before_uid?: string;
    after_uid?: string;
}

export interface MoveQueueItemBatchBody {
    uids: string[];
    pos_dest?: string | number;
    before_uid?: string;
    after_uid?: string;
    /** Preserve the order given in `uids` rather than the current queue order. */
    reorder?: boolean;
}

export interface PostItemAddResponse extends QServerSuccessResponse {
    item: QueueItem | FailedQueueItem;
    qsize: number | null;
}

export type PostItemExecuteResponse = PostItemAddResponse;
export type PostItemUpdateResponse = PostItemAddResponse;
export type PostItemRemoveResponse = PostItemAddResponse;

export interface PostItemBatchResponse extends QServerSuccessResponse {
    items: (QueueItem | FailedQueueItem)[];
    results: { success: boolean; msg: string }[];
    qsize: number | null;
}

export interface QueueModeSetBody {
    mode: Partial<PlanQueueMode>;
}

export interface QueueAutostartBody {
    enable: boolean;
}

export interface QueueStartResponse extends QServerSuccessResponse {
    qsize?: number;
}

export interface QueueClearResponse extends QServerSuccessResponse {
    qsize?: number;
}

/** Multipart upload of a spreadsheet that a server-side function converts into plans. */
export interface UploadSpreadsheetInput {
    spreadsheet: File | Blob;
    /** Selects the server-side conversion function, when several are configured. */
    dataType?: string;
    fileName?: string;
}

export interface UploadSpreadsheetResponse extends QServerSuccessResponse {
    items?: (QueueItem | FailedQueueItem)[];
    results?: { success: boolean; msg: string }[];
    qsize?: number | null;
}
