import { PostItemAddResponse } from '../../api/qServer/types';
type ExperimentExecutePlanButtonProps = {
    /** List of detector names passed to the `count` plan. Defaults to `["motor1"]`. */
    detectors?: string[];
    /** Number of exposures for the `count` plan. Defaults to 10. */
    num?: number;
    /** Delay in seconds between exposures. Defaults to 10. */
    delay?: number;
    /** Arbitrary metadata dict included in the plan kwargs as `md`. */
    md?: {
        [key: string]: string;
    };
    /** When true, prevents the button from being clicked regardless of plan availability. */
    disabled?: boolean;
    /** Additional CSS class names to apply to the button. */
    className?: string;
    /** Callback invoked after the `count` plan executes successfully. */
    onSuccess?: (response: PostItemAddResponse) => void;
    /** Callback invoked when plan availability check or execution fails. */
    onError?: (error: string) => void;
};
export default function ExperimentExecutePlanButton({ detectors, num, delay, md, disabled, className, onSuccess, onError, }: ExperimentExecutePlanButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ExperimentExecutePlanButton.d.ts.map