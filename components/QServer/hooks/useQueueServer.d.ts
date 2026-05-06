import { GetHistoryResponse, GetQueueResponse, GetStatusResponse, RunningQueueItem } from '../../../api/qServer/types';
import { GlobalMetadata, CopiedPlan } from '../types/types';
export declare const useQueueServer: () => {
    currentQueue: GetQueueResponse | null;
    queueHistory: GetHistoryResponse | null;
    isREToggleOn: boolean;
    runningItem: RunningQueueItem | null;
    runEngineToggleRef: import('../../../../node_modules/react').MutableRefObject<boolean>;
    setIsREToggleOn: import('../../../../node_modules/react').Dispatch<import('../../../../node_modules/react').SetStateAction<boolean>>;
    handleQueueDataResponse: (res: GetQueueResponse) => void;
    handleQueueHistoryResponse: (res: GetHistoryResponse) => void;
    processConsoleMessage: (msg: string) => void;
    globalMetadata: GlobalMetadata;
    updateGlobalMetadata: (dict: GlobalMetadata) => void;
    removeDuplicateMetadata: (plan: CopiedPlan) => CopiedPlan;
    isGlobalMetadataChecked: boolean;
    handleGlobalMetadataCheckboxChange: (isChecked: boolean) => void;
    apiStatus: GetStatusResponse | null;
    refetchQueue: (options?: import('@tanstack/query-core').RefetchOptions) => Promise<import('@tanstack/query-core').QueryObserverResult<GetQueueResponse, Error>>;
    refetchHistory: (options?: import('@tanstack/query-core').RefetchOptions) => Promise<import('@tanstack/query-core').QueryObserverResult<GetHistoryResponse, Error>>;
    refetchStatus: (options?: import('@tanstack/query-core').RefetchOptions) => Promise<import('@tanstack/query-core').QueryObserverResult<GetStatusResponse, Error>>;
};
//# sourceMappingURL=useQueueServer.d.ts.map