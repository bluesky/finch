import { HistoryItem } from '../../../api/qServer/types/history';
/**
 * Two completed plans, so history-rendering UI has something to show on first paint.
 *
 * Timestamps are fixed rather than relative to "now" — a fixture whose values change on every
 * reload makes visual diffs and snapshot tests noisy.
 */
export declare const defaultHistory: HistoryItem[];
/** A failed run, used by the `errorQServer` scenario. */
export declare const failedHistoryItem: HistoryItem;
//# sourceMappingURL=defaultHistory.d.ts.map