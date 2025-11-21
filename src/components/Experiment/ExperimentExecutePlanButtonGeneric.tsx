import { useState, useEffect } from 'react';
import { getPlansAllowedPromise, executeItemPromise, getQueuePromise } from '../QServer/utils/apiClient';
import { PostItemAddResponse, GetQueueResponse } from '../QServer/types/apiTypes';
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
    const [isQueueServerBusy, setIsQueueServerBusy] = useState(false);

    // Polling interval setup - matching the QServer hook pattern
    const pollingInterval = import.meta.env.VITE_QSERVER_POLLING_INTERVAL ? 
        parseInt(import.meta.env.VITE_QSERVER_POLLING_INTERVAL) : 2000;

    // Check for running plans in queue server
    const checkQueueStatus = async () => {
        try {
            const queueData = await getQueuePromise();
            if (queueData.success) {
                // Check if there's a running item by examining if running_item has properties
                const hasRunningItem = queueData.running_item && 
                    Object.keys(queueData.running_item).length > 0;
                setIsQueueServerBusy(hasRunningItem);
            }
        } catch (error) {
            console.error('Error checking queue status:', error);
        }
    };

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
        
        // Start polling for queue status
        checkQueueStatus();
        const queueInterval = setInterval(checkQueueStatus, pollingInterval);

        return () => {
            clearInterval(queueInterval);
        };
    }, [planName, onError, pollingInterval]);

    const handleExecuteClick = async () => {
        if (!isPlanAvailable || isExecuting || isQueueServerBusy) return;

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
        if (isQueueServerBusy) return `Execute ${planName} Plan`;
        return `Execute ${planName} Plan`;
    };

    const isButtonDisabled = () => {
        return disabled || isLoading || isExecuting || !isPlanAvailable || isQueueServerBusy;
    };

    return (
        <div className="flex flex-col">
            <Button
                text={getButtonText()}
                cb={handleExecuteClick}
                disabled={isButtonDisabled()}
                styles={`${className} ${isQueueServerBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {isQueueServerBusy && (
                <div className="text-sm text-red-600 mt-1 text-center">
                    Queue server busy
                </div>
            )}
        </div>
    );
}
