import { cn } from "@/lib/utils";
import QSParameterInput from "../QServer/QSParameterInput";
import { useQSAddItem } from "../QServer/hooks/useQSAddItem";
import ExperimentPlanSettingsForm from "./ExperimentPlanSettingsForm";
import { useMemo, useEffect } from "react";
import { CopiedPlan } from "../QServer/types/types";

const globalMetadata = {};
type ExperimentPlanSettingsProps = {
    copiedPlan?: null | CopiedPlan,
    isGlobalMetadataChecked?: boolean,
    globalMetadata?: { [key: string]: string },
    className?: string,
    formClassName?: string,
    formItemClassName?: string,
    showSelectPlanDropdown?: boolean,
    plan?: string,
};
export default function ExperimentPlanSettings({
    copiedPlan=null,
    isGlobalMetadataChecked,
    globalMetadata,
    className,
    formClassName,
    formItemClassName,
    showSelectPlanDropdown = true,
    plan,
}: ExperimentPlanSettingsProps) {
    // Memoize static props to prevent recreating objects on every render
    const staticProps = useMemo(() => ({
        copiedPlan: null,
        isGlobalMetadataChecked: false,
        globalMetadata: {}
    }), []);
    
    const {
        // State
        isExpanded,
        isSubmissionPopupOpen,
        submissionResponse,
        allowedPlans,
        allowedDevices,
        activePlan,
        parameters,
        body,
        positionInput,
        resetInputsTrigger,
        
        // State setters
        setActivePlan,
        setParameters,
        
        // Handlers
        handlePlanSelect,
        handleSubmissionResponse,
        submitPlan,
        executePlan,
        closeSubmissionPopup,
        handleParameterRefreshClick,
        handleExpandClick,
        handlePositionInputChange,
        updateBodyKwargs,
        checkRequiredParameters,
    } = useQSAddItem({globalMetadata, isGlobalMetadataChecked, copiedPlan, defaultSelectedPlan: plan});
    
    console.log({allowedPlans});


    return (
        <div className="w-fit min-w-0 bg-white">
            { showSelectPlanDropdown &&
                <div className="mb-4">
                    <label htmlFor="plan-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Plan:
                    </label>
                    <select 
                        id="plan-select"
                        value={activePlan || ''}
                        onChange={(e) => handlePlanSelect(e.target.value)}
                        className="w-fit px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="">-- Select a plan --</option>
                        {allowedPlans && Object.keys(allowedPlans).map((planName) => (
                            <option key={planName} value={planName}>
                                {allowedPlans[planName].name}
                            </option>
                        ))}
                    </select>
                </div>
            }
            <ExperimentPlanSettingsForm
                allowedPlans={allowedPlans}
                allowedDevices={allowedDevices}
                activePlan={activePlan}
                parameters={parameters}
                resetInputsTrigger={resetInputsTrigger}
                setParameters={setParameters}
                updateBodyKwargs={updateBodyKwargs}
                formItemClassName={formItemClassName}
                formClassName={formClassName}
                globalMetadata={globalMetadata}
            />
        </div>
    );
}