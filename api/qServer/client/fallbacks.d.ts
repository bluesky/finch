import { ConsoleOutputUpdateBody, GetConsoleOutputUpdateResponse } from '../types/console';
import { GetLockInfoResponse } from '../types/lock';
import { GetQueueItemBody, GetQueueItemResponse } from '../types/queue';
import { QServerApiClient } from './QServerApiClient';
/**
 * Browser substitutes for endpoints that read their arguments from a `GET` request body.
 *
 * Each one is a genuine round trip to a different endpoint, not a cache, and each returns
 * the same shape as the endpoint it stands in for. Where a field cannot be recovered it is
 * omitted rather than invented, and the client reports the substitution through
 * `onFallback` so a UI can label the result.
 */
/** `getQueueItem` → scan `/api/queue/get`. Also resolves `pos: 'front' | 'back' | index`. */
export declare function getQueueItemViaQueueScan(client: QServerApiClient, body: GetQueueItemBody | undefined): Promise<GetQueueItemResponse>;
/**
 * `getLockInfo` → the `lock` field of `/api/status`.
 *
 * Status carries the two booleans and the `lock_info_uid`, but not who holds the lock or
 * when it was taken, so those fields are absent from the reconstructed `lock_info`.
 */
export declare function getLockInfoViaStatus(client: QServerApiClient): Promise<GetLockInfoResponse>;
/**
 * `getConsoleOutputUpdate` → `/api/console_output` plus `/api/console_output/uid`.
 *
 * The real endpoint returns only the messages after `last_msg_uid`; this substitute cannot
 * do incremental delivery, so it returns the current buffer as a single message. Use
 * `useQServerConsoleSocket` for genuine live output.
 */
export declare function getConsoleOutputUpdateViaPoll(client: QServerApiClient, body: ConsoleOutputUpdateBody | undefined): Promise<GetConsoleOutputUpdateResponse>;
//# sourceMappingURL=fallbacks.d.ts.map