import { PostItemAddResponse } from '../../api/qServer/types';
type ExperimentXASScanProps = {
    /** Additional CSS class names to apply to the root container. */
    className?: string;
    /** Callback invoked after a successful plan execution. Receives the raw API response. */
    onSuccess?: (response: PostItemAddResponse) => void;
    /** Callback invoked when plan execution fails. Receives a human-readable error message. */
    onError?: (error: string) => void;
    /** The base Tiled url */
    tiledBaseUrl?: string;
};
export default function ExperimentXASScan({ className, onSuccess, onError, tiledBaseUrl, }: ExperimentXASScanProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ExperimentXASScan.d.ts.map