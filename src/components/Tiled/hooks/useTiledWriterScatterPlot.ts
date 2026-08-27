import { useMemo } from 'react';
import { useTiledMetadataQuery, useTiledSearchQuery } from '@/api/tiled';
import { cleanTiledInitialPath } from '../utils/tiledUtils';

type UseTiledWriterScatterPlotReturn = {
    /** Resolved Tiled path to the primary stream data, or `null` while searching. */
    tiledPath: string | null;
    /** `true` while the initial path search is in progress. */
    isLoading: boolean;
    /** Human-readable status/error message, or `null` when data is ready. */
    error: string | null;
    /** `true` when the run is still ongoing and data should be refetched. */
    enablePolling: boolean;
};

type UseTiledWriterScatterPlotOptions = {
    /** When `true`, skips retry/completion polling because the run is already complete. Defaults to `false`. */
    isRunFinished?: boolean;
    /** Milliseconds between completion-check polls. Defaults to `5000`. */
    pollingIntervalMs?: number;
    /** The base url for the tiled server, ex) http://localhost:8000/api/v1 */
    tiledBaseUrl?: string;
    /** The initial path to use for the tiled search, ex) beamline531 */
    initialPath?: string;
};

export const useTiledWriterScatterPlot = (
    blueskyRunId: string,
    options: UseTiledWriterScatterPlotOptions = {},
): UseTiledWriterScatterPlotReturn => {
    const { isRunFinished = false, pollingIntervalMs = 5000, tiledBaseUrl, initialPath } = options;

    const startPath =
        initialPath && initialPath.trim() ? `${cleanTiledInitialPath(initialPath)}/` : '';

    const hasRunId = !!blueskyRunId && blueskyRunId.trim() !== '';

    // Step 1: Verify the run exists in Tiled. Retries every 2 s until found (unless finished).
    //
    // A path that is not there yet answers 404, which surfaces as `isError` — the legacy hook
    // swallowed that into `data: null`, so the checks below read the status rather than the data.
    // `refetchInterval` still fires while the query is in an error state, which is what keeps the
    // polling going until the run appears.
    const runQuery = useTiledSearchQuery(
        `${startPath}${blueskyRunId}`,
        undefined,
        {
            enabled: hasRunId,
            retry: false,
            refetchInterval: (query) => (query.state.data || isRunFinished ? false : 2000),
        },
        { baseUrl: tiledBaseUrl },
    );
    const runExists = runQuery.isSuccess;

    // Step 2: Fetch the primary path directly under the run ID.
    const directQuery = useTiledSearchQuery(
        `${startPath}${blueskyRunId}/primary`,
        undefined,
        {
            enabled: runExists,
            retry: false,
            refetchInterval: (query) => (query.state.data || isRunFinished ? false : 2000),
        },
        { baseUrl: tiledBaseUrl },
    );
    const directFound = directQuery.isSuccess;

    const tiledPath = useMemo(() => {
        if (directFound) return `${startPath}${blueskyRunId}/primary/internal`;
        return null;
    }, [directFound, startPath, blueskyRunId]);

    const isLoading = useMemo(() => {
        if (!hasRunId || tiledPath) return false;
        return runQuery.isLoading || directQuery.isLoading;
    }, [hasRunId, tiledPath, runQuery.isLoading, directQuery.isLoading]);

    const error = useMemo(() => {
        if (!hasRunId) return 'Waiting for run ID';
        if (tiledPath || isLoading) return null;
        if (!runExists) return `Searching for run data... (Run ID: ${blueskyRunId})`;
        // The run is there but its primary stream is not — a 404 on that path.
        if (directQuery.isError) {
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
        directQuery.isError,
        isRunFinished,
        blueskyRunId,
    ]);

    // Step 3: has the run finished being written? A bluesky run acquires a `stop` document when it
    // ends, so "has it stopped" and "should the plot keep refetching" are the same question — which
    // makes this a polling query, where it used to be a hand-rolled `setInterval` with its own state,
    // ref and three cleanup effects.
    //
    // The path is prefixed the same way the searches above are. The `checkRunCompletion(blueskyRunId)`
    // this replaces was **not** prefixed, so with an `initialPath` option set it polled a different
    // node than the one the search had just located.
    const completionQuery = useTiledMetadataQuery(
        tiledPath ? `${startPath}${blueskyRunId}` : '',
        {
            enabled: Boolean(tiledPath) && !isRunFinished,
            retry: false,
            select: (item) => item?.attributes?.metadata?.stop !== undefined,
            // Stop polling as soon as a stop document appears.
            refetchInterval: (query) => (query.state.data ? false : pollingIntervalMs),
        },
        { baseUrl: tiledBaseUrl },
    );

    // Ongoing until proven finished. A failed completion check therefore leaves polling on, matching
    // the fail-open behaviour of the old helper, which swallowed its error and returned `false`.
    const enablePolling = isRunFinished ? false : completionQuery.data !== true;

    return { tiledPath, isLoading, error, enablePolling };
};
