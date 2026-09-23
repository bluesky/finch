import { TiledPlotlyTrace } from './types/tiledPlotTypes';
type TiledScatterPlotProps = {
    /**Bluesky Run ID saved into Tiled */
    blueskyRunId: string;
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
    /**
     * CSS colour for the card *and* the plot inside it, so the two are one surface — a colour set only
     * on the Plotly layout leaves the card's padding as a frame around it. Defaults to white. Applied
     * as an inline style, so it beats any background in `className`.
     */
    backgroundColor?: string;
    /** Additional class names applied to the outer container element. */
    className?: string;
    /** Additional class names applied to the `PlotlyScatter` element. */
    plotClassName?: string;
    /** Additional layout options for the Plotly scatter plot. */
    layout?: Partial<Plotly.Layout>;
};
export default function TiledScatterPlot({ blueskyRunId, tiledTrace, path, partition, tiledBaseUrl, enablePolling, pollingIntervalMs, backgroundColor, className, plotClassName, layout, }: TiledScatterPlotProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TiledScatterPlot.d.ts.map