import { TiledPlotlyTrace } from './types/tiledPlotTypes';
import { useTiledWriterScatterPlot } from './hooks/useTiledWriterScatterPlot';
import TiledScatterPlot from './TiledScatterPlot';

/** The plot's surface while a run is still being written to. */
const LIVE_BACKGROUND = '#ffffff';
/** And once it has stopped — tailwind's `slate-100`. */
const FINISHED_BACKGROUND = '#f1f5f9';

type TiledWriterScatterPlotProps = {
    /** Trace descriptor mapping Plotly fields to table column names for x and y axes. */
    tiledTrace: TiledPlotlyTrace;
    /** Bluesky run UID used to locate the primary stream data in Tiled. */
    blueskyRunId: string;
    /** When `true`, disables retry/completion polling because the run is already complete. Defaults to `false`. */
    isRunFinished?: boolean;
    /** Table partition index forwarded to `TiledScatterPlot`. */
    partition?: number;
    /** Base URL of the Tiled server forwarded to `TiledScatterPlot`. */
    tiledBaseUrl?: string;
    /** Initial path for the Tiled search, e.g. `beamline531`. */
    initialPath?: string;
    /** Milliseconds between data refetches while the run is ongoing. Defaults to `1000`. */
    pollingIntervalMs?: number;
    /** Additional class names applied to the `TiledScatterPlot` container. */
    className?: string;
    /** Additional class names applied to the plot inside `TiledScatterPlot`. */
    plotClassName?: string;
    /** When `true`, renders a status/error text line above the plot. Defaults to `true`. */
    showStatusText?: boolean;
    /**
     * Card colour while the run is still being written to. Defaults to white.
     */
    liveBackgroundColor?: string;
    /**
     * Card colour once the run has stopped, which is how a finished plot is told apart at a glance
     * from one still filling in. Defaults to a light grey.
     */
    finishedBackgroundColor?: string;
    /** Additional layout options for the Plotly scatter plot. */
    layout?: Partial<Plotly.Layout>;
};

export default function TiledWriterScatterPlot({
    tiledTrace,
    blueskyRunId,
    isRunFinished = false,
    partition,
    tiledBaseUrl,
    initialPath,
    pollingIntervalMs,
    className,
    plotClassName,
    showStatusText = true,
    liveBackgroundColor = LIVE_BACKGROUND,
    finishedBackgroundColor = FINISHED_BACKGROUND,
    layout = {},
}: TiledWriterScatterPlotProps) {
    // Use the custom hook for all Tiled path logic
    const { tiledPath, isLoading, error, enablePolling } = useTiledWriterScatterPlot(blueskyRunId, {
        isRunFinished,
        pollingIntervalMs,
        tiledBaseUrl,
        initialPath,
    });

    // Whether the plot is polling is the same question as whether the run is still going: the run gets
    // a stop document when it ends, and the hook stops polling as soon as that appears. A run that has
    // not been located yet still counts as ongoing, so the plot does not flash grey while it waits.
    const backgroundColor = enablePolling ? liveBackgroundColor : finishedBackgroundColor;

    // Determine status text based on current state
    const getStatusText = () => {
        if (isLoading) {
            return `Loading Tiled data for run ${blueskyRunId}...`;
        }

        if (error) {
            return `Error: ${error}`;
        }

        if (!blueskyRunId) {
            return 'No run ID provided - waiting for data';
        }

        if (!tiledPath) {
            return `No data path found for run ${blueskyRunId}`;
        }

        return `Found Tiled path: ${tiledPath} ${enablePolling ? '(Live - polling enabled)' : '(Complete - polling disabled)'}`;
    };

    console.log(`[TiledWriterScatterPlot] Rendering TiledScatterPlot with path: ${tiledPath}`);

    return (
        <>
            {showStatusText && <p className="text-xs text-gray-600 mb-2">{getStatusText()}</p>}
            <TiledScatterPlot
                blueskyRunId={blueskyRunId}
                path={tiledPath}
                tiledTrace={tiledTrace}
                partition={partition}
                enablePolling={enablePolling}
                pollingIntervalMs={pollingIntervalMs || 1000}
                backgroundColor={backgroundColor}
                className={className}
                plotClassName={plotClassName}
                layout={layout}
            />
        </>
    );
}
