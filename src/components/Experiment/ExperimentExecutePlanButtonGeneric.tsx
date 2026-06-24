import { useEffect } from 'react';
import {
    usePlansAllowedQuery,
    useQueueQuery,
    useExecuteQueueItemMutation,
} from '@/api/qServer/hooks';
import { ArbitraryKwargs, PostItemAddResponse } from '@/api/qServer/types';
import Button from '../Button';

type ExperimentExecutePlanButtonGenericProps = {
    /** The name of the QServer plan to execute (e.g. `'count'`, `'energy_scan'`). */
    planName: string;
    /** Keyword arguments forwarded verbatim to the plan in the API request body. */
    kwargs: ArbitraryKwargs;
    /** When true, prevents the button from being clicked regardless of plan availability. */
    disabled?: boolean;
    /** Additional CSS class names to apply to the button. */
    className?: string;
    /** Callback invoked after the plan executes successfully. Receives the raw API response. */
    onSuccess?: (response: PostItemAddResponse) => void;
    /** Callback invoked when plan availability check or execution fails. Receives a human-readable error message. */
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
    className = '',
    onSuccess,
    onError,
}: ExperimentExecutePlanButtonGenericProps) {
    const plansQuery = usePlansAllowedQuery();
    const queueQuery = useQueueQuery({
        refetchInterval: 1000,
    });
    const executeMutation = useExecuteQueueItemMutation();

    const isPlanAvailable =
        plansQuery.data?.success && plansQuery.data?.plans_allowed
            ? Object.keys(plansQuery.data.plans_allowed).includes(planName)
            : false;

    const isQueueServerBusy = queueQuery.data?.running_item
        ? Object.keys(queueQuery.data.running_item).length > 0
        : false;

    useEffect(() => {
        if (plansQuery.isError) {
            onError?.('Error fetching allowed plans');
        } else if (!plansQuery.isLoading && plansQuery.data && !isPlanAvailable) {
            onError?.(`${planName} plan is not available in the allowed plans`);
        }
    }, [
        plansQuery.isError,
        plansQuery.isLoading,
        plansQuery.data,
        isPlanAvailable,
        planName,
        onError,
    ]);

    const handleExecuteClick = () => {
        if (!isPlanAvailable || executeMutation.isPending || isQueueServerBusy) return;

        executeMutation.mutate(
            { item: { name: planName, kwargs, item_type: 'plan' } },
            {
                onSuccess: (response) => {
                    if (response.success) {
                        onSuccess?.(response);
                    } else {
                        onError?.(response.msg || `Failed to execute ${planName} plan`);
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
        if (!isPlanAvailable) return `${planName} Plan Unavailable`;
        return `Execute ${planName} Plan`;
    };

    const isButtonDisabled = () => {
        return (
            disabled ||
            plansQuery.isLoading ||
            executeMutation.isPending ||
            !isPlanAvailable ||
            isQueueServerBusy
        );
    };

    return (
        <div className="flex flex-col">
            <Button
                text={getButtonText()}
                cb={handleExecuteClick}
                disabled={isButtonDisabled()}
                className={`${className} ${isQueueServerBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {isQueueServerBusy ? (
                <div className="text-sm text-red-600 mt-1 text-center">Queue server busy</div>
            ) : (
                <p className="text-sm text-gray-500 mt-1 text-center">Queue server available</p>
            )}
        </div>
    );
}
