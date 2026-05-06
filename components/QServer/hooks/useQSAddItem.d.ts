import { CopiedPlan, ParameterInputDict } from '../types/types';
import { Plan, Device, PostItemAddResponse, ExecuteQueueItemBody, AddQueueItemBody } from '../../../api/qServer/types';
interface UseQSAddItemProps {
    copiedPlan?: CopiedPlan | null;
    isGlobalMetadataChecked?: boolean;
    globalMetadata?: {
        [key: string]: unknown;
    };
}
export declare function useQSAddItem({ copiedPlan, isGlobalMetadataChecked, globalMetadata }?: UseQSAddItemProps): {
    isExpanded: boolean;
    isSubmissionPopupOpen: boolean;
    submissionResponse: PostItemAddResponse;
    allowedPlans: Record<string, Plan>;
    allowedDevices: Record<string, Device>;
    activePlan: string | null;
    parameters: ParameterInputDict | null;
    body: AddQueueItemBody;
    positionInput: string;
    resetInputsTrigger: boolean;
    setActivePlan: import('../../../../node_modules/react').Dispatch<import('../../../../node_modules/react').SetStateAction<string | null>>;
    setParameters: import('../../../../node_modules/react').Dispatch<import('../../../../node_modules/react').SetStateAction<ParameterInputDict | null>>;
    handlePlanSelect: (plan: string) => void;
    handleSubmissionResponse: (response: PostItemAddResponse) => void;
    submitPlan: (body: AddQueueItemBody) => void;
    executePlan: (body: ExecuteQueueItemBody) => void;
    closeSubmissionPopup: (clearInputs?: boolean) => void;
    handleParameterRefreshClick: (activePlan: string | null) => void;
    handleExpandClick: () => void;
    handlePositionInputChange: (val: string) => void;
    updateBodyKwargs: (parameters: ParameterInputDict) => void;
    checkRequiredParameters: () => boolean;
};
export {};
//# sourceMappingURL=useQSAddItem.d.ts.map