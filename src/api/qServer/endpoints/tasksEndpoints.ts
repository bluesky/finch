import type { GetWithBodyOptions } from '../types/common';
import { QSERVER_PATHS } from '../types/paths';
import { payloadAs, type QServerEndpointDescriptor } from '../types/registry';
import type { GetTaskResultResponse, GetTaskStatusResponse, TaskBody } from '../types/tasks';

/**
 * Both task endpoints are `GET`s that *require* a JSON body — a bodiless request is
 * rejected with 422 — so neither can be called from a browser, and no substitute exists
 * on this server version.
 */
export interface QServerTasksEndpoints {
    /** `GET /api/task/status` — `running`, `completed` or `not_found`. */
    getTaskStatus(
        body: TaskBody,
        options?: GetWithBodyOptions<GetTaskStatusResponse>,
    ): Promise<GetTaskStatusResponse>;
    /** `GET /api/task/result` — status plus the return value once complete. */
    getTaskResult(
        body: TaskBody,
        options?: GetWithBodyOptions<GetTaskResultResponse>,
    ): Promise<GetTaskResultResponse>;
}

export const tasksEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 'tasks.status',
        group: 'tasks',
        method: 'GET',
        path: QSERVER_PATHS.taskStatus,
        fn: 'getTaskStatus',
        summary: 'Status of a background task.',
        payloadGet: true,
        bodyRequired: true,
        browserSafe: false,
        sampleBody: { task_uid: '' },
        call: (client, input) => client.getTaskStatus(payloadAs<TaskBody>(input)),
    },
    {
        id: 'tasks.result',
        group: 'tasks',
        method: 'GET',
        path: QSERVER_PATHS.taskResult,
        fn: 'getTaskResult',
        summary: 'Result of a background task.',
        payloadGet: true,
        bodyRequired: true,
        browserSafe: false,
        sampleBody: { task_uid: '' },
        call: (client, input) => client.getTaskResult(payloadAs<TaskBody>(input)),
    },
];
