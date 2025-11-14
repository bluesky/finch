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
}

export default function TiledWriterScatterPlot({ 
    tiledTrace, 
    blueskyRunId, 
    isRunFinished = false,
    partition, 
    tiledBaseUrl, 
    pollingIntervalMs, 
    className, 
    plotClassName 
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

    if (isLoading) {
        return <div className={className}>Loading Tiled data for run {blueskyRunId}...</div>;
    }

    if (error) {
        return <div className={className}>Error: {error}</div>;
    }

    if (!tiledPath) {
        return <div className={className}>No data path found for run {blueskyRunId}</div>;
    }

    console.log(`[TiledWriterScatterPlot] Rendering TiledScatterPlot with path: ${tiledPath}`);
    
    return (
        <div className={className}>
            <div>Found Tiled path: {tiledPath} {enablePolling ? '(Live - polling enabled)' : '(Complete - polling disabled)'}</div>
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