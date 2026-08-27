import type { QueueItem } from '@/api/qServer/types/queue';
import { queueItem } from '../factories/queueItem';

/**
 * Three queued plans, one per default plan, with fixed uids.
 *
 * Uids are stable (`fixture-item-1` …) so a test can address an item without first reading the
 * queue, and so they never collide with the `sim-item-N` uids the simulator mints at runtime.
 */
export const defaultQueue: QueueItem[] = [
    queueItem({
        name: 'count',
        itemUid: 'fixture-item-1',
        kwargs: { detectors: ['det1', 'det2'], num: 10, delay: 1 },
    }),
    queueItem({
        name: 'scan',
        itemUid: 'fixture-item-2',
        kwargs: { detectors: ['det'], motor: 'motor', start: -1, stop: 1, num: 11 },
    }),
    queueItem({
        name: 'grid_scan',
        itemUid: 'fixture-item-3',
        args: [['motor1', -1, 1, 5, 'motor2', -1, 1, 5]],
        kwargs: { detectors: ['det'] },
    }),
];
