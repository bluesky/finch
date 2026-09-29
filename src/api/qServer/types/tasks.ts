import type { QServerSuccessResponse } from './common';

export interface TaskBody {
    task_uid: string;
}

export type TaskState = 'running' | 'completed' | 'not_found';

export interface GetTaskStatusResponse extends QServerSuccessResponse {
    task_uid: string;
    status: TaskState | string;
}

export interface GetTaskResultResponse extends QServerSuccessResponse {
    task_uid: string;
    status: TaskState | string;
    result?: {
        success?: boolean;
        msg?: string;
        return_value?: unknown;
        traceback?: string;
        time_start?: number;
        time_stop?: number;
        [key: string]: unknown;
    };
}
