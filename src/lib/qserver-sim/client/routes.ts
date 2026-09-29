import { QSERVER_PATHS } from '@/api/qServer/types/paths';
import type { RunListOption } from '@/api/qServer/types/runEngine';
import type { QServerSim } from '../core/QServerSim';
import { deriveStatus } from '../core/status';

/** An HTTP-shaped request, already normalized (no origin, no query string in `path`). */
export interface SimRequest {
    method: 'GET' | 'POST' | 'DELETE';
    /** Path including the `/api/` prefix, e.g. `'/api/queue/get'`. */
    path: string;
    body: Record<string, unknown>;
    query: Record<string, string>;
}

export interface SimResponse {
    status: number;
    data: unknown;
}

export type SimRoute = (sim: QServerSim, request: SimRequest) => SimResponse;

function ok(data: unknown): SimResponse {
    return { status: 200, data };
}

/**
 * The simulator's HTTP surface, keyed by `` `${METHOD} ${path}` ``.
 *
 * Keyed by method and path rather than by the registry's endpoint id because the axios adapter
 * only ever sees those two things — an id-keyed table would need a reverse lookup per request.
 * `SIM_SUPPORTED_ENDPOINT_IDS` below keeps the two views in sync, and a test enforces it.
 */
export const SIM_ROUTES: Record<string, SimRoute> = {
    // #region status
    [`GET ${QSERVER_PATHS.ping}`]: (sim) => ok(deriveStatus(sim.getState())),
    [`GET ${QSERVER_PATHS.root}`]: (sim) => ok(deriveStatus(sim.getState())),
    [`GET ${QSERVER_PATHS.status}`]: (sim) => ok(deriveStatus(sim.getState())),
    // #endregion

    // #region queue reads
    [`GET ${QSERVER_PATHS.queueGet}`]: (sim) => {
        const state = sim.getState();
        return ok({
            success: true,
            msg: '',
            items: state.queue,
            plan_queue_uid: state.uids.plan_queue_uid,
            running_item: state.running ? state.running.item : {},
        });
    },
    [`GET ${QSERVER_PATHS.queueItemGet}`]: (sim, request) => ok(sim.getItem(request.body)),
    // #endregion

    // #region queue writes
    [`POST ${QSERVER_PATHS.queueItemAdd}`]: (sim, request) =>
        ok(sim.addItem(request.body as never)),
    [`POST ${QSERVER_PATHS.queueItemAddBatch}`]: (sim, request) =>
        ok(sim.addItemBatch(request.body as never)),
    [`POST ${QSERVER_PATHS.queueItemExecute}`]: (sim, request) =>
        ok(sim.executeItem(request.body as never)),
    [`POST ${QSERVER_PATHS.queueItemUpdate}`]: (sim, request) =>
        ok(sim.updateItem(request.body as never)),
    [`POST ${QSERVER_PATHS.queueItemRemove}`]: (sim, request) => ok(sim.removeItem(request.body)),
    [`POST ${QSERVER_PATHS.queueItemRemoveBatch}`]: (sim, request) =>
        ok(sim.removeItemBatch(request.body as never)),
    [`POST ${QSERVER_PATHS.queueItemMove}`]: (sim, request) => ok(sim.moveItem(request.body)),
    // #endregion

    // #region queue control
    [`POST ${QSERVER_PATHS.queueStart}`]: (sim) => ok(sim.startQueue()),
    [`POST ${QSERVER_PATHS.queueStop}`]: (sim) => ok(sim.stopQueue()),
    [`POST ${QSERVER_PATHS.queueStopCancel}`]: (sim) => ok(sim.cancelQueueStop()),
    [`POST ${QSERVER_PATHS.queueClear}`]: (sim) => ok(sim.clearQueue()),
    [`POST ${QSERVER_PATHS.queueModeSet}`]: (sim, request) =>
        ok(sim.setQueueMode((request.body.mode ?? {}) as never)),
    [`POST ${QSERVER_PATHS.queueAutostart}`]: (sim, request) =>
        ok(sim.setQueueAutostart(Boolean(request.body.enable))),
    // #endregion

    // #region history
    [`GET ${QSERVER_PATHS.historyGet}`]: (sim) => {
        const state = sim.getState();
        return ok({
            success: true,
            msg: '',
            items: state.history,
            plan_history_uid: state.uids.plan_history_uid,
        });
    },
    [`POST ${QSERVER_PATHS.historyClear}`]: (sim) => ok(sim.clearHistory()),
    // #endregion

    // #region environment
    [`POST ${QSERVER_PATHS.environmentOpen}`]: (sim) => ok(sim.openEnvironment()),
    [`POST ${QSERVER_PATHS.environmentClose}`]: (sim) => ok(sim.closeEnvironment()),
    [`POST ${QSERVER_PATHS.environmentDestroy}`]: (sim) => ok(sim.destroyEnvironment()),
    // #endregion

    // #region run engine
    [`POST ${QSERVER_PATHS.rePause}`]: (sim, request) =>
        ok(sim.pause((request.body.option as 'deferred' | 'immediate') ?? 'deferred')),
    [`POST ${QSERVER_PATHS.reResume}`]: (sim) => ok(sim.resume()),
    [`POST ${QSERVER_PATHS.reStop}`]: (sim) => ok(sim.stopRun()),
    [`POST ${QSERVER_PATHS.reAbort}`]: (sim) => ok(sim.abortRun()),
    [`POST ${QSERVER_PATHS.reHalt}`]: (sim) => ok(sim.haltRun()),
    [`POST ${QSERVER_PATHS.reRuns}`]: (sim, request) =>
        ok(sim.getRuns((request.body.option as RunListOption) ?? 'active')),
    [`GET ${QSERVER_PATHS.reRunsActive}`]: (sim) => ok(sim.getRuns('active')),
    [`GET ${QSERVER_PATHS.reRunsOpen}`]: (sim) => ok(sim.getRuns('open')),
    [`GET ${QSERVER_PATHS.reRunsClosed}`]: (sim) => ok(sim.getRuns('closed')),
    // #endregion

    // #region plans & devices
    [`GET ${QSERVER_PATHS.plansAllowed}`]: (sim) => {
        const state = sim.getState();
        return ok({
            success: true,
            msg: '',
            plans_allowed: state.plansAllowed,
            plans_allowed_uid: state.uids.plans_allowed_uid,
        });
    },
    [`GET ${QSERVER_PATHS.devicesAllowed}`]: (sim) => {
        const state = sim.getState();
        return ok({
            success: true,
            msg: '',
            devices_allowed: state.devicesAllowed,
            devices_allowed_uid: state.uids.devices_allowed_uid,
        });
    },
    [`GET ${QSERVER_PATHS.plansExisting}`]: (sim) => {
        const state = sim.getState();
        return ok({
            success: true,
            msg: '',
            plans_existing: state.plansAllowed,
            plans_existing_uid: state.uids.plans_existing_uid,
        });
    },
    [`GET ${QSERVER_PATHS.devicesExisting}`]: (sim) => {
        const state = sim.getState();
        return ok({
            success: true,
            msg: '',
            devices_existing: state.devicesAllowed,
            devices_existing_uid: state.uids.devices_existing_uid,
        });
    },
    // #endregion

    // #region console
    [`GET ${QSERVER_PATHS.consoleOutput}`]: (sim, request) =>
        ok({
            success: true,
            msg: '',
            text: sim.getConsoleText(
                typeof request.body.nlines === 'number' ? request.body.nlines : undefined,
            ),
        }),
    [`GET ${QSERVER_PATHS.consoleOutputUid}`]: (sim) =>
        ok({
            success: true,
            msg: '',
            console_output_uid: sim.getState().uids.console_output_uid,
        }),
    [`GET ${QSERVER_PATHS.consoleOutputUpdate}`]: (sim, request) =>
        ok(sim.getConsoleSince(request.body.last_msg_uid as string | undefined)),
    // #endregion

    // #region tasks
    [`GET ${QSERVER_PATHS.taskStatus}`]: (sim, request) => {
        const taskUid = String(request.body.task_uid ?? '');
        const task = sim.getState().tasks[taskUid];
        return ok({
            success: true,
            msg: '',
            task_uid: taskUid,
            status: task?.status ?? 'not_found',
        });
    },
    [`GET ${QSERVER_PATHS.taskResult}`]: (sim, request) => {
        const taskUid = String(request.body.task_uid ?? '');
        const task = sim.getState().tasks[taskUid];
        return ok({
            success: true,
            msg: '',
            task_uid: taskUid,
            status: task?.status ?? 'not_found',
            ...(task?.result ? { result: task.result } : {}),
        });
    },
    // #endregion

    // #region lock
    [`POST ${QSERVER_PATHS.lock}`]: (sim, request) => ok(sim.lock(request.body as never)),
    [`POST ${QSERVER_PATHS.unlock}`]: (sim, request) =>
        ok(sim.unlock(request.body.lock_key as string | undefined)),
    [`GET ${QSERVER_PATHS.lockInfo}`]: (sim) => ok(sim.getLockInfo()),
    // #endregion
};

