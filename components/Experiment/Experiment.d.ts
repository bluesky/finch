import { PostItemAddResponse } from '../../api/qServer';
type ExperimentProps = {
    /** Additional CSS class names to apply to the root container. */
    className?: string;
    /** Heading shown above the panel. */
    title?: string;
    /** Callback invoked after a successful plan execution. Receives the raw API response. */
    onSuccess?: (response: PostItemAddResponse) => void;
    /** Callback invoked when plan execution fails. Receives a human-readable error message. */
    onError?: (error: string) => void;
    /** The base Tiled url, e.g. `http://localhost:8000/api/v1`. */
    tiledBaseUrl?: string;
    /** Initial path for the Tiled search, e.g. `beamline531`. */
    tiledInitialPath?: string;
    /** Plan selected on first render. Falls back to the first allowed plan. */
    defaultPlanName?: string;
    /** Column plotted on the x axis. Defaults to `seq_num`. */
    defaultXAxis?: string;
    /** Column plotted on the y axis. Defaults to `time`. */
    defaultYAxis?: string;
};
/**
 * Run any plan the queue server allows, and watch it come out of Tiled.
 *
 * Where other Experiement components hard-code one plan, its parameters and its axes, this asks the server
 * what it can run: `plans_allowed` fills the dropdown, the selected plan's parameter metadata
 * generates the form (`ExperimentFormGeneric`), and the plot's axes are picked from the columns of
 * the run on the plot — falling back to `seq_num` / `time`, which every primary stream has, until
 * there is a run to read them from.
 *
 * The run being plotted is discovered two ways, because a plan can start from anywhere: after an
 * execute here, the queue server is polled for the run uid it produced; independently, Tiled is polled
 * for the newest run of the selected plan, so a scan started from a notebook shows up too.
 */
export default function Experiment({ className, title, onSuccess, onError, tiledBaseUrl, tiledInitialPath, defaultPlanName, defaultXAxis, defaultYAxis, }: ExperimentProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Experiment.d.ts.map