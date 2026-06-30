import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import PlotlyHeatmapTiled from '../PlotlyHeatmapTiled';
import SelectDropdown from '../SelectDropdown';
import { useTiledWriterDetImageHeatmap } from './hooks/useTiledWriterDetImageHeatmap';

type TiledWriterDetImageHeatmapProps = {
    /** Bluesky run UID used to locate array signals in Tiled. `null` renders a waiting message. */
    blueskyRunId: string | null;
    /** When `true`, disables live polling because the run is already complete. Defaults to `true`. */
    isRunFinished?: boolean;
    /** Base URL of the Tiled server (e.g. `'http://localhost:8000/api/v1'`). */
    tiledBaseUrl?: string;
    /** Milliseconds between Tiled data refetches while the run is ongoing. */
    pollingIntervalMs?: number;
    /** Additional class names applied to the outer container element. */
    className?: string;
    /** Additional class names applied to the `PlotlyHeatmapTiled` element. */
    plotClassName?: string;
    /** Controls the pixel dimensions of the rendered heatmap. Defaults to `'medium'`. */
    size?: 'small' | 'medium' | 'large';
};

export default function TiledWriterDetImageHeatmap({
    blueskyRunId,
    isRunFinished = true,
    tiledBaseUrl,
    pollingIntervalMs,
    className,
    plotClassName,
    size = 'medium',
}: TiledWriterDetImageHeatmapProps) {
    const { tiledPaths, isLoading, error, enablePolling } = useTiledWriterDetImageHeatmap(
        blueskyRunId,
        {
            isRunFinished,
            pollingIntervalMs,
            tiledBaseUrl,
        },
    );

    const [selectedIndex, setSelectedIndex] = useState(0);

    // Reset selection when the available paths change (e.g. new run)
    useEffect(() => {
        setSelectedIndex(0);
    }, [tiledPaths]);

    const activePath = tiledPaths[selectedIndex] ?? null;

    // Extract the node name from a full metadata URL (last path segment)
    const pathLabel = (url: string) => url.split('/').at(-1) ?? url;

    const getStatusText = () => {
        if (isLoading) return `Loading detector image for run ${blueskyRunId}...`;
        if (error) return `Error: ${error}`;
        if (!blueskyRunId) return 'No run ID provided - waiting for data';
        if (tiledPaths.length === 0) return `No array signals found for run ${blueskyRunId}`;
        return `${pathLabel(activePath!)} — run: ${blueskyRunId} ${enablePolling ? '(Live)' : '(Complete)'}`;
    };

    return (
        <div className={cn('mb-8 flex-shrink-0 bg-white', className)}>
            <p className="text-xs text-gray-600 mb-2 text-wrap">{getStatusText()}</p>
            {tiledPaths.length > 1 && (
                <SelectDropdown
                    listItems={tiledPaths.map(pathLabel)}
                    initialSelectedItem={pathLabel(tiledPaths[0])}
                    onValueChange={(name) =>
                        setSelectedIndex(tiledPaths.findIndex((p) => pathLabel(p) === name))
                    }
                    triggerClassName="mb-2 text-xs"
                />
            )}
            <PlotlyHeatmapTiled
                url={activePath}
                className={cn('pb-8', plotClassName)}
                size={size}
                enablePolling={blueskyRunId && enablePolling ? true : false}
            />
        </div>
    );
}
