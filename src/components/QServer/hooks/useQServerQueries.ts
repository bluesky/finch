import { useQuery } from '@tanstack/react-query';
import { getQueuePromise, getQueueHistoryPromise, getStatusPromise } from "../utils/apiClient";

const POLLING_INTERVAL = import.meta.env.VITE_QSERVER_POLLING_INTERVAL 
    ? parseInt(import.meta.env.VITE_QSERVER_POLLING_INTERVAL) 
    : 2000;

/**
 * Hook for querying the QServer queue data with polling
 */
export const useQueueQuery = () => {
    return useQuery({
        queryKey: ['qserver', 'queue'],
        queryFn: () => getQueuePromise(),
        refetchInterval: POLLING_INTERVAL,
        refetchIntervalInBackground: true,
        staleTime: 0,
    });
};

/**
 * Hook for querying the QServer queue history with polling
 */
export const useQueueHistoryQuery = () => {
    return useQuery({
        queryKey: ['qserver', 'history'],
        queryFn: () => getQueueHistoryPromise(),
        refetchInterval: POLLING_INTERVAL,
        refetchIntervalInBackground: true,
        staleTime: 0,
    });
};

/**
 * Hook for querying the QServer status with polling
 */
export const useStatusQuery = () => {
    return useQuery({
        queryKey: ['qserver', 'status'],
        queryFn: () => getStatusPromise(),
        refetchInterval: POLLING_INTERVAL,
        refetchIntervalInBackground: true,
        staleTime: 0,
    });
};
