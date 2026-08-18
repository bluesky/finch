import { AxiosInstance } from 'axios';
import {
    GetQueueResponse,
    GetHistoryResponse,
    GetStatusResponse,
    GetPlansAllowedResponse,
    GetDevicesAllowedResponse,
    GetQueueItemResponse,
    PostEnvironmentOpenResponse,
    PostREResponse,
    GetRunsActiveResponse,
    PostItemAddResponse,
    PostItemExecuteResponse,
    PostItemRemoveResponse,
    AddQueueItemBody,
    ExecuteQueueItemBody,
    RemoveQueueItemBody,
} from './types';

export async function getQueue(client: AxiosInstance): Promise<GetQueueResponse> {
    const response = await client.get<GetQueueResponse>('/queue/get');
    return response.data;
}

export async function getQueueHistory(client: AxiosInstance): Promise<GetHistoryResponse> {
    const response = await client.get<GetHistoryResponse>('/history/get');
    return response.data;
}

export async function getStatus(client: AxiosInstance): Promise<GetStatusResponse> {
    const response = await client.get<GetStatusResponse>('/status');
    return response.data;
}

export async function getPlansAllowed(client: AxiosInstance): Promise<GetPlansAllowedResponse> {
    const response = await client.get<GetPlansAllowedResponse>('/plans/allowed');
    return response.data;
}

export async function getDevicesAllowed(client: AxiosInstance): Promise<GetDevicesAllowedResponse> {
    const response = await client.get<GetDevicesAllowedResponse>('/devices/allowed');
    return response.data;
}

export async function getQueueItem(
    client: AxiosInstance,
    itemUid: string,
): Promise<GetQueueItemResponse> {
    const response = await client.get<GetQueueItemResponse>(`/queue/item/${itemUid}`);
    return response.data;
}

export async function openEnvironment(client: AxiosInstance): Promise<PostEnvironmentOpenResponse> {
    const response = await client.post<PostEnvironmentOpenResponse>('/environment/open');
    return response.data;
}

export async function addQueueItem(
    client: AxiosInstance,
    body: AddQueueItemBody,
): Promise<PostItemAddResponse> {
    const response = await client.post<PostItemAddResponse>('/queue/item/add', body);
    return response.data;
}

export async function executeQueueItem(
    client: AxiosInstance,
    body: ExecuteQueueItemBody,
): Promise<PostItemExecuteResponse> {
    const response = await client.post<PostItemExecuteResponse>('/queue/item/execute', body);
    return response.data;
}

export async function removeQueueItem(
    client: AxiosInstance,
    body: RemoveQueueItemBody,
): Promise<PostItemRemoveResponse> {
    const response = await client.post<PostItemRemoveResponse>('/queue/item/remove', body);
    return response.data;
}

export async function getRunsActive(client: AxiosInstance): Promise<GetRunsActiveResponse> {
    const response = await client.get<GetRunsActiveResponse>('/re/runs/active');
    return response.data;
}

export async function startRE(client: AxiosInstance): Promise<PostREResponse> {
    const response = await client.post<PostREResponse>('/queue/start', {});
    return response.data;
}

export async function pauseRE(client: AxiosInstance): Promise<PostREResponse> {
    const response = await client.post<PostREResponse>('/re/pause', {});
    return response.data;
}

export async function resumeRE(client: AxiosInstance): Promise<PostREResponse> {
    const response = await client.post<PostREResponse>('/re/resume', {});
    return response.data;
}

export async function abortRE(client: AxiosInstance): Promise<PostREResponse> {
    const response = await client.post<PostREResponse>('/re/abort', {});
    return response.data;
}
