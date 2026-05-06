import { AxiosInstance } from 'axios';
import { GetQueueResponse, GetHistoryResponse, GetStatusResponse, GetPlansAllowedResponse, GetDevicesAllowedResponse, GetQueueItemResponse, PostEnvironmentOpenResponse, PostREResponse, GetRunsActiveResponse, PostItemAddResponse, PostItemExecuteResponse, PostItemRemoveResponse, AddQueueItemBody, ExecuteQueueItemBody, RemoveQueueItemBody } from './types';
export declare function getQueue(client: AxiosInstance): Promise<GetQueueResponse>;
export declare function getQueueHistory(client: AxiosInstance): Promise<GetHistoryResponse>;
export declare function getStatus(client: AxiosInstance): Promise<GetStatusResponse>;
export declare function getPlansAllowed(client: AxiosInstance): Promise<GetPlansAllowedResponse>;
export declare function getDevicesAllowed(client: AxiosInstance): Promise<GetDevicesAllowedResponse>;
export declare function getQueueItem(client: AxiosInstance, itemUid: string): Promise<GetQueueItemResponse>;
export declare function openEnvironment(client: AxiosInstance): Promise<PostEnvironmentOpenResponse>;
export declare function addQueueItem(client: AxiosInstance, body: AddQueueItemBody): Promise<PostItemAddResponse>;
export declare function executeQueueItem(client: AxiosInstance, body: ExecuteQueueItemBody): Promise<PostItemExecuteResponse>;
export declare function removeQueueItem(client: AxiosInstance, body: RemoveQueueItemBody): Promise<PostItemRemoveResponse>;
export declare function getRunsActive(client: AxiosInstance): Promise<GetRunsActiveResponse>;
export declare function startRE(client: AxiosInstance): Promise<PostREResponse>;
export declare function pauseRE(client: AxiosInstance): Promise<PostREResponse>;
export declare function resumeRE(client: AxiosInstance): Promise<PostREResponse>;
export declare function abortRE(client: AxiosInstance): Promise<PostREResponse>;
//# sourceMappingURL=requests.d.ts.map