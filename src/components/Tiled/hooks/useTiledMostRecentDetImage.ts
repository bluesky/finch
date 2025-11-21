import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import { checkRunCompletion } from '../utils/tiledUtils';

type UseTiledMostRecentDetImageOptions = {
    pollingIntervalMs?: number;
    tiledBaseUrl?: string;
    enabled?: boolean;
};

type UseTiledMostRecentDetImageReturn = {
    blueskyRunId: string | null;
    isLoading: boolean;
    isRunFinished: boolean;
    error: string | null;
    enablePolling: boolean;
    togglePolling: () => void;
};

export const useTiledMostRecentDetImage = (
    options: UseTiledMostRecentDetImageOptions = {}
): UseTiledMostRecentDetImageReturn => {
    const { 
        pollingIntervalMs = 2000, 
        tiledBaseUrl = 'http://192.168.10.155:8000',
        enabled = true 
    } = options;

    const [enablePolling, setEnablePolling] = useState(enabled);
    const [isRunFinished, setIsRunFinished] = useState<boolean>(false);
    
    // Keep track of current run ID separately from query data
    const currentRunIdRef = useRef<string | null>(null);

    // Function to search for runs with det_image
    //TODO: replace this with function from Tiled api client once implemented
    const searchForDetImage = async (): Promise<string | null> => {
        try { 
            // Get last 10 entries, sorted by most recent
            const searchResponse = await fetch(
                `${tiledBaseUrl}/api/v1/search/?sort=-&page[offset]=0&page[limit]=10`
            );

            if (!searchResponse.ok) {
                throw new Error(`Search failed: ${searchResponse.status}`);
            }

            const searchData = await searchResponse.json();
            const entries = searchData.data || [];

            // Check each entry for det_image
            for (const entry of entries) {
                const runId = entry.id;
                const detImagePath = `${runId}/primary/det_image`;

                try {
                    const detImageResponse = await fetch(
                        `${tiledBaseUrl}/api/v1/metadata/${detImagePath}`
                    );
                    if (detImageResponse.ok) {
                        const detImageData = await detImageResponse.json();
                        // Verify it's an array structure
                        if (detImageData.data.attributes?.structure_family === 'array') {                            
                            // Only return if this is a new/different run ID
                            if (runId !== currentRunIdRef.current) {
                                currentRunIdRef.current = runId;
                                try {
                                    const isComplete = entry.attributes?.metadata?.stop !== undefined;
                                    setIsRunFinished(isComplete);
                                } catch (metadataError) {
                                    console.warn(`[useTiledMostRecentDetImage] Could not check stop key for run ${runId}:`, metadataError);
                                }
                                return runId;
                            } else {
                                //found the same runId, but verify if the run status has changed
                                try {
                                    const isComplete = entry.attributes?.metadata?.stop !== undefined;
                                    if (isComplete !== isRunFinished) {
                                            setIsRunFinished(isComplete);
                                        }
                                } catch (metadataError) {
                                    console.warn(`[useTiledMostRecentDetImage] Could not check stop key for run ${runId}:`, metadataError);
                                }
                                // Same run ID, no change needed
                                return currentRunIdRef.current;
                            }
                        }
                    }
                } catch (detImageError) {
                    continue;
                }
            }
            return currentRunIdRef.current; // Return current if no new runs found

        } catch (error) {
            console.error('[useTiledMostRecentDetImage] Error searching for det_image:', error);
            throw error;
        }
    };

    // TanStack Query for polling
    const {
        data: blueskyRunId,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['tiledMostRecentDetImage', tiledBaseUrl],
        queryFn: searchForDetImage,
        refetchInterval: enablePolling ? pollingIntervalMs : false,
        refetchIntervalInBackground: true,
        retry: 3,
        retryDelay: 1000,
        enabled: enablePolling,
        staleTime: pollingIntervalMs - 500,
        structuralSharing: (oldData, newData) => {
            return oldData === newData ? oldData : newData;
    }
        
    });

    const togglePolling = () => {
        setEnablePolling(prev => !prev);
    };

    return {
        blueskyRunId: blueskyRunId || null,
        isLoading,
        isRunFinished,
        error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
        enablePolling,
        togglePolling
    };
};
