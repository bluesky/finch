import type { QServerSuccessResponse } from './common';

/**
 * Full lock state from `GET /api/lock/info`.
 *
 * `environment` and `queue` are the only fields the browser fallback (which reads
 * `/api/status`) can populate, so everything else is optional.
 */
export interface LockInfo {
    environment: boolean;
    queue: boolean;
    user?: string | null;
    time?: number | null;
    time_str?: string;
    note?: string | null;
    emergency_lock_key_is_set?: boolean;
}

export interface LockBody {
    /** Required. Any subsequent locked operation must present the same key. */
    lock_key: string;
    environment?: boolean;
    queue?: boolean;
    note?: string;
    user?: string;
}

export interface UnlockBody {
    lock_key: string;
}

export interface LockResponse extends QServerSuccessResponse {
    lock_info: LockInfo;
    lock_info_uid: string;
}

export type GetLockInfoResponse = LockResponse;
