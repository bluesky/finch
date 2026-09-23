import { GetWithBodyOptions, QServerPayload, QServerRequestOptions } from '../types/common';
import { GetLockInfoResponse, LockBody, LockResponse, UnlockBody } from '../types/lock';
import { QServerEndpointDescriptor } from '../types/registry';
export interface QServerLockEndpoints {
    /** `POST /api/lock` — lock the environment and/or the queue with a key. */
    lock(body: LockBody, options?: QServerRequestOptions): Promise<LockResponse>;
    /** `POST /api/unlock` — release a lock using the same key. */
    unlock(body: UnlockBody, options?: QServerRequestOptions): Promise<LockResponse>;
    /**
     * `GET /api/lock/info` — full lock state.
     *
     * Requires a request body even when empty, so browsers fall back to the `lock` field
     * of `/api/status`, which carries the two booleans but none of the metadata.
     */
    getLockInfo(payload?: QServerPayload, options?: GetWithBodyOptions<GetLockInfoResponse>): Promise<GetLockInfoResponse>;
}
export declare const lockEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=lockEndpoints.d.ts.map