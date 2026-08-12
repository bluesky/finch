import type { GetWithBodyOptions, QServerPayload, QServerRequestOptions } from '../types/common';
import type { GetLockInfoResponse, LockBody, LockResponse, UnlockBody } from '../types/lock';
import { QSERVER_PATHS } from '../types/paths';
import { payloadAs, type QServerEndpointDescriptor } from '../types/registry';

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
    getLockInfo(
        payload?: QServerPayload,
        options?: GetWithBodyOptions<GetLockInfoResponse>,
    ): Promise<GetLockInfoResponse>;
}

export const lockEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 'lock.lock',
        group: 'lock',
        method: 'POST',
        path: QSERVER_PATHS.lock,
        fn: 'lock',
        summary: 'Lock the environment and/or queue.',
        browserSafe: true,
        destructive: true,
        sampleBody: { lock_key: 'finch-test', environment: true, note: 'manual test' },
        call: (client, input) => client.lock(payloadAs<LockBody>(input)),
    },
    {
        id: 'lock.unlock',
        group: 'lock',
        method: 'POST',
        path: QSERVER_PATHS.unlock,
        fn: 'unlock',
        summary: 'Release a lock.',
        browserSafe: true,
        sampleBody: { lock_key: 'finch-test' },
        call: (client, input) => client.unlock(payloadAs<UnlockBody>(input)),
    },
    {
        id: 'lock.info',
        group: 'lock',
        method: 'GET',
        path: QSERVER_PATHS.lockInfo,
        fn: 'getLockInfo',
        summary: 'Lock state (body required; browsers use the /api/status fallback).',
        payloadGet: true,
        bodyRequired: true,
        browserSafe: true,
        hasFallback: true,
        call: (client, input) => client.getLockInfo(input.payload),
    },
];