/**
 * Registry ids the simulator implements — the same list `QServerClientLike` is built from.
 *
 * `dispatcher.test.ts` checks every id exists in `QSERVER_ENDPOINTS` and has a matching route,
 * so a regenerated OpenAPI spec that renames or drops an endpoint fails a test instead of
 * silently leaving a hole in the sim.
 */
export const SIM_SUPPORTED_ENDPOINT_IDS: readonly string[] = [
    'status.ping',
    'status.root',
    'status.status',
    'queue.get',
    'queue.itemGet',
    'queue.itemAdd',
    'queue.itemAddBatch',
    'queue.itemExecute',
    'queue.itemUpdate',
    'queue.itemRemove',
    'queue.itemRemoveBatch',
    'queue.itemMove',
    'queue.start',
    'queue.stop',
    'queue.stopCancel',
    'queue.clear',
    'queue.modeSet',
    'queue.autostart',
    'history.get',
    'history.clear',
    'environment.open',
    'environment.close',
    'environment.destroy',
    're.pause',
    're.resume',
    're.stop',
    're.abort',
    're.halt',
    're.runs',
    're.runsActive',
    're.runsOpen',
    're.runsClosed',
    'plansDevices.plansAllowed',
    'plansDevices.devicesAllowed',
    'plansDevices.plansExisting',
    'plansDevices.devicesExisting',
    'console.output',
    'console.outputUid',
    'console.outputUpdate',
    'tasks.status',
    'tasks.result',
    'lock.lock',
    'lock.unlock',
    'lock.info',
];
