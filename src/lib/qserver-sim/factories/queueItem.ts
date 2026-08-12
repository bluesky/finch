import type { ArbitraryKwargs, QueueItem } from '@/api/qServer_new/types/queue';
import type { HistoryItem, Result } from '@/api/qServer_new/types/history';
import type { SimExitStatus } from '../core/types';

export interface QueueItemOptions {
    name: string;
    kwargs?: ArbitraryKwargs;
    args?: unknown[];
    /** `'plan'` (default), `'instruction'` or `'function'`. */
    itemType?: string;
    user?: string;
    userGroup?: string;
    /**
     * Item uid. Fixtures set it so tests can address items by a stable id; omit it when the
     * simulator should mint one (which it does for anything added at runtime).
     */
    itemUid?: string;
}

const DEFAULT_USER = 'UNAUTHENTICATED_SINGLE_USER';
const DEFAULT_USER_GROUP = 'primary';

/**
 * Build a queue item.
 *
 * ```ts
 * queueItem({ name: 'count', kwargs: { detectors: ['det1'], num: 5 } })
 * ```
 */
export function queueItem(options: QueueItemOptions): QueueItem {
    return {
        name: options.name,
        ...(options.args !== undefined ? { args: options.args } : {}),
        ...(options.kwargs !== undefined ? { kwargs: options.kwargs } : {}),
        item_type: options.itemType ?? 'plan',
        user: options.user ?? DEFAULT_USER,
        user_group: options.userGroup ?? DEFAULT_USER_GROUP,
        item_uid: options.itemUid ?? '',
    };
}

export interface HistoryItemOptions extends QueueItemOptions {
    /** Defaults to `'completed'`. */
    exitStatus?: SimExitStatus | string;
    runUids?: string[];
    scanIds?: (string | number)[];
    /** Unix seconds, like the server reports. */
    timeStart?: number;
    timeStop?: number;
    msg?: string;
    traceback?: string;
}

/**
 * Build a completed (or failed) history item.
 *
 * Timestamps default to fixed values rather than "now" so fixtures render identically on every
 * reload — a story that shows a changing timestamp on each refresh is noise.
 */
export function historyItem(options: HistoryItemOptions): HistoryItem {
    const timeStart = options.timeStart ?? 1_721_942_455;
    const result: Result = {
        exit_status: options.exitStatus ?? 'completed',
        run_uids: options.runUids ?? [],
        scan_ids: (options.scanIds ?? []) as string[] | number[],
        time_start: timeStart,
        time_stop: options.timeStop ?? timeStart + 1,
        msg: options.msg ?? '',
        traceback: options.traceback ?? '',
    };
    return { ...queueItem(options), result };
}
