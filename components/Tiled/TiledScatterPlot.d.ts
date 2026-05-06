import { TiledPlotlyTrace } from './types/tiledPlotTypes';
type TiledScatterPlotProps = {
    /** Trace descriptor mapping Plotly fields to table column names for x and y axes. */
    tiledTrace: TiledPlotlyTrace;
    /** Tiled path to the table node (e.g. `'/uid/streams/primary/internal'`). `null` shows a waiting message. */
    path: string | null;
    /** Table partition index to fetch. Defaults to `0`. */
    partition?: number;
    /** Base URL of the Tiled server. Falls back to the library default when omitted. */
    tiledBaseUrl?: string;
    /** When `true`, refetches data at the interval set by `pollingIntervalMs`. */
    enablePolling?: boolean;
    /** Milliseconds between data refetches when `enablePolling` is `true`. Defaults to `1000`. */
    pollingIntervalMs?: number;
    /** Additional class names applied to the outer container element. */
    className?: string;
    /** Additional class names applied to the `PlotlyScatter` element. */
    plotClassName?: string;
};
export default function TiledScatterPlot({ tiledTrace, path, partition, tiledBaseUrl, enablePolling, pollingIntervalMs, className, plotClassName }: TiledScatterPlotProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TiledScatterPlot.d.ts.map