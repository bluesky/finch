import { GetWithBodyOptions } from '../types/common';
import { QServerEndpointDescriptor } from '../types/registry';
import { GetTaskResultResponse, GetTaskStatusResponse, TaskBody } from '../types/tasks';
/**
 * Both task endpoints are `GET`s that *require* a JSON body — a bodiless request is
 * rejected with 422 — so neither can be called from a browser, and no substitute exists
 * on this server version.
 */
export interface QServerTasksEndpoints {
    /** `GET /api/task/status` — `running`, `completed` or `not_found`. */
    getTaskStatus(body: TaskBody, options?: GetWithBodyOptions<GetTaskStatusResponse>): Promise<GetTaskStatusResponse>;
    /** `GET /api/task/result` — status plus the return value once complete. */
    getTaskResult(body: TaskBody, options?: GetWithBodyOptions<GetTaskResultResponse>): Promise<GetTaskResultResponse>;
}
export declare const tasksEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=tasksEndpoints.d.ts.map