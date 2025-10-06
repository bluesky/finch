import { AddQueueItemBody, GetQueueResponse, GetHistoryResponse, GetStatusResponse, GetPlansAllowedResponse, GetDevicesAllowedResponse, PostItemAddResponse, ExecuteQueueItemBody, PostItemExecuteResponse, PostEnvironmentOpenResponse, GetQueueItemResponse, RemoveQueueItemBody, PostItemRemoveResponse } from '../types/apiTypes';
declare const getQSConsoleUrl: () => any;
declare const getQueue: (cb: (data: GetQueueResponse) => void, mock?: boolean) => Promise<void>;
declare const getQueueHistory: (cb: (data: GetHistoryResponse) => void, mock?: boolean) => Promise<void>;
declare const getStatus: (cb: (data: GetStatusResponse) => void, mock?: boolean) => Promise<void>;
declare const getPlansAllowed: (cb: (data: GetPlansAllowedResponse) => void, mock?: boolean) => Promise<void>;
declare const getDevicesAllowed: (cb: (data: GetDevicesAllowedResponse) => void, mock?: boolean) => Promise<void>;
declare const startRE: () => Promise<boolean>;
declare const postQueueItem: (body: AddQueueItemBody, cb: (data: PostItemAddResponse) => void, mock?: boolean) => Promise<"failed" | "success" | undefined>;
declare const executeItem: (body: ExecuteQueueItemBody, cb: (data: PostItemExecuteResponse) => void, mock?: boolean) => Promise<"failed" | "success" | undefined>;
declare const getQueueItem: (uid: string | undefined, cb: (data: GetQueueItemResponse) => void, mock?: boolean) => Promise<void>;
declare const deleteQueueItem: (body: RemoveQueueItemBody, cb: (data: PostItemRemoveResponse) => void, mock?: boolean) => Promise<"failed" | "success" | undefined>;
declare const openWorkerEnvironment: (cb?: (data: PostEnvironmentOpenResponse) => void, mock?: boolean) => Promise<boolean | undefined>;
export { getQueue, getStatus, getPlansAllowed, getDevicesAllowed, startRE, postQueueItem, getQueueItem, deleteQueueItem, getQueueHistory, executeItem, openWorkerEnvironment, getQSConsoleUrl };
//# sourceMappingURL=apiClient.d.ts.map