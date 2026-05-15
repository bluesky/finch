import { useQuery } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { useTiledApiUrls } from '@/utils/apiUtils';

type UseTiledMostRecentDetImageOptions = {
    /** Milliseconds between Tiled search polls. Defaults to `2000`. */
    pollingIntervalMs?: number;
    /** Base URL of the Tiled server. Defaults to `'http://localhost:8000/api/v1'`. */
    tiledBaseUrl?: string;
    /** When `false`, polling is disabled on mount. Defaults to `true`. */
    enabled?: boolean;
};

type UseTiledMostRecentDetImageReturn = {
    /** Bluesky run UID of the most recent run that contains a `det_image` array, or `null` if none found. */
    blueskyRunId: string | null;
    /** `true` while the initial search query is in flight. */
    isLoading: boolean;
    /** `true` when the current run has a stop document (i.e. data collection is complete). */
    isRunFinished: boolean;
    /** Human-readable error message, or `null` when no error has occurred. */
    error: string | null;
    /** `true` when live polling is active. */
    enablePolling: boolean;
    /** Toggles live polling on or off. */
    togglePolling: () => void;
};

export const useTiledMostRecentDetImage = (
    options: UseTiledMostRecentDetImageOptions = {},
): UseTiledMostRecentDetImageReturn => {
    const { pollingIntervalMs = 2000, tiledBaseUrl, enabled = true } = options;

    const { httpBaseUrl } = useTiledApiUrls();
    const tiledBaseUrlFinal = tiledBaseUrl || httpBaseUrl;

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
                `${tiledBaseUrlFinal}/search/?sort=-&page[offset]=0&page[limit]=10`,
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
                        `${tiledBaseUrlFinal}/metadata/${detImagePath}`,
                    );
                    if (detImageResponse.ok) {
                        const detImageData = await detImageResponse.json();
                        // Verify it's an array structure
                        if (detImageData.data.attributes?.structure_family === 'array') {
                            // Only return if this is a new/different run ID
                            if (runId !== currentRunIdRef.current) {
                                currentRunIdRef.current = runId;
                                try {
                                    const isComplete =
                                        entry.attributes?.metadata?.stop !== undefined;
                                    setIsRunFinished(isComplete);
                                } catch (metadataError) {
                                    console.warn(
                                        `[useTiledMostRecentDetImage] Could not check stop key for run ${runId}:`,
                                        metadataError,
                                    );
                                }
                                return runId;
                            } else {
                                //found the same runId, but verify if the run status has changed
                                try {
                                    const isComplete =
                                        entry.attributes?.metadata?.stop !== undefined;
                                    if (isComplete !== isRunFinished) {
                                        setIsRunFinished(isComplete);
                                    }
                                } catch (metadataError) {
                                    console.warn(
                                        `[useTiledMostRecentDetImage] Could not check stop key for run ${runId}:`,
                                        metadataError,
                                    );
                                }
                                // Same run ID, no change needed
                                return currentRunIdRef.current;
                            }
                        }
                    }
                } catch (_detImageError) {
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
        refetch: _refetch,
    } = useQuery({
        queryKey: ['tiledMostRecentDetImage', tiledBaseUrlFinal],
        queryFn: searchForDetImage,
        refetchInterval: enablePolling ? pollingIntervalMs : false,
        refetchIntervalInBackground: true,
        retry: 3,
        retryDelay: 1000,
        enabled: enablePolling,
        staleTime: pollingIntervalMs - 500,
        structuralSharing: (oldData, newData) => {
            return oldData === newData ? oldData : newData;
        },
    });

    const togglePolling = () => {
        setEnablePolling((prev) => !prev);
    };

    return {
        blueskyRunId: blueskyRunId || null,
        isLoading,
        isRunFinished,
        error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
        enablePolling,
        togglePolling,
    };
};
