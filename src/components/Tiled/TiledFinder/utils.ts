import { tiledStructureIcons } from './icons';
import {
    TiledSearchItem,
    TiledStructures,
    ArrayStructure,
    isStructuredArrayStructure,
    isXArrayStructure,
} from './types';
import { Slider } from './types';

export type RGBInfo = {
    autoRGB: boolean; // metadata.color_mode === 'RGB'
    canToggleRGB: boolean; // shape looks RGB-like but metadata doesn't require it
    isRGB: boolean; // autoRGB OR user toggled
    channelFirst: boolean; // channel is dim[0] rather than dim[N-1]
};

export function detectRGBInfo(
    arrayItem: TiledSearchItem<ArrayStructure>,
    userToggledRGB: boolean,
): RGBInfo {
    const shape = arrayItem.attributes.structure.shape;
    const dims = arrayItem.attributes.structure.dims;
    const colorMode = arrayItem.attributes.metadata?.color_mode as string | undefined;

    const autoRGB = colorMode === 'RGB';
    const canToggleRGB = !autoRGB && shape.length >= 3 && shape[shape.length - 1] === 3;
    const isRGB = autoRGB || (canToggleRGB && userToggledRGB);

    let channelFirst = false;
    if (isRGB) {
        if (dims && dims.indexOf('channel') !== -1) {
            channelFirst = dims.indexOf('channel') === 0;
        } else {
            channelFirst = shape[0] === 3 && shape[shape.length - 1] !== 3;
        }
    }

    return { autoRGB, canToggleRGB, isRGB, channelFirst };
}

/**
 * Generates links for a TiledSearchItem, including a default link
 * @param item - The TiledSearchItem to generate links for
 * @param url - Optional base URL to prepend to the generated links
 * @returns An object containing the generated links with an additional 'default' property
 * @example
 * ```typescript
 * const links = generateLinksForCallback(item, 'http://localhost:8000/api/v1');
 * // Returns: { ...item.links, default: 'http://localhost:8000/api/v1/path/to/item' }
 * ```
 */
export const generateLinksForCallback = (item: TiledSearchItem<TiledStructures>, url?: string) => {
    //this function will create a set of links
    //var exampleLink = "http://127.0.0.1:8000/api/v1/metadata/rec20230606_152011_jong-seto_fungal-mycelia_flat-AQ_fungi2_fast/scale3/image";
    const links = { ...item.links };
    const baseUrl =
        url ??
        (typeof window === 'undefined'
            ? ''
            : `${window.location.protocol}//${window.location.hostname}:8000/api/v1`);
    const path = generateSearchPath(item);
    links.default = baseUrl + '/' + path; //add another link which is the direct path ex)http://127.0.0.1:8000/api/v1/rec20230606_152011_jong-seto_fungal-mycelia_flat-AQ_fungi2_fast/scale3/image
    return links;
};

/**
 * Returns the appropriate icon for a given Tiled structure family
 * @param structureFamily - The structure family type (e.g., 'array', 'table', 'container')
 * @returns The corresponding icon component
 * @example
 * ```typescript
 * const icon = getTiledStructureIcon('array');
 * // Returns: tiledStructureIcons.bracketSquare
 * ```
 */
export const getTiledStructureIcon = (item: TiledSearchItem<TiledStructures>) => {
    const structureFamily = item.attributes.structure_family;
    let icon = tiledStructureIcons.question;
    if (
        structureFamily === 'array' ||
        structureFamily === 'awkward' ||
        structureFamily === 'sparse'
    ) {
        //structured arrays technically are shown as arrays from tiled, but we visually display as a table
        if (isStructuredArrayStructure(item)) {
            icon = tiledStructureIcons.table;
        } else {
            if (isXArrayStructure(item)) {
                icon = tiledStructureIcons.xarray;
            } else {
                icon = tiledStructureIcons.bracketSquare;
            }
        }
    }
    if (structureFamily === 'table') {
        icon = tiledStructureIcons.gridline;
    }
    if (structureFamily === 'container' || structureFamily === 'composite') {
        //some containers are from tiledWriter, so they are containers for bluesky plans. show them with a bluesky folder icon
        if (isItemBlueskyRun(item)) {
            icon = tiledStructureIcons.blueskyRun;
        } else {
            icon = tiledStructureIcons.folder;
        }
    }

    return icon;
};

