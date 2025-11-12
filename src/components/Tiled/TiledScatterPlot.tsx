import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import PlotlyScatter from "../PlotlyScatter";

import { getTableDataAsJson } from "@blueskyproject/tiled";
import { TiledPlotlyTrace } from "./types/tiledPlotTypes";

type TiledScatterPlotProps = {
    tiledTrace: TiledPlotlyTrace;
    path: string;
    partition?: number;
    tiledBaseUrl?: string;
    enablePolling?: boolean;
    pollingIntervalMs?: number;
    className?: string;
    plotClassName?: string;
}

export default function TiledScatterPlot({ tiledTrace, path, partition=0, tiledBaseUrl, enablePolling, pollingIntervalMs=1000, className, plotClassName }: TiledScatterPlotProps) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['tiled', 'table', path],
        queryFn: () => getTableDataAsJson(path, partition, tiledBaseUrl),
        refetchInterval: enablePolling ? pollingIntervalMs : false,
    })



    if (error) {
        return <div>Error loading data: {(error as Error).message}</div>;
    }

    if (isLoading) {
        return <div>Loading data...</div>;
    }

    //verify provided x and y exist in data
    //TODO - do a string match for initial characters since some table values are saved with additional suffixes via tiledwriter
    const xName = tiledTrace.x;
    const yName = tiledTrace.y;
    if (!data || !data[xName] || !data[yName]) {
        return <div>Error: Missing data for scatter plot</div>;
    } else {
        const traceData = JSON.parse(JSON.stringify(data));
        const plotData = [
            traceData
        ];
        plotData[0].x = traceData[xName];
        plotData[0].y = traceData[yName];
            return (
                <div className={cn("w-full h-96 p-4 rounded-lg bg-white", className)}>
                    <PlotlyScatter data={plotData} xAxisTitle={xName} yAxisTitle={yName} className={plotClassName} />
                </div>
            )
    }
}