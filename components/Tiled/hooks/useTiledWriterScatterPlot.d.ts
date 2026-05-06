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
export declare const useTiledWriterScatterPlot: (blueskyRunId: string, options?: UseTiledWriterScatterPlotOptions) => UseTiledWriterScatterPlotReturn;
export {};
//# sourceMappingURL=useTiledWriterScatterPlot.d.ts.map