import { PostItemAddResponse } from '../../api/qServer/types';
type ExperimentEnergyScanProps = {
    /** Additional CSS class names to apply to the root container. */
    className?: string;
    /** Callback invoked after a successful plan execution. Receives the raw API response. */
    onSuccess?: (response: PostItemAddResponse) => void;
    /** Callback invoked when plan execution fails. Receives a human-readable error message. */
    onError?: (error: string) => void;
    /** The url for the Tiled server */
    tiledBaseUrl?: string;
};
export default function ExperimentEnergyScan({ className, onSuccess, onError, tiledBaseUrl }: ExperimentEnergyScanProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ExperimentEnergyScan.d.ts.map