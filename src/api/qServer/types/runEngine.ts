import type { QServerSuccessResponse } from './common';

/** Run engine control endpoints return the plain success envelope. */
export type ReControlResponse = QServerSuccessResponse;

export interface RePauseBody {
    /** `'deferred'` pauses at the next checkpoint; `'immediate'` pauses at once. */
    option?: 'deferred' | 'immediate';
    lock_key?: string;
}

export interface ReResumeBody {
    lock_key?: string;
}

export type RunListOption = 'active' | 'open' | 'closed';

export interface GetRunsBody {
    option?: RunListOption;
}

export interface RunsActiveListItem {
    uid: string;
    scan_id: number;
    is_open: boolean;
    exit_status: string | null;
}

export interface GetRunsResponse extends QServerSuccessResponse {
    run_list: RunsActiveListItem[];
    run_list_uid: string;
}

/** Historically the only run-list response used in Finch. */
export type GetRunsActiveResponse = GetRunsResponse;

/**
 * `GET /api/re/metadata`.
 *
 * Not implemented by every RE Manager build — v0.0.19 answers 400
 * (`'REManagerAPI' object has no attribute 're_metadata'`).
 */
export interface GetReMetadataResponse extends QServerSuccessResponse {
    metadata?: Record<string, unknown>;
}
