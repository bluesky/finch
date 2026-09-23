import { TiledPlotlyTrace } from './types/tiledPlotTypes';
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
export default function TiledWriterScatterPlot({ tiledTrace, blueskyRunId, isRunFinished, partition, tiledBaseUrl, initialPath, pollingIntervalMs, className, plotClassName, showStatusText, liveBackgroundColor, finishedBackgroundColor, layout, }: TiledWriterScatterPlotProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TiledWriterScatterPlot.d.ts.map