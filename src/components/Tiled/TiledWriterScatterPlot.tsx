import { TiledPlotlyTrace } from "./types/tiledPlotTypes"

import TiledScatterPlot from "./TiledScatterPlot";

type TiledWriterScatterPlotProps = {
    tiledTrace: TiledPlotlyTrace;
    blueskyRunId: string;
    partition?: number;
    tiledBaseUrl?: string;
    pollingIntervalMs?: number;
    className?: string;
    plotClassName?: string;
}
export default function TiledWriterScatterPlot({ tiledTrace, blueskyRunId, partition, tiledBaseUrl, pollingIntervalMs, className, plotClassName }: TiledWriterScatterPlotProps) {
    return (
        <div>TiledWriterScatterPlot</div>
    )
}           