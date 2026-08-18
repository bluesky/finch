import type { QServerSuccessResponse } from './common';

/** `open`, `close` and `destroy` all return the plain success envelope. */
export type EnvironmentResponse = QServerSuccessResponse;

export interface EnvironmentUpdateBody {
    /** Run the update as a background task and return a `task_uid` immediately. */
    run_in_background?: boolean;
    lock_key?: string;
}

export interface EnvironmentUpdateResponse extends QServerSuccessResponse {
    task_uid?: string;
}
