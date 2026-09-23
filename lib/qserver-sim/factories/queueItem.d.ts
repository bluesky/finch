import { ArbitraryKwargs, QueueItem } from '../../../api/qServer/types/queue';
import { HistoryItem } from '../../../api/qServer/types/history';
import { SimExitStatus } from '../core/types';
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
/**
 * Build a queue item.
 *
 * ```ts
 * queueItem({ name: 'count', kwargs: { detectors: ['det1'], num: 5 } })
 * ```
 */
export declare function queueItem(options: QueueItemOptions): QueueItem;
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
export declare function historyItem(options: HistoryItemOptions): HistoryItem;
//# sourceMappingURL=queueItem.d.ts.map