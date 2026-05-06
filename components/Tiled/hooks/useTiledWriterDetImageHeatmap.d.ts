type UseTiledWriterDetImageHeatmapOptions = {
    /** When `true`, disables polling because the run is already complete. Defaults to `false`. */
    isRunFinished?: boolean;
    /** Milliseconds between Tiled data refetches while the run is ongoing. Defaults to `2000`. */
    pollingIntervalMs?: number;
    /** Base URL of the Tiled server. Defaults to `'http://localhost:8000/api/v1'`. */
    tiledBaseUrl?: string;
};
export declare function useTiledWriterDetImageHeatmap(blueskyRunId: string | null, options?: UseTiledWriterDetImageHeatmapOptions): {
    tiledPath: string | null;
    isLoading: boolean;
    error: string | null;
    enablePolling: boolean;
};
export {};
//# sourceMappingURL=useTiledWriterDetImageHeatmap.d.ts.map