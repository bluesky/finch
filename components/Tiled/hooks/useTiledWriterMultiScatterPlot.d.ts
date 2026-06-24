type UseTiledWriterMultiScatterPlotReturn = {
    /** Resolved Tiled paths, one per run ID. `null` while the path is still being located. */
    tiledPaths: (string | null)[];
    /** `true` while any path is still being resolved. */
    isLoading: boolean;
    /** Per-run error/status messages. Empty array when all paths resolved successfully. */
    errors: (string | null)[];
};
type UseTiledWriterMultiScatterPlotOptions = {
    /** The base URL for the Tiled server, e.g. `http://localhost:8000/api/v1`. */
    tiledBaseUrl?: string;
};
export declare const useTiledWriterMultiScatterPlot: (blueskyRunIds: string[], options?: UseTiledWriterMultiScatterPlotOptions) => UseTiledWriterMultiScatterPlotReturn;
export {};
//# sourceMappingURL=useTiledWriterMultiScatterPlot.d.ts.map