import type { GetStatusResponse } from '@/api/qServer/types/status';
import type { QServerSimState } from './types';

/**
 * Build the `GET /api/status` payload from simulator state.
 *
 * Every field is *derived*, never stored twice — that is what keeps status honest as the state
 * machine grows. Two invariants are load-bearing for the existing UI:
 *
 * - `re_state` is `null` exactly when the environment is closed
 *   (`ContainerQServer.tsx` branches on both fields together).
 * - the `*_uid` fields come straight from `state.uids`, and only *transitions* bump those, so a
 *   run in progress does not make the UI refetch the queue on every tick.
 */
export function deriveStatus(state: QServerSimState): GetStatusResponse {
    const environmentExists = state.environmentState !== 'closed';

    return {
        msg: state.version,
        items_in_queue: state.queue.length,
        items_in_history: state.history.length,
        running_item_uid: state.running?.item.item_uid ?? null,
        manager_state: state.managerState,
        queue_stop_pending: state.queueStopPending,
        queue_autostart_enabled: state.queueAutostartEnabled,
        worker_environment_exists: environmentExists,
        worker_environment_state: state.environmentState,
        worker_background_tasks: Object.values(state.tasks).filter(
            (task) => task.status === 'running',
        ).length,
        re_state: environmentExists ? state.reState : null,
        // The sim has no IPython kernel; the real server reports 'disabled' in that case.
        ip_kernel_state: 'disabled',
        ip_kernel_captured: false,
        pause_pending: state.pausePending,
        run_list_uid: state.uids.run_list_uid,
        plan_queue_uid: state.uids.plan_queue_uid,
        plan_history_uid: state.uids.plan_history_uid,
        devices_existing_uid: state.uids.devices_existing_uid,
        plans_existing_uid: state.uids.plans_existing_uid,
        devices_allowed_uid: state.uids.devices_allowed_uid,
        plans_allowed_uid: state.uids.plans_allowed_uid,
        // A fresh object per call, so a caller mutating it cannot corrupt sim state.
        plan_queue_mode: { ...state.queueMode },
        task_results_uid: state.uids.task_results_uid,
        lock_info_uid: state.uids.lock_info_uid,
        lock: { environment: state.lock.environment, queue: state.lock.queue },
    };
}

/**
 * The keys `deriveStatus` produces.
 *
 * Kept beside the function so a field dropped in a refactor fails a test rather than silently
 * disappearing from every status response.
 */
export const STATUS_KEYS: readonly (keyof GetStatusResponse)[] = [
    'msg',
    'items_in_queue',
    'items_in_history',
    'running_item_uid',
    'manager_state',
    'queue_stop_pending',
    'queue_autostart_enabled',
    'worker_environment_exists',
    'worker_environment_state',
    'worker_background_tasks',
    're_state',
    'ip_kernel_state',
    'ip_kernel_captured',
    'pause_pending',
    'run_list_uid',
    'plan_queue_uid',
    'plan_history_uid',
    'devices_existing_uid',
    'plans_existing_uid',
    'devices_allowed_uid',
    'plans_allowed_uid',
    'plan_queue_mode',
    'task_results_uid',
    'lock_info_uid',
    'lock',
];
