import type { HistoryItem } from '@/api/qServer/types/history';
import { historyItem } from '../factories/queueItem';

/**
 * Two completed plans, so history-rendering UI has something to show on first paint.
 *
 * Timestamps are fixed rather than relative to "now" — a fixture whose values change on every
 * reload makes visual diffs and snapshot tests noisy.
 */
export const defaultHistory: HistoryItem[] = [
    historyItem({
        name: 'count',
        itemUid: 'fixture-history-1',
        kwargs: { detectors: ['det1'], num: 5 },
        exitStatus: 'completed',
        runUids: ['70701cd4-80f8-4559-ae31-685ee8bd5e8f'],
        scanIds: [1],
        timeStart: 1_721_942_455,
        timeStop: 1_721_942_456,
    }),
    historyItem({
        name: 'scan',
        itemUid: 'fixture-history-2',
        kwargs: { detectors: ['det'], motor: 'motor', start: -1, stop: 1, num: 11 },
        exitStatus: 'completed',
        runUids: ['9c2f8f1a-1f0f-4c9a-9c5c-7c2a6f3a11bd'],
        scanIds: [2],
        timeStart: 1_721_942_500,
        timeStop: 1_721_942_512,
    }),
];

/** A failed run, used by the `errorQServer` scenario. */
export const failedHistoryItem: HistoryItem = historyItem({
    name: 'grid_scan',
    itemUid: 'fixture-history-3',
    args: [['motor1', -1, 1, 5, 'motor2', -1, 1, 5]],
    kwargs: { detectors: ['det'] },
    exitStatus: 'failed',
    runUids: ['4b3f1e2d-0a77-4a0e-9a3e-2b1c9d8e7f66'],
    scanIds: [3],
    timeStart: 1_721_942_600,
    timeStop: 1_721_942_603,
    msg: "Device 'det' timed out while reading.",
    traceback: [
        'Traceback (most recent call last):',
        '  File "/opt/bluesky/plans.py", line 88, in grid_scan',
        '    yield from bps.trigger_and_read(detectors)',
        "ophyd.utils.errors.WaitTimeoutError: Device 'det' timed out while reading.",
    ].join('\n'),
});
