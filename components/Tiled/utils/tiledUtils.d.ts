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
/**
 * Returns a cleaned version of the initial path for Tiled searches.
 * Removes leading and trailing slashes and whitespace.
 * Returns `undefined` if the cleaned path is empty or if the input is `undefined`.
 *
 * @example
 * cleanTiledInitialPath('  /beamline531/  ') // returns 'beamline531'
 * cleanTiledInitialPath('/beamline531/') // returns 'beamline531'
 * cleanTiledInitialPath('') // returns undefined
 * cleanTiledInitialPath(undefined) // returns undefined
 * @param path
 * @returns
 */
export declare const cleanTiledInitialPath: (path: string | undefined) => string | undefined;
//# sourceMappingURL=tiledUtils.d.ts.map