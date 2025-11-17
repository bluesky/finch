import { useState, useEffect } from "react";
import { getSearchResults } from "@blueskyproject/tiled";
import { checkRunCompletion } from "../utils/tiledUtils";

type UseTiledWriterScatterPlotReturn = {
    tiledPath: string | null;
    isLoading: boolean;
    error: string | null;
    enablePolling: boolean;
    startCompletionPolling: (pollingIntervalMs?: number) => void;
    stopCompletionPolling: () => void;
};

type UseTiledWriterScatterPlotOptions = {
    isRunFinished?: boolean;
    pollingIntervalMs?: number;
};

export const useTiledWriterScatterPlot = (
    blueskyRunId: string, 
    options: UseTiledWriterScatterPlotOptions = {}
): UseTiledWriterScatterPlotReturn => {
    const { isRunFinished = false, pollingIntervalMs = 5000 } = options;
    
    const [tiledPath, setTiledPath] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enablePolling, setEnablePolling] = useState(!isRunFinished);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    // Function to start polling for completion
    const startCompletionPolling = (customPollingInterval?: number) => {
        console.log(`[useTiledWriterScatterPlot] Starting completion polling for run: ${blueskyRunId}`);
        
        const intervalId = setInterval(async () => {
            const isComplete = await checkRunCompletion(blueskyRunId);
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
    };

    // Function to stop polling
    const stopCompletionPolling = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
            console.log(`[useTiledWriterScatterPlot] Manually stopped polling interval`);
        }
    };

    // Function to handle successful path discovery
    const handleSuccessfulPath = async (finalPath: string, pathType: string) => {
        console.log(`[useTiledWriterScatterPlot] Success! Using ${pathType} path: ${finalPath}`);
        setTiledPath(finalPath);
        setIsLoading(false);
        
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
    };

    // Find the Tiled path
    useEffect(() => {
        const findTiledPath = async () => {
            setIsLoading(true);
            setError(null);
            
            // Check if blueskyRunId is empty
            if (!blueskyRunId || blueskyRunId.trim() === '') {
                console.log(`[useTiledWriterScatterPlot] Empty blueskyRunId, waiting for run ID`);
                setError('Waiting for run ID');
                setIsLoading(false);
                return;
            }
            
            try {
                console.log(`[useTiledWriterScatterPlot] Searching for blueskyRunId: ${blueskyRunId}`);
                
                // Step 1: Search for the run ID to see if it exists
                const initialSearchResults = await getSearchResults(blueskyRunId);
                console.log(`[useTiledWriterScatterPlot] Initial search results:`, initialSearchResults);
                
                if (!initialSearchResults) {
                    console.log(`[useTiledWriterScatterPlot] No results found for blueskyRunId: ${blueskyRunId}`);
                    setError(`No data found for run ID: ${blueskyRunId}`);
                    setIsLoading(false);
                    return;
                }
                
                // Use the original blueskyRunId as the base path
                const basePath = blueskyRunId;
                console.log(`[useTiledWriterScatterPlot] Using base path: ${basePath}`);
                
                // Step 2: Try to find the primary data path
                // First try: /streams/primary (newer tiled writer version)
                const streamsPath = `${basePath}/streams/primary`;
                console.log(`[useTiledWriterScatterPlot] Trying streams path: ${streamsPath}`);
                
                try {
                    const streamsResults = await getSearchResults(streamsPath);
                    if (streamsResults) {
                        const finalPath = `${streamsPath}/internal`;
                        await handleSuccessfulPath(finalPath, "streams");
                        return;
                    }
                } catch (streamsError) {
                    console.log(`[useTiledWriterScatterPlot] Streams path not found, trying direct primary path`);
                }
                
                // Second try: /primary (older tiled writer version)
                const directPath = `${basePath}/primary`;
                console.log(`[useTiledWriterScatterPlot] Trying direct primary path: ${directPath}`);
                
                try {
                    const directResults = await getSearchResults(directPath);
                    if (directResults) {
                        const finalPath = `${directPath}/internal`;
                        await handleSuccessfulPath(finalPath, "direct");
                        return;
                    }
                } catch (directError) {
                    console.log(`[useTiledWriterScatterPlot] Direct primary path not found either`);
                }
                
                // If neither path works
                setError('Could not find primary data path for this run');
                setIsLoading(false);
                
            } catch (error) {
                console.error('[useTiledWriterScatterPlot] Error finding Tiled path:', error);
                setError(`Error searching for data: ${error instanceof Error ? error.message : 'Unknown error'}`);
                setIsLoading(false);
            }
        };

        // Only proceed if we have a valid blueskyRunId
        if (blueskyRunId && blueskyRunId.trim() !== '') {
            findTiledPath();
        } else {
            // Handle empty string case
            setError('Waiting for run ID');
            setIsLoading(false);
        }
    }, [blueskyRunId, isRunFinished]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
                console.log(`[useTiledWriterScatterPlot] Cleaned up polling interval on unmount`);
            }
        };
    }, [pollingInterval]);

    return {
        tiledPath,
        isLoading,
        error,
        enablePolling,
        startCompletionPolling,
        stopCompletionPolling
    };
};
