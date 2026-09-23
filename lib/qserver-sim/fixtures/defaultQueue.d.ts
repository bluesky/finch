import { QueueItem } from '../../../api/qServer/types/queue';
/**
 * Three queued plans, one per default plan, with fixed uids.
 *
 * Uids are stable (`fixture-item-1` …) so a test can address an item without first reading the
 * queue, and so they never collide with the `sim-item-N` uids the simulator mints at runtime.
 */
export declare const defaultQueue: QueueItem[];
//# sourceMappingURL=defaultQueue.d.ts.map