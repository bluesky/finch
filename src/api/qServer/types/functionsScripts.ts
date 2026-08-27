import type { QServerSuccessResponse } from './common';
import type { BaseQueueItem } from './queue';

export interface ExecuteFunctionBody {
    /** A `function`-typed item, e.g. `{ name: 'function_sleep', kwargs: { time: 1 }, item_type: 'function' }`. */
    item: BaseQueueItem;
    run_in_background?: boolean;
    user?: string;
    user_group?: string;
    lock_key?: string;
}

/**
 * Both of these start a background task and return its uid.
 *
 * The result must then be collected with `getTaskResult`, which is a payload-bearing GET
 * and therefore unreachable from a browser on this server version.
 */
export interface TaskStartedResponse extends QServerSuccessResponse {
    task_uid: string;
    item?: BaseQueueItem;
}

export type ExecuteFunctionResponse = TaskStartedResponse;

export interface UploadScriptBody {
    /** Python source executed in the worker namespace. */
    script: string;
    /** Re-generate the lists of existing plans and devices afterwards. Default true. */
    update_lists?: boolean;
    /** Allow the script to replace the Run Engine. Default false. */
    update_re?: boolean;
    run_in_background?: boolean;
    lock_key?: string;
}

export type UploadScriptResponse = TaskStartedResponse;
