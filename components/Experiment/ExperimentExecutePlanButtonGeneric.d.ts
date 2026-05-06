import { ArbitraryKwargs, PostItemAddResponse } from '../../api/qServer/types';
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
export default function ExperimentExecutePlanButtonGeneric({ planName, kwargs, disabled, className, onSuccess, onError }: ExperimentExecutePlanButtonGenericProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ExperimentExecutePlanButtonGeneric.d.ts.map