import { useState, useEffect, useCallback } from "react";
import { getSearchResults, TiledSearchConfig } from "@blueskyproject/tiled";
import { checkRunCompletion } from "../utils/tiledUtils";

type UseTiledWriterScatterPlotReturn = {
    /** Resolved Tiled path to the primary stream data, or `null` while searching. */
    tiledPath: string | null;
    /** `true` while the initial path search is in progress. */
    isLoading: boolean;
    /** Human-readable status/error message, or `null` when data is ready. */
    error: string | null;
    /** `true` when the run is still ongoing and data should be refetched. */
    enablePolling: boolean;
    /** Starts an interval that checks Tiled for a run-stop document and disables polling when found. */
    startCompletionPolling: (pollingIntervalMs?: number) => void;
    /** Cancels the completion-polling interval started by `startCompletionPolling`. */
    stopCompletionPolling: () => void;
};

type UseTiledWriterScatterPlotOptions = {
    /** When `true`, skips retry/completion polling because the run is already complete. Defaults to `false`. */
    isRunFinished?: boolean;
    /** Milliseconds between completion-check polls. Defaults to `5000`. */
    pollingIntervalMs?: number;
    /** The base url for the tiled server, ex) http://localhost:8000/api/v1 */
    tiledBaseUrl?: string;
};

