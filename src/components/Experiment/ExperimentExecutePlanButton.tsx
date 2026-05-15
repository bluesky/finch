import { useEffect } from 'react';
import { usePlansAllowedQuery, useExecuteQueueItemMutation } from '@/api/qServer/hooks';
import { PostItemAddResponse } from '@/api/qServer/types';
import Button from '../Button';

type ExperimentExecutePlanButtonProps = {
    /** List of detector names passed to the `count` plan. Defaults to `["motor1"]`. */
    detectors?: string[];
    /** Number of exposures for the `count` plan. Defaults to 10. */
    num?: number;
    /** Delay in seconds between exposures. Defaults to 10. */
    delay?: number;
    /** Arbitrary metadata dict included in the plan kwargs as `md`. */
    md?: { [key: string]: string };
    /** When true, prevents the button from being clicked regardless of plan availability. */
    disabled?: boolean;
    /** Additional CSS class names to apply to the button. */
    className?: string;
    /** Callback invoked after the `count` plan executes successfully. */
    onSuccess?: (response: PostItemAddResponse) => void;
    /** Callback invoked when plan availability check or execution fails. */
    onError?: (error: string) => void;
};

export default function ExperimentExecutePlanButton({
    detectors = ['motor1'],
    num = 10,
    delay = 10,
    md = {},
    disabled = false,
    className = '',
    onSuccess,
    onError,
}: ExperimentExecutePlanButtonProps) {
    const plansQuery = usePlansAllowedQuery();
    const executeMutation = useExecuteQueueItemMutation();

    const isCountPlanAvailable =
        plansQuery.data?.success && plansQuery.data?.plans_allowed
            ? Object.keys(plansQuery.data.plans_allowed).includes('count')
            : false;

    useEffect(() => {
        if (plansQuery.isError) {
            onError?.('Error fetching allowed plans');
        } else if (!plansQuery.isLoading && plansQuery.data && !isCountPlanAvailable) {
            onError?.('Count plan is not available in the allowed plans');
        }
    }, [plansQuery.isError, plansQuery.isLoading, plansQuery.data, isCountPlanAvailable, onError]);

    const handleExecuteClick = () => {
        if (!isCountPlanAvailable || executeMutation.isPending) return;

        executeMutation.mutate(
            { item: { name: 'count', kwargs: { detectors, num, delay, md }, item_type: 'plan' } },
            {
                onSuccess: (response) => {
                    console.log('QServer execute response:', response);
                    if (response.success) {
                        onSuccess?.(response);
                    } else {
                        onError?.(response.msg || 'Failed to execute count plan');
                    }
                },
                onError: (error) => {
                    const errorMessage =
                        error instanceof Error ? error.message : 'Network error executing plan';
                    onError?.(errorMessage);
                    console.error('Error executing plan:', error);
                },
            },
        );
    };

    const getButtonText = () => {
        if (plansQuery.isLoading) return 'Loading...';
        if (executeMutation.isPending) return 'Executing...';
        if (!isCountPlanAvailable) return 'Count Plan Unavailable';
        return 'Execute Count Plan';
    };

    const isButtonDisabled = () => {
        return (
            disabled || plansQuery.isLoading || executeMutation.isPending || !isCountPlanAvailable
        );
    };

    return (
        <Button
            text={getButtonText()}
            cb={handleExecuteClick}
            disabled={isButtonDisabled()}
            className={className}
        />
    );
}
