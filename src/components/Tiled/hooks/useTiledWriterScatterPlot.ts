import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchByIdQuery } from '@/api/tiled/hooks';
import { checkRunCompletion } from '../utils/tiledUtils';

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
    options: UseTiledWriterScatterPlotOptions = {},
): UseTiledWriterScatterPlotReturn => {
    const { isRunFinished = false, pollingIntervalMs = 5000, tiledBaseUrl } = options;

    const [enablePolling, setEnablePolling] = useState(!isRunFinished);
    const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(
        null,
    );
    const completionStartedRef = useRef(false);

    const hasRunId = !!blueskyRunId && blueskyRunId.trim() !== '';

    // Step 1: Verify the run exists in Tiled. Retries every 2 s until found (unless finished).
    const runQuery = useSearchByIdQuery(
        { path: blueskyRunId },
        {
            enabled: hasRunId,
            retry: false,
            refetchInterval: (query) => (query.state.data || isRunFinished ? false : 2000),
        },
    );
    const runExists = !!runQuery.data;

    // Step 2: Fetch the primary path directly under the run ID.
    const directQuery = useSearchByIdQuery(
        { path: `${blueskyRunId}/primary` },
        {
            enabled: runExists,
            retry: false,
            refetchInterval: (query) => (query.state.data || isRunFinished ? false : 2000),
        },
    );
    const directFound = directQuery.isSuccess && !!directQuery.data;

    const tiledPath = useMemo(() => {
        if (directFound) return `${blueskyRunId}/primary/internal`;
        return null;
    }, [directFound, blueskyRunId]);

    const isLoading = useMemo(() => {
        if (!hasRunId || tiledPath) return false;
        return runQuery.isLoading || directQuery.isLoading;
    }, [hasRunId, tiledPath, runQuery.isLoading, directQuery.isLoading]);

    const error = useMemo(() => {
        if (!hasRunId) return 'Waiting for run ID';
        if (tiledPath || isLoading) return null;
        if (!runExists) return `Searching for run data... (Run ID: ${blueskyRunId})`;
        if (directQuery.isSuccess && !directQuery.data) {
            return isRunFinished
                ? 'Could not find primary data path for this run'
                : `Waiting for scan data to be written... (Run ID: ${blueskyRunId})`;
        }
        return null;
    }, [
        hasRunId,
        tiledPath,
        isLoading,
        runExists,
        directQuery.isSuccess,
        directQuery.data,
        isRunFinished,
        blueskyRunId,
    ]);

    const startCompletionPolling = useCallback(
        (customPollingInterval?: number) => {
            const intervalId = setInterval(async () => {
                const isComplete = await checkRunCompletion(blueskyRunId, tiledBaseUrl);
                if (isComplete) {
                    setEnablePolling(false);
                    clearInterval(intervalId);
                    setPollingInterval(null);
                } else {
                    setEnablePolling(true);
                }
            }, customPollingInterval ?? pollingIntervalMs);
            setPollingInterval(intervalId);
        },
        [blueskyRunId, tiledBaseUrl, pollingIntervalMs],
    );

    const stopCompletionPolling = useCallback(() => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }
    }, [pollingInterval]);

    // Once the path is resolved for the first time, check completion and start polling if needed.
    useEffect(() => {
        if (!tiledPath || completionStartedRef.current) return;
        completionStartedRef.current = true;
        checkRunCompletion(blueskyRunId, tiledBaseUrl).then((isComplete) => {
            if (isComplete) {
                setEnablePolling(false);
            } else {
                setEnablePolling(true);
                if (!isRunFinished) startCompletionPolling();
            }
        });
    }, [tiledPath, blueskyRunId, tiledBaseUrl, isRunFinished, startCompletionPolling]);

    // Reset polling state when the run ID changes.
    useEffect(() => {
        completionStartedRef.current = false;
        setEnablePolling(!isRunFinished);
        setPollingInterval((prev) => {
            if (prev) clearInterval(prev);
            return null;
        });
    }, [blueskyRunId, isRunFinished]);

    // Cleanup on unmount.
    useEffect(() => {
        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [pollingInterval]);

    return {
        tiledPath,
        isLoading,
        error,
        enablePolling,
        startCompletionPolling,
        stopCompletionPolling,
    };
};
