import { QSERVER_PATHS } from '@/api/qServer_new/types/paths';
import { QServerApiError } from '@/api/qServer_new/types/errors';
import type { QServerHttpMethod } from '@/api/qServer_new/types/errors';
import type { QServerClientLike } from '@/api/qServerRuntime/clientLike';
import type { QServerSim } from '../core/QServerSim';
import { handleRequest } from './handleRequest';

export interface QServerSimClient extends QServerClientLike {
    /** The simulator behind this client, for stories and tests to drive directly. */
    readonly sim: QServerSim;
}

/**
 * An in-memory queue-server client backed by a simulator.
 *
 * Implements `QServerClientLike`, so anything typed against that — including the runtime
 * provider — accepts it interchangeably with the real `QServerApiClient`. No request ever
 * leaves the page.
 *
 * ```ts
 * const sim = defaultQServer();
 * const client = createQServerSimClient(sim);
 * await client.getQueue();       // reads sim state
 * sim.advance(3000);             // drive time from the test or story
 * ```
 *
 * Errors are the real `QServerApiError`, so component error handling behaves identically under
 * the sim and against a live server.
 */
export function createQServerSimClient(sim: QServerSim): QServerSimClient {
    /**
     * Every method funnels through here, and through the same dispatcher the adapter uses.
     *
     * `body` is `object` rather than `Record<string, unknown>` because the typed request
     * interfaces have no index signature; the cast happens once, here at the boundary, exactly
     * where a real client would have serialized the body to JSON.
     */
    const call = async <T>(
        method: QServerHttpMethod,
        path: string,
        body?: object,
        query?: Record<string, string>,
    ): Promise<T> => {
        // Synchronous mutation first: latency must never delay the state change itself, or a
        // fake-timer test could observe a request that has "not happened yet".
        const response = handleRequest(sim, {
            method,
            path,
            body: (body ?? {}) as Record<string, unknown>,
            query: query ?? {},
        });

        const { latencyMs } = sim.getBehavior();
        if (latencyMs > 0) await sim.delay(latencyMs);

        if (response.status >= 400) {
            throw new QServerApiError({
                message: `${method} ${path} failed with ${response.status}`,
                method,
                path,
                status: response.status,
                responseBody: response.data,
            });
        }
        return response.data as T;
    };

    const get = <T>(path: string, body?: object) => call<T>('GET', path, body);
    const post = <T>(path: string, body?: object) => call<T>('POST', path, body);

    return {
        sim,

        // #region status
        ping: (payload) => get(QSERVER_PATHS.ping, payload),
        getRoot: (payload) => get(QSERVER_PATHS.root, payload),
        getStatus: (payload) => get(QSERVER_PATHS.status, payload),
        // #endregion

        // #region queue
        getQueue: (payload) => get(QSERVER_PATHS.queueGet, payload),
        getQueueItem: (body) => get(QSERVER_PATHS.queueItemGet, body),
        addQueueItem: (body) => post(QSERVER_PATHS.queueItemAdd, body),
        addQueueItemBatch: (body) => post(QSERVER_PATHS.queueItemAddBatch, body),
        executeQueueItem: (body) => post(QSERVER_PATHS.queueItemExecute, body),
        updateQueueItem: (body) => post(QSERVER_PATHS.queueItemUpdate, body),
        removeQueueItem: (body) => post(QSERVER_PATHS.queueItemRemove, body),
        removeQueueItemBatch: (body) => post(QSERVER_PATHS.queueItemRemoveBatch, body),
        moveQueueItem: (body) => post(QSERVER_PATHS.queueItemMove, body),
        startQueue: () => post(QSERVER_PATHS.queueStart),
        stopQueue: () => post(QSERVER_PATHS.queueStop),
        cancelQueueStop: () => post(QSERVER_PATHS.queueStopCancel),
        clearQueue: () => post(QSERVER_PATHS.queueClear),
        setQueueMode: (body) => post(QSERVER_PATHS.queueModeSet, body),
        setQueueAutostart: (body) => post(QSERVER_PATHS.queueAutostart, body),
        // #endregion

        // #region history
        getQueueHistory: (payload) => get(QSERVER_PATHS.historyGet, payload),
        clearHistory: () => post(QSERVER_PATHS.historyClear),
        // #endregion

        // #region environment
        openEnvironment: () => post(QSERVER_PATHS.environmentOpen),
        closeEnvironment: () => post(QSERVER_PATHS.environmentClose),
        destroyEnvironment: () => post(QSERVER_PATHS.environmentDestroy),
        // #endregion

        // #region run engine
        pauseRE: (body) => post(QSERVER_PATHS.rePause, body),
        resumeRE: (body) => post(QSERVER_PATHS.reResume, body),
        stopRE: (body) => post(QSERVER_PATHS.reStop, body),
        abortRE: (body) => post(QSERVER_PATHS.reAbort, body),
        haltRE: (body) => post(QSERVER_PATHS.reHalt, body),
        getRuns: (body) => post(QSERVER_PATHS.reRuns, body),
        getRunsActive: () => get(QSERVER_PATHS.reRunsActive),
        getRunsOpen: () => get(QSERVER_PATHS.reRunsOpen),
        getRunsClosed: () => get(QSERVER_PATHS.reRunsClosed),
        // #endregion

        // #region catalogs
        getPlansAllowed: (payload) => get(QSERVER_PATHS.plansAllowed, payload),
        getDevicesAllowed: (payload) => get(QSERVER_PATHS.devicesAllowed, payload),
        getPlansExisting: (payload) => get(QSERVER_PATHS.plansExisting, payload),
        getDevicesExisting: (payload) => get(QSERVER_PATHS.devicesExisting, payload),
        // #endregion

        // #region console
        getConsoleOutput: (payload) => get(QSERVER_PATHS.consoleOutput, payload),
        getConsoleOutputUID: () => get(QSERVER_PATHS.consoleOutputUid),
        getConsoleOutputUpdate: (payload) => get(QSERVER_PATHS.consoleOutputUpdate, payload),
        // #endregion

        // #region tasks
        getTaskStatus: (body) => get(QSERVER_PATHS.taskStatus, body),
        getTaskResult: (body) => get(QSERVER_PATHS.taskResult, body),
        // #endregion

        // #region lock
        lock: (body) => post(QSERVER_PATHS.lock, body),
        unlock: (body) => post(QSERVER_PATHS.unlock, body),
        getLockInfo: (payload) => get(QSERVER_PATHS.lockInfo, payload),
        // #endregion
    };
}
