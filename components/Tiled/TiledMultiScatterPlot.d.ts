import { TiledPlotlyTrace } from './types/tiledPlotTypes';
type TiledMultiScatterPlotProps = {
    /** Trace descriptor mapping Plotly fields to table column names for x and y axes. */
    tiledTrace: TiledPlotlyTrace;
    /** Tiled paths to table nodes. `null` entries are skipped and show a waiting message. */
    paths: (string | null)[];
    /** Table partition index to fetch. Defaults to `0`. */
    partition?: number;
    /** Base URL of the Tiled server. Falls back to the library default when omitted. */
    tiledBaseUrl?: string;
    /** Additional class names applied to the outer container element. */
    className?: string;
    /** Additional class names applied to the `PlotlyScatter` element. */
    plotClassName?: string;
    /** Title */
    title?: string;
    /** When `true`, uses only the first 4 characters of each path as the trace name. Ignored when `traceNames` is provided. */
    shortPathNames?: boolean;
    /** Explicit names for each trace, parallel to `paths`. Overrides `shortPathNames` when provided. */
    traceNames?: string[];
    /** Message to display that overrides all other displays from the component, use for higher level errors */
    popupMessage?: string;
};
export default function TiledMultiScatterPlot({ tiledTrace, paths, partition, tiledBaseUrl, className, plotClassName, title, shortPathNames, traceNames, popupMessage, }: TiledMultiScatterPlotProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TiledMultiScatterPlot.d.ts.map