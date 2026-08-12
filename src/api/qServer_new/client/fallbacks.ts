import type { ConsoleOutputUpdateBody, GetConsoleOutputUpdateResponse } from '../types/console';
import type { GetLockInfoResponse } from '../types/lock';
import type { GetQueueItemBody, GetQueueItemResponse } from '../types/queue';
import type { QServerApiClient } from './QServerApiClient';

/**
 * Browser substitutes for endpoints that read their arguments from a `GET` request body.
 *
 * Each one is a genuine round trip to a different endpoint, not a cache, and each returns
 * the same shape as the endpoint it stands in for. Where a field cannot be recovered it is
 * omitted rather than invented, and the client reports the substitution through
 * `onFallback` so a UI can label the result.
 */

/** `getQueueItem` → scan `/api/queue/get`. Also resolves `pos: 'front' | 'back' | index`. */
export async function getQueueItemViaQueueScan(
    client: QServerApiClient,
    body: GetQueueItemBody | undefined,
): Promise<GetQueueItemResponse> {
    const queue = await client.getQueue();
    const items = queue.items ?? [];

    if (body?.uid) {
        const match = items.find((item) => item.item_uid === body.uid);
        return match
            ? { success: true, msg: '', item: match }
            : {
                  success: false,
                  msg: `Failed to get an item: Item with UID '${body.uid}' is not in the queue.`,
                  item: {},
              };
    }

    const index = resolvePosition(body?.pos, items.length);
    const item = index === null ? undefined : items[index];
    return item
        ? { success: true, msg: '', item }
        : {
              success: false,
              msg: `Failed to get an item: position '${String(body?.pos ?? 'back')}' is out of range.`,
              item: {},
          };
}

function resolvePosition(pos: string | number | undefined, length: number): number | null {
    if (length === 0) return null;
    if (pos === undefined || pos === 'back') return length - 1;
    if (pos === 'front') return 0;
    const index = typeof pos === 'number' ? pos : Number.parseInt(pos, 10);
    if (Number.isNaN(index)) return null;
    const resolved = index < 0 ? length + index : index;
    return resolved >= 0 && resolved < length ? resolved : null;
}

/**
 * `getLockInfo` → the `lock` field of `/api/status`.
 *
 * Status carries the two booleans and the `lock_info_uid`, but not who holds the lock or
 * when it was taken, so those fields are absent from the reconstructed `lock_info`.
 */
export async function getLockInfoViaStatus(client: QServerApiClient): Promise<GetLockInfoResponse> {
    const status = await client.getStatus();
    return {
        success: true,
        msg: 'Reconstructed from /api/status; lock owner, time and note are unavailable.',
        lock_info: {
            environment: status.lock?.environment ?? false,
            queue: status.lock?.queue ?? false,
        },
        lock_info_uid: status.lock_info_uid,
    };
}

/**
 * `getConsoleOutputUpdate` → `/api/console_output` plus `/api/console_output/uid`.
 *
 * The real endpoint returns only the messages after `last_msg_uid`; this substitute cannot
 * do incremental delivery, so it returns the current buffer as a single message. Use
 * `useQServerConsoleSocket` for genuine live output.
 */
export async function getConsoleOutputUpdateViaPoll(
    client: QServerApiClient,
    body: ConsoleOutputUpdateBody | undefined,
): Promise<GetConsoleOutputUpdateResponse> {
    const [output, uid] = await Promise.all([
        client.getConsoleOutput(),
        client.getConsoleOutputUID(),
    ]);
    const unchanged = !!body?.last_msg_uid && body.last_msg_uid === uid.console_output_uid;
    return {
        success: true,
        msg: 'Reconstructed from /api/console_output; messages are not delivered incrementally.',
        last_msg_uid: uid.console_output_uid,
        console_output_msgs:
            unchanged || !output.text ? [] : [{ time: Date.now() / 1000, msg: output.text }],
    };
}
