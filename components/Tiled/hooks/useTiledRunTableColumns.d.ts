type UseTiledRunTableColumnsReturn = {
    /** Column names of the run's primary table, or `[]` while none is known. */
    columns: string[];
    /** `true` while the run's table is being located or its metadata read. */
    isLoading: boolean;
};
type UseTiledRunTableColumnsOptions = {
    /** When `true`, skips the polling that waits for an ongoing run's data to appear. */
    isRunFinished?: boolean;
    /** The base url for the tiled server, ex) http://localhost:8000/api/v1 */
    tiledBaseUrl?: string;
    /** The initial path to use for the tiled search, ex) beamline531 */
    initialPath?: string;
};
/**
 * The column names of a bluesky run's primary table.
 *
 * Tiled reports them in the table node's own structure, so this is one metadata request rather than a
 * data fetch — no partition is downloaded to find out what the columns are called.
 *
 * The path to that node is resolved by `useTiledWriterScatterPlot`, the same hook the plot uses; both
 * calls share a query cache entry, so asking here costs no extra requests and the columns arrive in
 * step with the data being plotted.
 */
export declare const useTiledRunTableColumns: (blueskyRunId: string, options?: UseTiledRunTableColumnsOptions) => UseTiledRunTableColumnsReturn;
export {};
//# sourceMappingURL=useTiledRunTableColumns.d.ts.map