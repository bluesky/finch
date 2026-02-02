import { cn } from "@/lib/utils";
import PlotlyHeatmapTiled from "../PlotlyHeatmapTiled";
import { useTiledWriterDetImageHeatmap } from "./hooks/useTiledWriterDetImageHeatmap";

type TiledWriterDetImageHeatmapProps = {
    blueskyRunId: string | null;
    isRunFinished?: boolean;
    tiledBaseUrl?: string;
    pollingIntervalMs?: number;
    className?: string;
    plotClassName?: string;
    size?: 'small' | 'medium' | 'large';
}

export default function TiledWriterDetImageHeatmap({ 
    blueskyRunId,
    isRunFinished = true,
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

    // Determine status text based on current state
    const getStatusText = () => {
        if (isLoading) {
            return `Loading detector image for run ${blueskyRunId}...`;
        }
        
        if (error) {
            return `Error: ${error}`;
        }
        
        if (!blueskyRunId) {
            return 'No run ID provided - waiting for data';
        }
        
        if (!tiledPath) {
            return `No det_image found for run ${blueskyRunId}`;
        }
        
        return `Det Image for run: ${blueskyRunId} ${enablePolling ? '(Live - polling enabled)' : '(Complete - polling disabled)'}`;
    };

    //console.log(`[TiledWriterDetImageHeatmap] Rendering PlotlyHeatmapTiled with path: ${tiledPath}`);
    
    return (
        <div className={cn("mb-8 flex-shrink-0 bg-white", className)}>
            <p className="text-xs text-gray-600 mb-2 text-wrap">
                {getStatusText()}
            </p>
            <PlotlyHeatmapTiled 
                url={tiledPath}
                className={cn("pb-8", plotClassName)}
                size={size}
                enablePolling={blueskyRunId && enablePolling ? true : false}
            />
        </div>
    );
}