/**
 * Generates the search path for a TiledSearchItem by combining ancestors and item ID
 * @param item - The TiledSearchItem to generate the path for
 * @param extra - Optional additional string to append to the path
 * @returns The complete search path as a string
 * @example
 * ```typescript
 * const path = generateSearchPath(item, '/metadata');
 * // Returns: 'parent/child/item/metadata' or 'item/metadata' if no ancestors
 * ```
 */
export const generateSearchPath = (
    item: TiledSearchItem<TiledStructures>,
    extra?: string,
): string => {
    const ancestors = item.attributes.ancestors;
    let searchPath: string = ancestors.length > 0 ? item.attributes.ancestors.join('/') + '/' : '';
    searchPath += item.id;
    if (extra) {
        searchPath += `/${extra}`;
    }
    return searchPath;
};

/**
 * Mapping of NumPy data type characters to their byte sizes
 * Used for calculating memory usage and data type information
 * @example
 * ```typescript
 * const floatSize = numpyTypeSizesBytes.f; // Returns: 4 (bytes for float32)
 * const doubleSize = numpyTypeSizesBytes.d; // Returns: 8 (bytes for float64)
 * ```
 */
export const numpyTypeSizesBytes: Record<string, number> = {
    // Numerical Data Types
    b: 1, // int8
    B: 1, // uint8
    h: 2, // int16
    H: 2, // uint16
    i: 4, // int32
    I: 4, // uint32
    l: 8, // int64
    L: 8, // uint64
    q: 8, // int64
    Q: 8, // uint64
    f: 4, // float32
    d: 8, // float64
    g: 16, // float128 (platform-dependent)

    // Complex Number Data Types
    F: 8, // complex64 (2 * float32)
    D: 16, // complex128 (2 * float64)
    G: 32, // complex256 (2 * float128, platform-dependent)

    // Character and String Data Types
    S: 1, // string_ (1 byte per character, fixed length)
    a: 1, // alias for 'S'
    U: 4, // unicode_ (4 bytes per character, fixed length)

    // Boolean Data Type
    '?': 1, // bool_ (True or False)

    // Other Data Types
    O: 8, // object_ (platform-dependent, typically pointer size)
    M: 8, // datetime64
    m: 8, // timedelta64
    V: 1, // void (raw data, size depends on context)
};

/**
 * Opens a URL in a new browser tab with security features enabled
 * @param popoutUrl - The URL to open in the new tab
 * @example
 * ```typescript
 * onPopoutClick('https://example.com');
 * // Opens https://example.com in a new tab
 * ```
 */
