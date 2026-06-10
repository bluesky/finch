import { TiledPlotlyTrace } from './types/tiledPlotTypes';
import { useTiledWriterMultiScatterPlot } from './hooks/useTiledWriterMultiScatterPlot';
import TiledMultiScatterPlot from './TiledMultiScatterPlot';

type TiledWriterMultiScatterPlotProps = {
    /** Trace descriptor mapping Plotly fields to table column names for x and y axes. */
    tiledTrace: TiledPlotlyTrace;
    /** Bluesky run UIDs used to locate the primary stream data in Tiled. */
    blueskyRunIds: string[];
    /** Base URL of the Tiled server forwarded to `TiledMultiScatterPlot`. */
    tiledBaseUrl?: string;
    /** Additional class names applied to the `TiledMultiScatterPlot` container. */
    className?: string;
    /** Additional class names applied to the plot inside `TiledMultiScatterPlot`. */
    plotClassName?: string;
    /** Title for the plot. */
    title?: string;
    /** Explicit legend names for each trace, parallel to `blueskyRunIds`. */
    traceNames?: string[];
};

export default function TiledWriterMultiScatterPlot({
    tiledTrace,
    blueskyRunIds,
    tiledBaseUrl,
    className,
    plotClassName,
    title,
    traceNames,
}: TiledWriterMultiScatterPlotProps) {
    const { tiledPaths, isLoading, errors } = useTiledWriterMultiScatterPlot(blueskyRunIds, {
        tiledBaseUrl,
    });
    const errorMessage = isLoading
        ? undefined
        : errors.length > 0
          ? `Error fetching data from Tiled server, check the console for more details`
          : undefined;
    if (!isLoading && errors.length > 0)
        console.error('Errors in useTiledWriterMultiScatterPlot:', errors);

    //todo - display error in the UI if there is one from the hook. if use provides specific className for the plot
    //if we can't get any tiledPaths
    return (
        <TiledMultiScatterPlot
            paths={tiledPaths}
            tiledTrace={tiledTrace}
            tiledBaseUrl={tiledBaseUrl}
            className={className}
            plotClassName={plotClassName}
            title={title}
            shortPathNames={!traceNames}
            traceNames={traceNames}
            popupMessage={errorMessage}
        />
    );
}