export const useTiledWriterScatterPlot = (
    blueskyRunId: string, 
    options: UseTiledWriterScatterPlotOptions = {}
): UseTiledWriterScatterPlotReturn => {
    const { isRunFinished = false, pollingIntervalMs = 5000, tiledBaseUrl } = options;
    
    const [tiledPath, setTiledPath] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enablePolling, setEnablePolling] = useState(!isRunFinished);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
    const [retryInterval, setRetryInterval] = useState<NodeJS.Timeout | null>(null);

    // Function to start polling for completion
    const startCompletionPolling = useCallback((customPollingInterval?: number) => {
        console.log(`[useTiledWriterScatterPlot] Starting completion polling for run: ${blueskyRunId}`);
        
        const intervalId = setInterval(async () => {
            const isComplete = await checkRunCompletion(blueskyRunId, tiledBaseUrl);
            if (isComplete) {
                setEnablePolling(false);
                clearInterval(intervalId);
                setPollingInterval(null);
                console.log(`[useTiledWriterScatterPlot] Run completed, cleared polling interval`);
            } else {
                setEnablePolling(true);
            }
        }, customPollingInterval || pollingIntervalMs);
        
        setPollingInterval(intervalId);
    }, [blueskyRunId, tiledBaseUrl, pollingIntervalMs]);

    // Function to stop polling
    const stopCompletionPolling = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
            console.log(`[useTiledWriterScatterPlot] Manually stopped polling interval`);
        }
    };

    // Function to stop retry polling
    const stopRetryPolling = useCallback(() => {
        if (retryInterval) {
            clearInterval(retryInterval);
            setRetryInterval(null);
            console.log(`[useTiledWriterScatterPlot] Stopped retry polling`);
        }
    }, [retryInterval]);

    // Function to handle successful path discovery
    const handleSuccessfulPath = useCallback(async (finalPath: string, pathType: string) => {
        console.log(`[useTiledWriterScatterPlot] Success! Using ${pathType} path: ${finalPath}`);
        setTiledPath(finalPath);
        setIsLoading(false);
        setError(null);
        
        // Stop retry polling since we found the path
        stopRetryPolling();
        
        // Check run completion and start polling if needed
        const isComplete = await checkRunCompletion(blueskyRunId);
        if (isComplete) {
            setEnablePolling(false);
        } else {
            setEnablePolling(true);
            if (!isRunFinished) {
                startCompletionPolling();
            }
        }
    }, [blueskyRunId, isRunFinished, stopRetryPolling, startCompletionPolling]);

    // Find the Tiled path
    useEffect(() => {
        const findTiledPath = async (): Promise<boolean> => {
            // Check if blueskyRunId is empty
            const searchConfig: TiledSearchConfig = {path: blueskyRunId};
            if (!blueskyRunId || blueskyRunId.trim() === '') {
                console.log(`[useTiledWriterScatterPlot] Empty blueskyRunId, waiting for run ID`);
                setError('Waiting for run ID');
                setIsLoading(false);
                return false;
            }
            
            try {
                console.log(`[useTiledWriterScatterPlot] Searching for blueskyRunId: ${blueskyRunId}`);
                
                // Step 1: Search for the run ID to see if it exists
                const initialSearchResults = await getSearchResults(searchConfig);
                console.log(`[useTiledWriterScatterPlot] Initial search results:`, initialSearchResults);
                
                if (!initialSearchResults) {
                    console.log(`[useTiledWriterScatterPlot] No results found for blueskyRunId: ${blueskyRunId}`);
                    setError(`Searching for run data... (Run ID: ${blueskyRunId})`);
                    return false;
                }
                
                // Use the original blueskyRunId as the base path
                const basePath = blueskyRunId;
                console.log(`[useTiledWriterScatterPlot] Using base path: ${basePath}`);
                
                // Step 2: Try to find the primary data path
                // First try: /streams/primary (newer tiled writer version)
                const streamsPath = `${basePath}/streams/primary`;
                console.log(`[useTiledWriterScatterPlot] Trying streams path: ${streamsPath}`);
                
                try {
                    const streamsResults = await getSearchResults({path: streamsPath});
                    if (streamsResults) {
                        const finalPath = `${streamsPath}/internal`;
                        await handleSuccessfulPath(finalPath, "streams");
                        return true;
                    }
                } catch (_streamsError) {
                    console.log(`[useTiledWriterScatterPlot] Streams path not found, trying direct primary path`);
                }
                
                // Second try: /primary (older tiled writer version)
                const directPath = `${basePath}/primary`;
                console.log(`[useTiledWriterScatterPlot] Trying direct primary path: ${directPath}`);
                
                try {
                    const directResults = await getSearchResults({path: directPath});
                    if (directResults) {
                        const finalPath = `${directPath}/internal`;
                        await handleSuccessfulPath(finalPath, "direct");
                        return true;
                    }
                } catch (_directError) {
                    console.log(`[useTiledWriterScatterPlot] Direct primary path not found either`);
                }
                
                // If neither path works, but run exists, it might be that data isn't written yet
                setError(`Waiting for scan data to be written... (Run ID: ${blueskyRunId})`);
                return false;
                
            } catch (error) {
                console.error('[useTiledWriterScatterPlot] Error finding Tiled path:', error);
                setError(`Searching for run data... (${error instanceof Error ? error.message : 'Unknown error'})`);
                return false;
            }
        };

        const startSearch = async () => {
            setIsLoading(true);
            setError(null);
            
            // Stop any existing retry polling
            stopRetryPolling();
            
            // Only proceed if we have a valid blueskyRunId
            if (!blueskyRunId || blueskyRunId.trim() === '') {
                setError('Waiting for run ID');
                setIsLoading(false);
                return;
            }

            // Try to find the path immediately
            const success = await findTiledPath();
            
            // If not successful and run is not finished, start retry polling
            if (!success && !isRunFinished) {
                console.log(`[useTiledWriterScatterPlot] Starting retry polling every 2 seconds for run: ${blueskyRunId}`);
                
                const intervalId = setInterval(async () => {
                    console.log(`[useTiledWriterScatterPlot] Retrying path search for run: ${blueskyRunId}`);
                    const retrySuccess = await findTiledPath();
                    
                    if (retrySuccess) {
                        clearInterval(intervalId);
                        setRetryInterval(null);
                        console.log(`[useTiledWriterScatterPlot] Successfully found path on retry, stopping retry polling`);
                    }
                }, 2000);
                
                setRetryInterval(intervalId);
            } else if (!success && isRunFinished) {
                // Run is finished but we couldn't find the path
                setError('Could not find primary data path for this run');
                setIsLoading(false);
            }
        };

        startSearch();
    }, [blueskyRunId, isRunFinished, handleSuccessfulPath, stopRetryPolling]);

    // Cleanup intervals on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
                console.log(`[useTiledWriterScatterPlot] Cleaned up polling interval on unmount`);
            }
            if (retryInterval) {
                clearInterval(retryInterval);
                setRetryInterval(null);
                console.log(`[useTiledWriterScatterPlot] Cleaned up retry interval on unmount`);
            }
        };
    }, [pollingInterval, retryInterval]);

    return {
        tiledPath,
        isLoading,
        error,
        enablePolling,
        startCompletionPolling,
        stopCompletionPolling
    };
};
