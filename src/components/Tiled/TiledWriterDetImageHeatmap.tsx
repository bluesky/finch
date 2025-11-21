import PlotlyHeatmapTiled from "../PlotlyHeatmapTiled";
import { useTiledWriterDetImageHeatmap } from "./hooks/useTiledWriterDetImageHeatmap";

type TiledWriterDetImageHeatmapProps = {
    blueskyRunId: string;
    isRunFinished?: boolean;
    tiledBaseUrl?: string;
    pollingIntervalMs?: number;
    className?: string;
    plotClassName?: string;
    size?: 'small' | 'medium' | 'large';
}

export default function TiledWriterDetImageHeatmap({ 
    blueskyRunId,
    isRunFinished = false,
    tiledBaseUrl,
    pollingIntervalMs,
    className,
    plotClassName,
    size = 'medium'
}: TiledWriterDetImageHeatmapProps) {
    // Use the custom hook for all Tiled path logic
    const { 
        tiledPath, 
        isLoading, 
        error, 
        enablePolling 
    } = useTiledWriterDetImageHeatmap(blueskyRunId, { 
        isRunFinished, 
        pollingIntervalMs,
        tiledBaseUrl 
    });

    if (isLoading) {
        return <div className={className}>Loading detector image for run {blueskyRunId}...</div>;
    }

    if (error) {
        return <div className={className}>Error: {error}</div>;
    }

    if (!tiledPath) {
        return <div className={className}>No det_image found for run {blueskyRunId}</div>;
    }

    console.log(`[TiledWriterDetImageHeatmap] Rendering PlotlyHeatmapTiled with path: ${tiledPath}`);
    
    return (
        <div className={className}>
            <div className="text-sm text-gray-600 mb-2">
                Det Image for run: {blueskyRunId} {enablePolling ? '(Live - polling enabled)' : '(Complete - polling disabled)'}
            </div>
            <PlotlyHeatmapTiled 
                url={tiledPath}
                className={plotClassName}
                size={size}
            />
        </div>
    );
}