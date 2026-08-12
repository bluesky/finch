import { TiledPlotlyTrace } from './types/tiledPlotTypes';
type TiledWriterMultiScatterPlotProps = {
    /** Trace descriptor mapping Plotly fields to table column names for x and y axes. */
    tiledTrace: TiledPlotlyTrace;
    /** Bluesky run UIDs used to locate the primary stream data in Tiled. */
    blueskyRunIds: string[];
    /** Base URL of the Tiled server forwarded to `TiledMultiScatterPlot`. */
    tiledBaseUrl?: string;
    /** Initial path for the Tiled search. */
    initialPath?: string;
    /** Additional class names applied to the `TiledMultiScatterPlot` container. */
    className?: string;
    /** Additional class names applied to the plot inside `TiledMultiScatterPlot`. */
    plotClassName?: string;
    /** Title for the plot. */
    title?: string;
    /** Explicit legend names for each trace, parallel to `blueskyRunIds`. */
    traceNames?: string[];
};
export default function TiledWriterMultiScatterPlot({ tiledTrace, blueskyRunIds, tiledBaseUrl, className, plotClassName, title, traceNames, initialPath, }: TiledWriterMultiScatterPlotProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TiledWriterMultiScatterPlot.d.ts.map