import { useQuery } from "@tanstack/react-query";
import PlotlyScatter from "../PlotlyScatter";

import { getTableDataAsJson } from "@blueskyproject/tiled";

type TiledScatterPlotProps = {
    path: string;
    partition?: number;
    tiledBaseUrl?: string;
    enablePolling?: boolean;
    pollingIntervalMs?: number;
}

const xName = "A";
const yName = "B";
export default function TiledScatterPlot({ path, partition=0, tiledBaseUrl, enablePolling, pollingIntervalMs=1000 }: TiledScatterPlotProps) {
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

    //verify if the xName and yName exist in data
    if (!data || !data[xName] || !data[yName]) {
        return <div>Error: Missing data for scatter plot</div>;
    } else {
        const plotData = [
            {
                x: data[xName],
                y: data[yName],
            }
        ];
            return (
                <div className="w-full h-96 p-4 rounded-lg bg-white">
                    Tiled Scatter Plot Component
                    <PlotlyScatter data={plotData} xAxisTitle={xName} yAxisTitle={yName} />
                </div>
            )
    }
}