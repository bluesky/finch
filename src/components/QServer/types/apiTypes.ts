interface PlanQueueMode {
    loop: boolean;
    ignore_failures: boolean;
}

interface LockInfo {
    environment: boolean;
    queue: boolean;
}

export interface GetStatusResponse {
    msg: string;
    items_in_queue: number;
    items_in_history: number;
    running_item_uid: string | null;
    manager_state: string;
    queue_stop_pending: boolean;
    queue_autostart_enabled: boolean;
    worker_environment_exists: boolean;
    worker_environment_state: string;
    worker_background_tasks: number;
    re_state: string;
    ip_kernel_state: string | null;
    ip_kernel_captured: string | boolean | null;
    pause_pending: boolean;
    run_list_uid: string;
    plan_queue_uid: string;
    plan_history_uid: string;
    devices_existing_uid: string;
    plans_existing_uid: string;
    devices_allowed_uid: string;
    plans_allowed_uid: string;
    plan_queue_mode: PlanQueueMode;
    task_results_uid: string;
    lock_info_uid: string;
    lock: LockInfo;
}

export interface PostItemRemoveResponse {
    success: boolean;
    msg: string;
    item: QueueItem;
    qsize: number;
}

export interface Component {
    is_readable: boolean;
    is_movable: boolean;
    is_flyable: boolean;
    classname: string;
    module: string;
    components?: { [key: string]: Component };
}

export interface Device {
    is_readable: boolean;
    is_movable: boolean;
    is_flyable: boolean;
    classname: string;
    module: string;
    components?: { [key: string]: Component };
}

export interface GetDevicesAllowedResponse {
    success: boolean;
    msg: string;
    devices_allowed: { [key: string]: Device };
    devices_allowed_uid: string;
}
//TO DO: verify what Parameter response looks like with enums so we can enforce better automatic checks for input types that are single enums vs multiple etc
export interface Parameter {
    name: string;
    kind: {
        name: string;
        value: number;
    };
    description?: string;
    default?: string | string[];
    convert_device_names?: boolean;
    default_defined_in_decorator?: boolean;
    annotation?: {
        type: string;
        devices?: { [key: string]: string[] };
        enums?: string[];
    };
    module?: string;
    min?: string;
    max?: string;
    step?: string;
    enums?: string[];
}

export interface Plan {
    name: string;
    properties: {
        is_generator: boolean;
    };
    parameters: Parameter[];
    module: string;
    description?: string;
}

export interface GetPlansAllowedResponse {
    success: boolean;
    msg: string;
    plans_allowed: { [key: string]: Plan };
    plans_allowed_uid: string;
}

//For now we are allowing the use of either kwargs or args. Ideally every plan on the qserver takes kwargs ONLY, but this requires implementation of the qserver which may be lab specific.
export interface BaseQueueItem {
    name: string;
    kwargs?: { [key: string]: any };
    args?: any[];
    item_type: string;
}

export interface QueueItem extends BaseQueueItem {
    user: string;
    user_group: string;
    item_uid: string;
}

export interface FailedQueueItem extends BaseQueueItem {   
}

export interface RunningQueueItem extends QueueItem {
    properties: {
        time_start: number;
    }
}

export interface ExecuteQueueItemBody {
    item: BaseQueueItem;
}

export interface AddQueueItemBody {
    item: BaseQueueItem
    pos: string | number;
}

export interface GetQueueItemResponse {
    msg: string;
    item: QueueItem;
    success: boolean;
}

export interface GetQueueResponse {
    success: boolean;
    msg: string;
    items: QueueItem[];
    plan_queue_uid: string;
    running_item: RunningQueueItem | {}; 
}

export interface Result {
    exit_status: string;
    run_uids: string[];
    scan_ids: number[];
    time_start: number;
    time_stop: number;
    msg: string;
    traceback: string;
}

export interface HistoryItem extends QueueItem {
    result: Result;
}

export interface GetHistoryResponse {
    success: boolean;
    msg: string;
    items: HistoryItem[];
    plan_history_uid: string;
}

export interface PostItemAddResponse {
    success: boolean;
    msg: string;
    item: QueueItem | FailedQueueItem;
    qsize: number | null;
}

export interface PostItemExecuteResponse extends PostItemAddResponse {}

export interface PostEnvironmentOpenResponse {
    success: boolean;
    msg: string;
}

export interface RemoveQueueItemBody {
    uid: string;
}

export interface PostItemRemoveResponse extends PostItemAddResponse {
    qsize: number;
};

export interface RunsActiveListItem {
    uid: string;
    scan_id: number;
    is_open: boolean;
    exit_status: string | null;
}
export interface GetRunsActiveResponse {
    success: boolean;
    msg: string;
    run_list: RunsActiveListItem[];
    run_list_uid: string;
}
