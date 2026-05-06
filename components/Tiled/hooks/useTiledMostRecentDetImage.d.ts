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
export declare const useTiledMostRecentDetImage: (options?: UseTiledMostRecentDetImageOptions) => UseTiledMostRecentDetImageReturn;
export {};
//# sourceMappingURL=useTiledMostRecentDetImage.d.ts.map