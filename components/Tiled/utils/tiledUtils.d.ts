import { TiledItemLinks } from '@blueskyproject/tiled';
/**
 * Extracts the Tiled node path from a `TiledItemLinks` object.
 * The path is the segment of the `self` URL that follows `/metadata/` and can be
 * passed directly as the `path` prop to components such as `TiledScatterPlot`.
 */
export declare const getPathFromLinks: (links: TiledItemLinks) => string;
/**
 * Checks if a Bluesky run is complete by looking for the 'stop' property in metadata
 * @param path - The bluesky run ID to check
 * @returns Promise<boolean> - true if run is complete, false if ongoing
 */
export declare const checkRunCompletion: (path: string, url?: string) => Promise<boolean>;
//# sourceMappingURL=tiledUtils.d.ts.map