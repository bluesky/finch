import { useState, useEffect, useCallback } from 'react';
import { useTiledApiUrls } from '@/utils/apiUtils';
import { cleanTiledInitialPath } from '../utils/tiledUtils';

type UseTiledWriterDetImageHeatmapOptions = {
    /** When `true`, disables polling because the run is already complete. Defaults to `false`. */
    isRunFinished?: boolean;
    /** Milliseconds between Tiled data refetches while the run is ongoing. Defaults to `2000`. */
    pollingIntervalMs?: number;
    /** Base URL of the Tiled server. Defaults to `'http://localhost:8000/api/v1'`. */
    tiledBaseUrl?: string;
    /** Initial path prefix for Tiled searches (e.g. `'beamline531'`). Falls back to `FinchConfigProvider`, then no prefix. */
    tiledInitialPath?: string;
};

export function useTiledWriterDetImageHeatmap(
    blueskyRunId: string | null,
    options: UseTiledWriterDetImageHeatmapOptions = {},
) {
    const { isRunFinished = false, pollingIntervalMs = 2000, tiledBaseUrl } = options;

    const [tiledPaths, setTiledPaths] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [enablePolling, setEnablePolling] = useState<boolean>(!isRunFinished);

    const { httpBaseUrl, initialPath: configInitialPath } = useTiledApiUrls();
    const tiledBaseUrlFinal = tiledBaseUrl || httpBaseUrl;
    const resolvedInitialPath = options.tiledInitialPath ?? configInitialPath ?? '';
    const startPath = resolvedInitialPath.trim()
        ? `${cleanTiledInitialPath(resolvedInitialPath)}/`
        : '';

    const checkForDetImage = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Check if the run exists and get its metadata
            const runResponse = await fetch(
                `${tiledBaseUrlFinal}/metadata/${startPath}${blueskyRunId}`,
            );

            if (!runResponse.ok) {
                throw new Error(`Run ${blueskyRunId} not found`);
            }

            const runData = await runResponse.json();

            // Check for 'stop' key in metadata to determine if run is finished
            const hasStopKey = runData.data.attributes?.metadata?.stop !== undefined;

            if (hasStopKey && enablePolling) {
                setEnablePolling(false);
            }

            // Search the primary folder for all array-typed nodes
            const primarySearchResponse = await fetch(
                `${tiledBaseUrlFinal}/search/${startPath}${blueskyRunId}/primary`,
            );

            if (!primarySearchResponse.ok) {
                throw new Error(`primary stream not found for run: ${blueskyRunId}`);
            }

            const primarySearchData = await primarySearchResponse.json();
            const entries: { id: string; attributes?: { structure_family?: string } }[] =
                primarySearchData.data ?? [];

            const arrayPaths = entries
                .filter((entry) => entry.attributes?.structure_family === 'array')
                .map(
                    (entry) =>
                        `${tiledBaseUrlFinal}/metadata/${startPath}${blueskyRunId}/primary/${entry.id}`,
                );

            if (arrayPaths.length === 0) {
                throw new Error(
                    `No array-type signals found in primary stream for run: ${blueskyRunId}`,
                );
            }

            setTiledPaths(arrayPaths);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error(
                `[useTiledWriterDetImageHeatmap] Error fetching array signals for run ${blueskyRunId}:`,
                errorMessage,
            );
            setError(errorMessage);
            setTiledPaths([]);
        } finally {
            setIsLoading(false);
        }
    }, [blueskyRunId, tiledBaseUrlFinal, startPath, enablePolling]);

    useEffect(() => {
        if (!blueskyRunId) {
            setError('No blueskyRunId provided');
            setIsLoading(false);
            setTiledPaths([]);
            return;
        }

        // Initial check
        checkForDetImage();

        // Set up polling if enabled
        if (enablePolling && !isRunFinished) {
            const interval = setInterval(checkForDetImage, pollingIntervalMs);
            return () => clearInterval(interval);
        }
    }, [
        blueskyRunId,
        enablePolling,
        isRunFinished,
        pollingIntervalMs,
        tiledBaseUrl,
        checkForDetImage,
    ]);

    // Update polling state when isRunFinished changes
    useEffect(() => {
        if (isRunFinished && enablePolling) {
            setEnablePolling(false);
        }
    }, [isRunFinished, enablePolling, blueskyRunId]);

    return {
        tiledPaths,
        isLoading,
        error,
        enablePolling,
    };
}
