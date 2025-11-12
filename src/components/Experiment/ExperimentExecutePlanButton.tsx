import { useState, useEffect } from 'react';
import { getPlansAllowedPromise, executeItemPromise } from '../QServer/utils/apiClient';
import { PostItemAddResponse } from '../QServer/types/apiTypes';
import Button from '../Button';

type ExperimentExecutePlanButtonProps = {
    detectors?: string[];
    num?: number;
    delay?: number;
    md?: { [key: string]: any };
    disabled?: boolean;
    className?: string;
    onSuccess?: (response: PostItemAddResponse) => void;
    onError?: (error: string) => void;
};

export default function ExperimentExecutePlanButton({
    detectors = ["motor1"],
    num = 10,
    delay = 10,
    md = {},
    disabled = false,
    className = "",
    onSuccess,
    onError
}: ExperimentExecutePlanButtonProps) {
    const [isCountPlanAvailable, setIsCountPlanAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        const checkCountPlanAvailability = async () => {
            try {
                const data = await getPlansAllowedPromise();
                setIsLoading(false);
                
                if (data.success && data.plans_allowed) {
                    const hasCountPlan = Object.keys(data.plans_allowed).includes('count');
                    setIsCountPlanAvailable(hasCountPlan);
                    
                    if (!hasCountPlan) {
                        onError?.("Count plan is not available in the allowed plans");
                    }
                } else {
                    onError?.("Failed to fetch allowed plans");
                    setIsCountPlanAvailable(false);
                }
            } catch (error) {
                setIsLoading(false);
                setIsCountPlanAvailable(false);
                onError?.("Error fetching allowed plans");
                console.error("Error fetching plans:", error);
            }
        };

        checkCountPlanAvailability();
    }, [onError]);

    const handleExecuteClick = async () => {
        if (!isCountPlanAvailable || isExecuting) return;

        setIsExecuting(true);

        const requestBody = {
            item: {
                name: "count",
                kwargs: {
                    detectors,
                    num,
                    delay,
                    md
                },
                item_type: "plan"
            }
        };

        try {
            const response = await executeItemPromise(requestBody);
            console.log("QServer execute response:", response);
            
            if (response.success) {
                onSuccess?.(response);
            } else {
                onError?.(response.msg || "Failed to execute count plan");
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
        if (!isCountPlanAvailable) return "Count Plan Unavailable";
        return "Execute Count Plan";
    };

    const isButtonDisabled = () => {
        return disabled || isLoading || isExecuting || !isCountPlanAvailable;
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