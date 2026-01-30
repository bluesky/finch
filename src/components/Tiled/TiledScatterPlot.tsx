import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import PlotlyScatter from "../PlotlyScatter";

import { getTableDataAsJson } from "@blueskyproject/tiled";
import { TiledPlotlyTrace } from "./types/tiledPlotTypes";

type TiledScatterPlotProps = {
    tiledTrace: TiledPlotlyTrace;
    path: string | null;
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
        queryFn: () => getTableDataAsJson(path ? path : '', partition, tiledBaseUrl),
        refetchInterval: enablePolling ? pollingIntervalMs : false,
    });

    // Determine status text based on current state
    const getStatusText = () => {        
        if (!path) {
            return 'No data path provided - waiting for data';
        }
        if (isLoading) {
            return 'Loading data...';
        }
        
        if (error) {
            return `Error loading data: ${(error as Error).message}`;
        }
        
        if (!data) {
            return 'No data available';
        }
        
        const xName = tiledTrace.x;
        const yName = tiledTrace.y;
        
        if (!data[xName] || !data[yName]) {
            return `Error: Missing data for scatter plot (${xName}, ${yName})`;
        }
        
        const dataPoints = data[xName]?.length || 0;
        return `Scatter plot data: ${dataPoints} points${enablePolling ? ' (Live)' : ''}`;
    };

    // Prepare plot data
    let plotData: any[] = [];
    const xName = tiledTrace.x;
    const yName = tiledTrace.y;
    
    if (data && data[xName] && data[yName]) {
        const traceData = JSON.parse(JSON.stringify(data));
        plotData = [traceData];
        plotData[0].x = traceData[xName];
        plotData[0].y = traceData[yName];
    }

    return (
        <div className={cn("flex-grow h-[30rem] p-4 rounded-lg bg-white min-w-0 shadow-md", className)}>
            <div className="text-sm text-gray-600 h-8">
                {getStatusText()}
            </div>
            <PlotlyScatter 
                data={plotData} 
                xAxisTitle={xName} 
                yAxisTitle={yName} 
                className={plotClassName} 
            />
        </div>
    );
}