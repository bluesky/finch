import { type TiledItemLinks } from '@/api/tiled';

/**
 * Extracts the Tiled node path from a `TiledItemLinks` object.
 * The path is the segment of the `self` URL that follows `/metadata/` and can be
 * passed directly as the `path` prop to components such as `TiledScatterPlot`.
 */
export const getPathFromLinks = (links: TiledItemLinks) => {
    //given a links object from Tiled (inserted on the 'select' button in <Tiled/>) return the path to use as a prop in other components
    const self = links?.self;
    if (!self) {
        throw new Error('No self link found in TiledItemLinks');
    }
    //the path always follows the 'metadata' segment in the URL
    // ex) "self": "http://localhost:8000/api/v1/metadata/84a5d02c-c5c9-4054-a84a-ff715f02d71a/streams/primary/internal"
    const url = new URL(self);
    const pathIndex = url.pathname.indexOf('/metadata/');
    if (pathIndex === -1) {
        throw new Error('No metadata segment found in self link URL');
    }
    const path = url.pathname.substring(pathIndex + '/metadata'.length);
    return path;
};

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
export const cleanTiledInitialPath = (path: string | undefined): string | undefined => {
    if (!path) return undefined;
    // Remove leading and trailing slashes and whitespace
    const cleanedPath = path.trim().replace(/^\/+|\/+$/g, '');
    return cleanedPath || undefined; // Return undefined if the cleaned path is empty
};
