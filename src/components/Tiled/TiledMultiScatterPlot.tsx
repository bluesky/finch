import { cn } from '@/lib/utils';
import { useQueries } from '@tanstack/react-query';
import PlotlyScatter from '../PlotlyScatter';
import { PlotData } from 'plotly.js';

import { getTableDataAsJson } from '@blueskyproject/tiled';
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

export default function TiledMultiScatterPlot({
    tiledTrace,
    paths,
    partition = 0,
    tiledBaseUrl,
    className,
    plotClassName,
    title,
    shortPathNames = false,
    traceNames,
    popupMessage,
}: TiledMultiScatterPlotProps) {
    const results = useQueries({
        queries: paths.map((path) => ({
            queryKey: ['tiled', 'table', path ?? ''],
            queryFn: () => getTableDataAsJson(path!, partition, tiledBaseUrl),
            enabled: path !== null,
        })),
    });

    const xName = tiledTrace.x;
    const yName = tiledTrace.y;

    const isLoading = results.some((r) => r.isLoading);
    const errors = results.filter((r) => r.error).map((r) => (r.error as Error).message);

    // Collect available column names from the first loaded result that has data but is missing x or y.
    const mismatchedResult = !isLoading
        ? results.find((r) => r.data && (!r.data[xName] || !r.data[yName]))
        : undefined;
    const availableColumns = mismatchedResult ? Object.keys(mismatchedResult.data!) : null;

    const plotData: Partial<PlotData>[] = results.flatMap((r, i) => {
        const data = r.data;
        if (!data || !data[xName] || !data[yName]) return [];
        return [
            {
                mode: 'lines+markers',
                marker: { symbol: 'circle', size: 6 },
                ...tiledTrace,
                x: data[xName],
                y: data[yName],
                name:
                    traceNames?.[i] ??
                    (shortPathNames
                        ? (paths[i] ?? `trace ${i}`).slice(0, 4)
                        : (paths[i] ?? `trace ${i}`)),
            } as Partial<PlotData>,
        ];
    });

    return (
        <div
            className={cn(
                'flex-grow h-[30rem] rounded-lg bg-white min-w-0 shadow-md relative',
                className,
            )}
        >
            {popupMessage ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                    <p className="text-red-500">{popupMessage}</p>
                </div>
            ) : (
                <>
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                            <p className="text-slate-500">Loading data...</p>
                        </div>
                    )}
                    {errors.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                            <p className="text-red-500">Error loading data: {errors[0]}</p>
                        </div>
                    )}
                    {paths.every((p) => p === null) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                            <p className="text-slate-500">
                                No data paths provided - waiting for paths
                            </p>
                        </div>
                    )}
                    {availableColumns && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-10 gap-2 p-4">
                            <p className="text-amber-600 font-medium text-sm">
                                Column not found — <span className="font-mono">x="{xName}"</span> /{' '}
                                <span className="font-mono">y="{yName}"</span>. Check your axis
                                values.
                            </p>
                            <p className="text-slate-500 text-xs">Available columns:</p>
                            <div className="flex flex-wrap gap-1 justify-center max-w-md">
                                {availableColumns.map((col) => (
                                    <span
                                        key={col}
                                        className="bg-slate-100 border border-slate-300 rounded px-2 py-0.5 text-xs font-mono text-slate-700"
                                    >
                                        {col}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
            <PlotlyScatter
                data={plotData}
                xAxisTitle={xName}
                yAxisTitle={yName}
                className={plotClassName}
                title={title}
                layout={{
                    plot_bgcolor: '#ffffff',
                    paper_bgcolor: '#ffffff',
                    legend: { x: 0.05, y: 1, xanchor: 'left', yanchor: 'top' },
                    margin: { r: 50, t: 70 },
                    modebar: { orientation: 'v' },
                }}
                xAxisLayout={{
                    showline: true,
                    linecolor: 'black',
                    linewidth: 1.5,
                    mirror: true,
                    gridcolor: '#c9c9c9',
                    gridwidth: 1.5,
                    tickfont: { size: 18, color: '#111111' },
                    ticks: 'outside',
                    ticklen: 6,
                    tickcolor: 'black',
                    tickwidth: 1.5,
                }}
                yAxisLayout={{
                    showline: true,
                    linecolor: 'black',
                    linewidth: 1.5,
                    mirror: true,
                    gridcolor: '#c9c9c9',
                    gridwidth: 1.5,
                    tickfont: { size: 18, color: '#111111' },
                    ticks: 'outside',
                    ticklen: 6,
                    tickcolor: 'black',
                    tickwidth: 1.5,
                }}
                config={{ editable: true, displayModeBar: true }}
            />
        </div>
    );
}
