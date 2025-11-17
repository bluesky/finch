import { useState, useEffect } from 'react';
import { getPlansAllowedPromise, executeItemPromise } from '../QServer/utils/apiClient';
import { PostItemAddResponse } from '../QServer/types/apiTypes';
import Button from '../Button';

type ExperimentExecutePlanButtonGenericProps = {
    planName: string;
    kwargs: { [key: string]: any };
    disabled?: boolean;
    className?: string;
    onSuccess?: (response: PostItemAddResponse) => void;
    onError?: (error: string) => void;
};

/**
 * Generic button component for executing any QServer plan
 * 
 * @param planName - The name of the plan to execute (e.g., 'count', 'scan')
 * @param kwargs - The keyword arguments object for the plan
 * @param disabled - Whether the button is disabled
 * @param className - Additional CSS classes
 * @param onSuccess - Callback for successful plan execution
 * @param onError - Callback for plan execution errors
 */
export default function ExperimentExecutePlanButtonGeneric({
    planName,
    kwargs,
    disabled = false,
    className = "",
    onSuccess,
    onError
}: ExperimentExecutePlanButtonGenericProps) {
    const [isPlanAvailable, setIsPlanAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        const checkPlanAvailability = async () => {
            try {
                const data = await getPlansAllowedPromise();
                setIsLoading(false);
                
                if (data.success && data.plans_allowed) {
                    const hasPlan = Object.keys(data.plans_allowed).includes(planName);
                    setIsPlanAvailable(hasPlan);
                    
                    if (!hasPlan) {
                        onError?.(`${planName} plan is not available in the allowed plans`);
                    }
                } else {
                    onError?.("Failed to fetch allowed plans");
                    setIsPlanAvailable(false);
                }
            } catch (error) {
                setIsLoading(false);
                setIsPlanAvailable(false);
                onError?.("Error fetching allowed plans");
                console.error("Error fetching plans:", error);
            }
        };

        checkPlanAvailability();
    }, [planName, onError]);

    const handleExecuteClick = async () => {
        if (!isPlanAvailable || isExecuting) return;

        setIsExecuting(true);

        const requestBody = {
            item: {
                name: planName,
                kwargs,
                item_type: "plan"
            }
        };

        try {
            const response = await executeItemPromise(requestBody);
            console.log("QServer execute response:", response);
            
            if (response.success) {
                onSuccess?.(response);
            } else {
                onError?.(response.msg || `Failed to execute ${planName} plan`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network error executing plan";
            onError?.(errorMessage);
            console.error("Error executing plan:", error);
        } finally {
            setIsExecuting(false);
        }
    };

    const getButtonText = () => {
        if (isLoading) return "Loading...";
        if (isExecuting) return "Executing...";
        if (!isPlanAvailable) return `${planName} Plan Unavailable`;
        return `Execute ${planName} Plan`;
    };

    const isButtonDisabled = () => {
        return disabled || isLoading || isExecuting || !isPlanAvailable;
    };

    return (
        <Button
            text={getButtonText()}
            cb={handleExecuteClick}
            disabled={isButtonDisabled()}
            styles={className}
        />
    );
}
