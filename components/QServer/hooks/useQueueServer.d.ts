import { GetHistoryResponse, GetQueueResponse, RunningQueueItem } from '../types/apiTypes';
import { GlobalMetadata, PlanInput } from '../types/types';
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
    removeDuplicateMetadata: (plan: PlanInput) => PlanInput;
    isGlobalMetadataChecked: boolean;
    handleGlobalMetadataCheckboxChange: (isChecked: boolean) => void;
};
//# sourceMappingURL=useQueueServer.d.ts.map