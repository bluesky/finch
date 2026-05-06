import { UseQueryOptions } from '@tanstack/react-query';
import { AddQueueItemBody, ExecuteQueueItemBody, RemoveQueueItemBody, GetQueueResponse, GetHistoryResponse, GetStatusResponse, GetPlansAllowedResponse, GetDevicesAllowedResponse, GetQueueItemResponse, GetRunsActiveResponse } from './types';
export declare function useQueueQuery(queryOptions?: Partial<UseQueryOptions<GetQueueResponse, Error, GetQueueResponse, string[]>>): import('@tanstack/react-query').UseQueryResult<GetQueueResponse, Error>;
export declare function useQueueHistoryQuery(queryOptions?: Partial<UseQueryOptions<GetHistoryResponse, Error, GetHistoryResponse, string[]>>): import('@tanstack/react-query').UseQueryResult<GetHistoryResponse, Error>;
export declare function useStatusQuery(queryOptions?: Partial<UseQueryOptions<GetStatusResponse, Error, GetStatusResponse, string[]>>): import('@tanstack/react-query').UseQueryResult<GetStatusResponse, Error>;
export declare function usePlansAllowedQuery(queryOptions?: Partial<UseQueryOptions<GetPlansAllowedResponse, Error, GetPlansAllowedResponse, string[]>>): import('@tanstack/react-query').UseQueryResult<GetPlansAllowedResponse, Error>;
export declare function useDevicesAllowedQuery(queryOptions?: Partial<UseQueryOptions<GetDevicesAllowedResponse, Error, GetDevicesAllowedResponse, string[]>>): import('@tanstack/react-query').UseQueryResult<GetDevicesAllowedResponse, Error>;
export declare function useQueueItemQuery(itemUid: string | undefined, queryOptions?: Partial<UseQueryOptions<GetQueueItemResponse, Error, GetQueueItemResponse, (string | undefined)[]>>): import('@tanstack/react-query').UseQueryResult<GetQueueItemResponse, Error>;
export declare function useRunsActiveQuery(queryOptions?: Partial<UseQueryOptions<GetRunsActiveResponse, Error, GetRunsActiveResponse, string[]>>): import('@tanstack/react-query').UseQueryResult<GetRunsActiveResponse, Error>;
export declare function useAddQueueItemMutation(): import('@tanstack/react-query').UseMutationResult<import('./types').PostItemAddResponse, Error, AddQueueItemBody, unknown>;
export declare function useExecuteQueueItemMutation(): import('@tanstack/react-query').UseMutationResult<import('./types').PostItemAddResponse, Error, ExecuteQueueItemBody, unknown>;
export declare function useRemoveQueueItemMutation(): import('@tanstack/react-query').UseMutationResult<import('./types').PostItemRemoveResponse, Error, RemoveQueueItemBody, unknown>;
export declare function useOpenEnvironmentMutation(): import('@tanstack/react-query').UseMutationResult<import('./types').PostEnvironmentOpenResponse, Error, void, unknown>;
export declare function useStartREMutation(): import('@tanstack/react-query').UseMutationResult<import('./types').PostREResponse, Error, void, unknown>;
export declare function usePauseREMutation(): import('@tanstack/react-query').UseMutationResult<import('./types').PostREResponse, Error, void, unknown>;
export declare function useResumeREMutation(): import('@tanstack/react-query').UseMutationResult<import('./types').PostREResponse, Error, void, unknown>;
export declare function useAbortREMutation(): import('@tanstack/react-query').UseMutationResult<import('./types').PostREResponse, Error, void, unknown>;
//# sourceMappingURL=hooks.d.ts.map