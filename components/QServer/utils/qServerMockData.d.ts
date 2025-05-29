import { PostItemAddResponse, GetPlansAllowedResponse, GetDevicesAllowedResponse, GetHistoryResponse, GetStatusResponse, PostEnvironmentOpenResponse, PostItemExecuteResponse, PostItemRemoveResponse } from '../types/apiTypes';
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
export declare const sampleQueueData: {
    name: string;
    args: string[][];
    kwargs: {
        num: number;
        delay: number;
    };
    item_type: string;
    user: string;
    user_group: string;
    item_uid: string;
}[];
export declare const mockGetQueueResponse: {
    success: boolean;
    msg: string;
    items: {
        name: string;
        args: string[][];
        kwargs: {
            num: number;
            delay: number;
        };
        item_type: string;
        user: string;
        user_group: string;
        item_uid: string;
    }[];
    plan_queue_uid: string;
    running_item: {};
};
export declare const mockGetHistoryResponse: GetHistoryResponse;
export declare const mockGetStatusResponse: GetStatusResponse;
export declare const mockEnvironmentOpenResponse: PostEnvironmentOpenResponse;
export declare const mockRemoveQueueItemResponse: PostItemRemoveResponse;
//# sourceMappingURL=qServerMockData.d.ts.map