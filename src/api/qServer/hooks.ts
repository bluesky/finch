import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useQueueServerApiUrls } from 'src/utils/apiUtils';
import { createQServerApiClient } from './client';
import * as requests from './requests';
import {
    AddQueueItemBody,
    ExecuteQueueItemBody,
    RemoveQueueItemBody,
    GetQueueResponse,
    GetHistoryResponse,
    GetStatusResponse,
    GetPlansAllowedResponse,
    GetDevicesAllowedResponse,
    GetQueueItemResponse,
    GetRunsActiveResponse,
} from './types';

function useQServerClient() {
    const { httpBaseUrl, apiKey } = useQueueServerApiUrls();

    return useMemo(() => {
        return createQServerApiClient({
            baseURL: httpBaseUrl,
            apiKey,
        });
    }, [httpBaseUrl, apiKey]);
}

export function useQueueQuery(
    queryOptions?: Partial<UseQueryOptions<GetQueueResponse, Error, GetQueueResponse, string[]>>,
) {
    const client = useQServerClient();

    return useQuery({
        queryKey: ['qserver', 'queue'],
        queryFn: () => requests.getQueue(client),
        ...queryOptions,
    });
}

export function useQueueHistoryQuery(
    queryOptions?: Partial<
        UseQueryOptions<GetHistoryResponse, Error, GetHistoryResponse, string[]>
    >,
) {
    const client = useQServerClient();

    return useQuery({
        queryKey: ['qserver', 'history'],
        queryFn: () => requests.getQueueHistory(client),
        ...queryOptions,
    });
}

export function useStatusQuery(
    queryOptions?: Partial<UseQueryOptions<GetStatusResponse, Error, GetStatusResponse, string[]>>,
) {
    const client = useQServerClient();

    return useQuery({
        queryKey: ['qserver', 'status'],
        queryFn: () => requests.getStatus(client),
        ...queryOptions,
    });
}

export function usePlansAllowedQuery(
    queryOptions?: Partial<
        UseQueryOptions<GetPlansAllowedResponse, Error, GetPlansAllowedResponse, string[]>
    >,
) {
    const client = useQServerClient();

    return useQuery({
        queryKey: ['qserver', 'plansAllowed'],
        queryFn: () => requests.getPlansAllowed(client),
        ...queryOptions,
    });
}

export function useDevicesAllowedQuery(
    queryOptions?: Partial<
        UseQueryOptions<GetDevicesAllowedResponse, Error, GetDevicesAllowedResponse, string[]>
    >,
) {
    const client = useQServerClient();

    return useQuery({
        queryKey: ['qserver', 'devicesAllowed'],
        queryFn: () => requests.getDevicesAllowed(client),
        ...queryOptions,
    });
}

export function useQueueItemQuery(
    itemUid: string | undefined,
    queryOptions?: Partial<
        UseQueryOptions<GetQueueItemResponse, Error, GetQueueItemResponse, (string | undefined)[]>
    >,
) {
    const client = useQServerClient();

    return useQuery({
        queryKey: ['qserver', 'queueItem', itemUid],
        queryFn: () => requests.getQueueItem(client, itemUid as string),
        enabled: !!itemUid,
        ...queryOptions,
    });
}

export function useRunsActiveQuery(
    queryOptions?: Partial<
        UseQueryOptions<GetRunsActiveResponse, Error, GetRunsActiveResponse, string[]>
    >,
) {
    const client = useQServerClient();

    return useQuery({
        queryKey: ['qserver', 'runsActive'],
        queryFn: () => requests.getRunsActive(client),
        ...queryOptions,
    });
}

export function useAddQueueItemMutation() {
    const client = useQServerClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: AddQueueItemBody) => requests.addQueueItem(client, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qserver', 'queue'] });
            queryClient.invalidateQueries({ queryKey: ['qserver', 'history'] });
        },
    });
}

export function useExecuteQueueItemMutation() {
    const client = useQServerClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: ExecuteQueueItemBody) => requests.executeQueueItem(client, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qserver', 'queue'] });
            queryClient.invalidateQueries({ queryKey: ['qserver', 'status'] });
            queryClient.invalidateQueries({ queryKey: ['qserver', 'runsActive'] });
        },
    });
}

export function useRemoveQueueItemMutation() {
    const client = useQServerClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: RemoveQueueItemBody) => requests.removeQueueItem(client, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qserver', 'queue'] });
            queryClient.invalidateQueries({ queryKey: ['qserver', 'history'] });
        },
    });
}

export function useOpenEnvironmentMutation() {
    const client = useQServerClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => requests.openEnvironment(client),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qserver', 'status'] });
        },
    });
}

export function useStartREMutation() {
    const client = useQServerClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => requests.startRE(client),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qserver', 'status'] });
            queryClient.invalidateQueries({ queryKey: ['qserver', 'queue'] });
        },
    });
}

export function usePauseREMutation() {
    const client = useQServerClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => requests.pauseRE(client),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qserver', 'status'] });
        },
    });
}

export function useResumeREMutation() {
    const client = useQServerClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => requests.resumeRE(client),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qserver', 'status'] });
        },
    });
}

export function useAbortREMutation() {
    const client = useQServerClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => requests.abortRE(client),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qserver', 'status'] });
            queryClient.invalidateQueries({ queryKey: ['qserver', 'queue'] });
            queryClient.invalidateQueries({ queryKey: ['qserver', 'runsActive'] });
        },
    });
}
