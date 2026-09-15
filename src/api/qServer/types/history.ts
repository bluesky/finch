import type { QServerSuccessResponse } from './common';
import type { QueueItem } from './queue';

/** Outcome recorded for a completed plan. */
export interface Result {
    exit_status: string;
    run_uids: string[];
    scan_ids: string[] | number[];
    time_start: number;
    time_stop: number;
    msg: string;
    traceback: string;
}

export interface HistoryItem extends QueueItem {
    result: Result;
}

export interface GetHistoryResponse extends QServerSuccessResponse {
    items: HistoryItem[];
    plan_history_uid: string;
}

export interface ClearHistoryResponse extends QServerSuccessResponse {
    plan_history_uid?: string;
}
