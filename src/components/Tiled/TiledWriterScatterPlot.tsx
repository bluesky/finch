import { TiledPlotlyTrace } from './types/tiledPlotTypes';
import { useTiledWriterScatterPlot } from './hooks/useTiledWriterScatterPlot';
import TiledScatterPlot from './TiledScatterPlot';

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
    /** Milliseconds between data refetches while the run is ongoing. Defaults to `1000`. */
    pollingIntervalMs?: number;
    /** Additional class names applied to the `TiledScatterPlot` container. */
    className?: string;
    /** Additional class names applied to the plot inside `TiledScatterPlot`. */
    plotClassName?: string;
    /** When `true`, renders a status/error text line above the plot. Defaults to `true`. */
    showStatusText?: boolean;
};

export default function TiledWriterScatterPlot({
    tiledTrace,
    blueskyRunId,
    isRunFinished = false,
    partition,
    tiledBaseUrl,
    pollingIntervalMs,
    className,
    plotClassName,
    showStatusText = true,
}: TiledWriterScatterPlotProps) {
    // Use the custom hook for all Tiled path logic
    const { tiledPath, isLoading, error, enablePolling } = useTiledWriterScatterPlot(blueskyRunId, {
        isRunFinished,
        pollingIntervalMs,
        tiledBaseUrl,
    });

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
                className={className}
                plotClassName={plotClassName}
            />
        </>
    );
}