export const onPopoutClick = (popoutUrl: string) => {
    if (typeof window === 'undefined') return;
    //open a new tab with the specified URL
    window.open(popoutUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Creates an array of slider configurations based on array dimensions
 * Each slider represents a dimension of a multi-dimensional array, with the last two dimensions typically representing image size
 * @param sliderCount - The number of sliders to create
 * @param shape - Array of dimension sizes for each axis
 * @returns Array of Slider objects with min, max, index, and value properties
 * @example
 * ```typescript
 * const sliders = createSliders(3, [10, 20, 30, 100, 100]);
 * // Returns: [
 * //   { min: 0, max: 9, index: 0, value: 5 },
 * //   { min: 0, max: 19, index: 1, value: 10 },
 * //   { min: 0, max: 29, index: 2, value: 15 }
 * // ]
 * ```
 */
export const createSliders = (sliderCount: number, shape: number[]) => {
    const initialSliders: Slider[] = [];
    //the first values from shape represent the number of stacks, the last two dims are the actual 'image' size
    for (let i = 0; i < sliderCount; i++) {
        const newSlider = {
            min: 0,
            max: shape[i] - 1,
            index: i,
            value: Math.floor(shape[i] / 2),
        };
        initialSliders.push(newSlider);
    }
    return initialSliders;
};

/**
 * Retrieves the last search history from local storage
 * @returns The last search path as a string, or undefined if not found
 * @example
 * ```typescript
 * const lastSearch = getLastSearchFromLocalStorage();
 * // Returns: 'parent/child/item' or undefined
 * ```
 */
export const getLastSearchFromLocalStorage = () => {
    if (typeof window === 'undefined') return undefined;
    const lastSearch = localStorage.getItem('lastSearchHistory');
    if (lastSearch) {
        return lastSearch;
    }
    return undefined;
};

/**
 * Writes a search path to local storage based on a TiledSearchItem or clears it with an empty string
 * @param item - The TiledSearchItem to generate a path from, or an empty string to clear storage
 * @returns The generated search path if item is provided, undefined otherwise
 * @example
 * ```typescript
 * const path = writeSearchPathToLocalStorage(item);
 * // Returns: 'parent/child/item' and saves to localStorage
 *
 * writeSearchPathToLocalStorage('');
 * // Clears the search history in localStorage
 * ```
 */
export const writeSearchPathToLocalStorage = (item: TiledSearchItem<TiledStructures> | '') => {
    if (typeof window === 'undefined') return;
    if (typeof item === 'string' || !item) {
        localStorage.setItem('lastSearchHistory', '');
    } else if (item) {
        const searchPath = generateSearchPath(item);
        localStorage.setItem('lastSearchHistory', searchPath);
        return searchPath;
    }
};

/**
 * Retrieves the API key from local storage
 * @returns The API key as a string if found and not empty, undefined otherwise
 * @example
 * ```typescript
 * const apiKey = getApiKeyFromLocalStorage();
 * // Returns: 'your-api-key' or undefined if not found/empty
 * ```
 */
export const getApiKeyFromLocalStorage = () => {
    if (typeof window === 'undefined') return undefined;
    const apiKey = localStorage.getItem('tiledApiKey');
    if (apiKey) {
        if (apiKey.length === 0) {
            return undefined;
        } else {
            return apiKey;
        }
    }
    return undefined;
};

/**
 * Retrieves authentication tokens (refresh and access tokens) from local storage
 * @returns Object containing refreshToken and accessToken if both exist and are non-empty, undefined otherwise
 * @example
 * ```typescript
 * const auth = getAuthFromLocalStorage();
 * if (auth) {
 *   console.log('Access token:', auth.accessToken);
 *   console.log('Refresh token:', auth.refreshToken);
 * }
 * ```
 */
export const getAuthFromLocalStorage = () => {
    if (typeof window === 'undefined') return undefined;
    const refreshToken = localStorage.getItem('tiledRefreshToken');
    const accessToken = localStorage.getItem('tiledAccessToken');
    if (refreshToken && accessToken) {
        if (refreshToken.length === 0 || accessToken.length === 0) {
            return undefined;
        } else {
            return {
                refreshToken,
                accessToken,
            };
        }
    }
    return undefined;
};

/**
 * Removes authentication tokens from local storage
 * Clears both 'tiledRefreshToken' and 'tiledAccessToken' items
 * @example
 * ```typescript
 * clearAuthFromLocalStorage();
 * // Both tokens are now removed from localStorage
 * ```
 */
export const clearAuthFromLocalStorage = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('tiledRefreshToken');
    localStorage.removeItem('tiledAccessToken');
    localStorage.removeItem('tiledApiKey');
};

/**
 * Saves authentication tokens to local storage
 * @param refreshToken - The refresh token string to store
 * @param accessToken - The access token string to store
 * @example
 * ```typescript
 * saveAuthToLocalStorage('refresh_token_here', 'access_token_here');
 * // Tokens are now saved to localStorage
 * ```
 */
export const saveAuthToLocalStorage = (refreshToken: string, accessToken: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('tiledRefreshToken', refreshToken);
    localStorage.setItem('tiledAccessToken', accessToken);
};

/**
 * Calculates optimal step sizes for image downsampling to stay within memory limits
 * Used to reduce image size when requesting PNG data from large arrays
 * @param arrayItem - The TiledSearchItem containing array structure information
 * @param maxBytesAllowed - Optional maximum bytes allowed (defaults to 1MB if not provided)
 * @returns Object containing stepX and stepY values for downsampling
 * @example
 * ```typescript
 * const steps = generateStepsForImagePath(largeArrayItem, 2000000); // 2MB limit
 * // Returns: { stepX: 2, stepY: 2 } for 4x downsampling if needed
 * ```
 */
export const generateStepsForImagePath = (
    arrayItem: TiledSearchItem<ArrayStructure>,
    maxBytesAllowed?: number,
) => {
    let stepX = 1;
    let stepY = 1;
    const letter = arrayItem.attributes.structure.data_type
        .kind[0] as keyof typeof numpyTypeSizesBytes;
    const bytesPerElement = numpyTypeSizesBytes[letter];
    const shape = arrayItem.attributes.structure.shape;

    const totalImageSizeBytes = shape[shape.length - 1] * shape[shape.length - 2] * bytesPerElement; //last two index are always the frame data to be displayed
    const maxBytes = maxBytesAllowed ? maxBytesAllowed : 1000000; //default to 1MB if not provided
    if (totalImageSizeBytes > maxBytes) {
        const ratio = totalImageSizeBytes / maxBytes;
        const squareStep = Math.ceil(Math.sqrt(ratio));
        //TO DO - downsamplke for rectangular images instead of assumed square
        stepX = squareStep;
        stepY = squareStep;
    }

    return {
        stepX,
        stepY,
    };
};

/**
 * Determines if a TiledSearchItem represents a Bluesky run as written by TiledWriter
 * Checks for container structure family and the BlueskyRun spec inside attributes
 * @param item - The TiledSearchItem to check
 * @returns True if the item is a Bluesky run, false otherwise
 * @example
 * ```typescript
 * if (isItemBlueskyRun(item)) {
 *   console.log('This is a Bluesky experimental run');
 *   // Access Bluesky-specific metadata like plan_name, detectors, etc.
 * }
 * ```
 */
export const isItemBlueskyRun = (item: TiledSearchItem<TiledStructures>) => {
    if (item.attributes.structure_family === 'container') {
        if (item?.attributes?.specs?.[0]?.name === 'BlueskyRun') {
            return true;
        }
    }
    return false;
};

/**
 * Normalizes and validates a URL
 * @param url - Raw URL that might be malformed
 * @param label - Human-readable name for error messages
 * @returns Cleaned URL or undefined if invalid
 */
export function cleanUrl(url: string | undefined, label: string): string | null {
    if (!url || url.trim() === '') {
        return null;
    }

    try {
        let cleanedUrl = url.trim();

        // Remove trailing slashes
        cleanedUrl = cleanedUrl.replace(/\/+$/, '');

        // Add protocol if missing (assume http for local development)
        if (!cleanedUrl.match(/^https?:\/\//)) {
            // Check if it looks like a local address
            if (cleanedUrl.match(/^(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+)/)) {
                cleanedUrl = `http://${cleanedUrl}`;
            } else {
                cleanedUrl = `https://${cleanedUrl}`;
            }
        }

        // Validate by creating URL object
        const urlObj = new URL(cleanedUrl);

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            console.warn(
                `Invalid protocol for ${label}: ${urlObj.protocol}. Only http and https are allowed.`,
            );
            return null;
        }

        return urlObj.toString().replace(/\/$/, ''); // Remove trailing slash again
    } catch (error) {
        console.error(`Invalid URL format for ${label}: "${url}"`, error);
        return null;
    }
}
