import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import PlotlyScatter from '../PlotlyScatter';
import { PlotData } from 'plotly.js';

import { getTableDataAsJson } from '@blueskyproject/tiled';
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
    /** Additional class names applied to the outer container element. */
    className?: string;
    /** Additional class names applied to the `PlotlyScatter` element. */
    plotClassName?: string;
};

export default function TiledScatterPlot({
    blueskyRunId,
    tiledTrace,
    path,
    partition = 0,
    tiledBaseUrl,
    enablePolling,
    pollingIntervalMs = 1000,
    className,
    plotClassName,
}: TiledScatterPlotProps) {
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
    let plotData: Partial<PlotData>[] = [];
    const xName = tiledTrace.x;
    const yName = tiledTrace.y;

    if (data && data[xName] && data[yName]) {
        const traceData = JSON.parse(JSON.stringify(data));
        plotData = [traceData];
        plotData[0].x = traceData[xName];
        plotData[0].y = traceData[yName];
    }

    return (
        <div
            className={cn(
                'flex-grow h-[30rem] p-4 rounded-lg bg-white min-w-0 shadow-md',
                className,
            )}
        >
            <span className="flex items-center h-8 space-x-8">
                <p className="text-sm text-gray-600">{getStatusText()}</p>
            </span>
            <PlotlyScatter
                data={plotData}
                xAxisTitle={xName}
                yAxisTitle={yName}
                className={plotClassName}
                title={'bluesky run: ' + blueskyRunId}
                layout={{ plot_bgcolor: '#ffffff', paper_bgcolor: '#ffffff' }}
            />
        </div>
    );
}
