import type { QServerSuccessResponse } from './common';

export interface PlanQueueMode {
    loop: boolean;
    ignore_failures: boolean;
}

/** Lock state as reported inside a status response. */
export interface StatusLockInfo {
    environment: boolean;
    queue: boolean;
}

/**
 * `GET /api/status`, and the identical payload returned by `/api/ping` and `/api/`.
 *
 * Note this one has no `success` field — the response *is* the status.
 */
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
    re_state: string | null;
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
    lock: StatusLockInfo;
}

/** `/api/ping` and `/api/` return the status payload verbatim. */
export type PingResponse = GetStatusResponse;

/** `GET /api/config/get` — server configuration, e.g. IPython kernel connection info. */
export interface GetConfigResponse extends QServerSuccessResponse {
    config: {
        ip_connect_info?: Record<string, unknown>;
        [key: string]: unknown;
    };
}
