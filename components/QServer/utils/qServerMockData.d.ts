import { PostItemAddResponse, GetPlansAllowedResponse, GetDevicesAllowedResponse, GetHistoryResponse, GetStatusResponse, PostEnvironmentOpenResponse, PostItemExecuteResponse, PostItemRemoveResponse, GetRunsActiveResponse, GetQueueResponse, QueueItem } from '../../../api/qServer/types';
export declare const mockGetApiStatusResponse: GetStatusResponse;
export declare const mockGetRunsActiveResponse: GetRunsActiveResponse;
export declare const mockGetDevicesAllowedResponse: GetDevicesAllowedResponse;
export declare const mockGetPlansAllowedResponse: GetPlansAllowedResponse;
export declare const mockGetQueueItemResponse: {
    success: boolean;
    msg: string;
    item: {
        name: string;
        kwargs: {
            detectors: string[];
        };
        item_type: string;
        user: string;
        user_group: string;
        item_uid: string;
    };
};
export declare const mockDeleteQueueItemResponse: {
    success: boolean;
    msg: string;
    item: {
        name: string;
        kwargs: {
            detectors: string[];
            num: number;
        };
        item_type: string;
        user: string;
        user_group: string;
        item_uid: string;
    };
    qsize: number;
};
export declare const mockAddItemSuccessResponse: PostItemAddResponse;
export declare const mockAddItemSuccessArgsResponse: {
    success: boolean;
    msg: string;
    qsize: number;
    item: {
        name: string;
        args: string[][];
        item_type: string;
        user: string;
        user_group: string;
        item_uid: string;
    };
};
export declare const mockAddItemFailResponse: PostItemAddResponse;
export declare const mockExecuteItemResponse: PostItemExecuteResponse;
export declare const sampleQueueData: QueueItem[];
export declare const mockGetQueueResponse: GetQueueResponse;
export declare const mockGetHistoryResponse: GetHistoryResponse;
export declare const mockGetStatusResponse: GetStatusResponse;
export declare const mockEnvironmentOpenResponse: PostEnvironmentOpenResponse;
export declare const mockRemoveQueueItemResponse: PostItemRemoveResponse;
//# sourceMappingURL=qServerMockData.d.ts.map