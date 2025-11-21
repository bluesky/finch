import { useState, useEffect } from "react";
import { TiledPlotlyTrace } from "./types/tiledPlotTypes"
import { useTiledWriterScatterPlot } from "./hooks/useTiledWriterScatterPlot";
import TiledScatterPlot from "./TiledScatterPlot";

type TiledWriterScatterPlotProps = {
    tiledTrace: TiledPlotlyTrace;
    blueskyRunId: string;
    isRunFinished?: boolean;
    partition?: number;
    tiledBaseUrl?: string;
    pollingIntervalMs?: number;
    className?: string;
    plotClassName?: string;
    showStatusText?: boolean;
}

export default function TiledWriterScatterPlot({ 
    tiledTrace, 
    blueskyRunId, 
    isRunFinished = false,
    partition, 
    tiledBaseUrl, 
    pollingIntervalMs, 
    className, 
    plotClassName,
    showStatusText = true
}: TiledWriterScatterPlotProps) {
    // Use the custom hook for all Tiled path logic
    const { 
        tiledPath, 
        isLoading, 
        error, 
        enablePolling 
    } = useTiledWriterScatterPlot(blueskyRunId, { 
        isRunFinished, 
        pollingIntervalMs 
    });

    // Determine status text based on current state
    const getStatusText = () => {
        if (isLoading) {
            return `Loading Tiled data for run ${blueskyRunId}...`;
        }
        
        if (error) {
            return `Error: ${error}`;
        }
        
        if (!blueskyRunId) {
            return 'No run ID provided - waiting for data';
        }
        
        if (!tiledPath) {
            return `No data path found for run ${blueskyRunId}`;
        }
        
        return `Found Tiled path: ${tiledPath} ${enablePolling ? '(Live - polling enabled)' : '(Complete - polling disabled)'}`;
    };

    console.log(`[TiledWriterScatterPlot] Rendering TiledScatterPlot with path: ${tiledPath}`);
    
    return (
        <div className={className}>
            {showStatusText && (
                <p className="text-xs text-gray-600 mb-2">
                    {getStatusText()}
                </p>
            )}
            <TiledScatterPlot 
                path={tiledPath}
                tiledTrace={tiledTrace}
                enablePolling={enablePolling}
                pollingIntervalMs={pollingIntervalMs || 1000}
                className={plotClassName}
            />
        </div>
    );
}           