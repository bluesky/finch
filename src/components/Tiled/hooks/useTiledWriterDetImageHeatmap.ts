import { useState, useEffect } from 'react';

type UseTiledWriterDetImageHeatmapOptions = {
    isRunFinished?: boolean;
    pollingIntervalMs?: number;
    tiledBaseUrl?: string;
};

export function useTiledWriterDetImageHeatmap(
    blueskyRunId: string | null,
    options: UseTiledWriterDetImageHeatmapOptions = {}
) {
    const {
        isRunFinished = false,
        pollingIntervalMs = 2000,
        tiledBaseUrl = 'http://192.168.10.155:8000'
    } = options;

    const [tiledPath, setTiledPath] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [enablePolling, setEnablePolling] = useState<boolean>(!isRunFinished);

    const checkForDetImage = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Check if the run exists and get its metadata
            const runResponse = await fetch(`${tiledBaseUrl}/api/v1/metadata/${blueskyRunId}`);
            
            if (!runResponse.ok) {
                throw new Error(`Run ${blueskyRunId} not found`);
            }

            const runData = await runResponse.json();
            
            // Check for 'stop' key in metadata to determine if run is finished
            const hasStopKey = runData.data.attributes?.metadata?.stop !== undefined;
            
            if (hasStopKey && enablePolling) {
                console.log(`[useTiledWriterDetImageHeatmap] Stop key found for run ${blueskyRunId}, disabling polling`);
                setEnablePolling(false);
            }

            // Construct path to det_image: {id}/primary/det_image
            const detImagePath = `${blueskyRunId}/primary/det_image`;
            const detImageResponse = await fetch(`${tiledBaseUrl}/api/v1/metadata/${detImagePath}`);

            if (!detImageResponse.ok) {
                throw new Error(`det_image not found at path: ${detImagePath}`);
            }

            const detImageData = await detImageResponse.json();
            
            // Verify it's an array structure
            if (detImageData.data.attributes?.structure_family !== 'array') {
                console.log({detImageData})
                throw new Error('det_image is not an array structure');
            }

            console.log(`[useTiledWriterDetImageHeatmap] Found det_image for run ${blueskyRunId} at path: ${detImagePath}`);
            setTiledPath(`${tiledBaseUrl}/api/v1/metadata/${detImagePath}`);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error(`[useTiledWriterDetImageHeatmap] Error fetching det_image for run ${blueskyRunId}:`, errorMessage);
            setError(errorMessage);
            setTiledPath(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!blueskyRunId) {
            setError('No blueskyRunId provided');
            setIsLoading(false);
            setTiledPath(null);
            return;
        }

        // Initial check
        checkForDetImage();

        // Set up polling if enabled
        if (enablePolling && !isRunFinished) {
            const interval = setInterval(checkForDetImage, pollingIntervalMs);
            return () => clearInterval(interval);
        }
    }, [blueskyRunId, enablePolling, isRunFinished, pollingIntervalMs, tiledBaseUrl]);

    // Update polling state when isRunFinished changes
    useEffect(() => {
        if (isRunFinished && enablePolling) {
            console.log(`[useTiledWriterDetImageHeatmap] Run ${blueskyRunId} marked as finished, disabling polling`);
            setEnablePolling(false);
        }
    }, [isRunFinished, enablePolling, blueskyRunId]);

    return {
        tiledPath,
        isLoading,
        error,
        enablePolling
    };
}