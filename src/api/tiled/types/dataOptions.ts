import type { TiledFormatName } from '../client/formats';
import type { TiledRequestOptions } from './requestOptions';
import type { TiledSearchItem, TiledTableJSONResponse, TiledTableRow } from './nodes';
import type { ArrayStructure, RaggedStructure, TableStructure } from './structures';

/**
 * Options and return types for the array, table and node data endpoints.
 *
 * These replace `packageAliases.ts`, which derived them from `@blueskyproject/tiled`'s method
 * signatures because the package would not export them. Now that the client lives here they are
 * stated directly — same shapes, same names, and the derivation comments that used to explain the
 * contortion are gone.
 *
 * The **endpoint / transport split** is preserved and is the thing to understand. The package
 * merged them: its `TiledArrayRequestOptions extends TiledRequestOptions`, so `stack` and `baseUrl`
 * arrived in one object. The hooks keep them in separate slots, so `requestOptions` means transport
 * in a Tiled hook exactly as it does in a queue-server hook. Each `…EndpointOptions` type below is
 * its full options type with the transport keys removed; `hooks/typeTests.ts` asserts that no
 * transport key survives.
 */

/** A search item whose structure is specifically an array. */
export type TiledArrayItem = TiledSearchItem<ArrayStructure>;
/** A search item whose structure is specifically a table. */
export type TiledTableItem = TiledSearchItem<TableStructure>;
/** A search item whose structure is specifically a ragged array. */
export type TiledRaggedItem = TiledSearchItem<RaggedStructure>;

// #region arrays

/**
 * Parameters shared by every array read.
 *
 * `downSampleRatio` and `maxBytesAllowed` are alternative ways to ask for less data: the first is
 * explicit, the second lets the client compute a step from the array's shape and item size. Either
 * needs the array's structure, which is why `structure` / `arrayItem` are accepted — passing one
 * saves a metadata round-trip, and without one the client fetches it.
 */
export interface TiledArrayEndpointParams {
    /**
     * Downsample ratio: `1` is every pixel, `2` every other, `4` every fourth.
     * Takes precedence over `maxBytesAllowed`.
     */
    downSampleRatio?: number;
    /**
     * Cap on the returned payload. The client computes a downsample step from the array's shape and
     * dtype so the result stays under it. Defaults to the client's `maxArrayBytes` when set.
     */
    maxBytesAllowed?: number;
    /**
     * Which frame to take from a higher-dimensional array. For `[frames, height, width]`,
     * `stack: [5]` is frame 5.
     */
    stack?: number[];
    /** The array's structure, to avoid a secondary metadata request. */
    structure?: ArrayStructure;
    /** The whole array item, which also supplies the structure. */
    arrayItem?: TiledArrayItem;
    /** Treat a 3D array as one RGB image rather than a stack of grayscale frames. */
    isRGB?: boolean;
    /** With `isRGB`, true when the channel axis is first (`[3, h, w]`) rather than last. */
    channelFirst?: boolean;
}

/** The array output formats `getArrayAs` accepts. */
export type TiledArrayReturnType = 'JSON' | 'PNG' | 'BUFFER' | 'IMAGE_PATH';

/** What each array format resolves to. */
export interface TiledArrayReturnMap {
    JSON: number[][];
    PNG: Blob;
    BUFFER: ArrayBuffer;
    IMAGE_PATH: string;
}

export type TiledArrayJSONEndpointOptions = TiledArrayEndpointParams & {
    format?: 'application/json';
};
export type TiledArrayPngEndpointOptions = TiledArrayEndpointParams & { format?: 'image/png' };
export type TiledArrayBufferEndpointOptions = TiledArrayEndpointParams & {
    format?: 'application/octet-stream';
};
export type TiledArrayImagePathEndpointOptions = TiledArrayEndpointParams & {
    format?: 'image/png' | 'image/tiff';
};

/** Per-format array *endpoint* options, indexable by {@link TiledArrayReturnType}. */
export interface TiledArrayEndpointOptionsMap {
    JSON: TiledArrayJSONEndpointOptions;
    PNG: TiledArrayPngEndpointOptions;
    BUFFER: TiledArrayBufferEndpointOptions;
    IMAGE_PATH: TiledArrayImagePathEndpointOptions;
}

/** Array endpoint options accepted by the generic dispatcher. */
export type TiledArrayAnyEndpointOptions = TiledArrayEndpointParams & { format?: string };

/** Endpoint parameters **and** transport in one object — what a client method takes. */
export interface TiledArrayRequestOptions extends TiledRequestOptions, TiledArrayEndpointParams {}

export type TiledArrayJSONOptions = TiledArrayRequestOptions & { format?: 'application/json' };
export type TiledArrayPngOptions = TiledArrayRequestOptions & { format?: 'image/png' };
export type TiledArrayBufferOptions = TiledArrayRequestOptions & {
    format?: 'application/octet-stream';
};
export type TiledArrayImagePathOptions = TiledArrayRequestOptions & {
    format?: 'image/png' | 'image/tiff';
};
export type TiledArrayAnyOptions = TiledArrayRequestOptions & { format?: string };

/** Per-format array options, indexable by {@link TiledArrayReturnType}. */
export interface TiledArrayOptionsMap {
    JSON: TiledArrayJSONOptions;
    PNG: TiledArrayPngOptions;
    BUFFER: TiledArrayBufferOptions;
    IMAGE_PATH: TiledArrayImagePathOptions;
}

// #endregion

// #region tables

/** Parameters shared by every table read. */
export interface TiledTableEndpointParams {
    /** Which partition to read. Tiled partitions are 0-based; defaults to `0`. */
    partition?: number;
    /** The table's structure, to avoid a secondary structure request. */
    structure?: TableStructure;
    /** The whole table item, which also supplies the structure. */
    tableItem?: TiledTableItem;
    /**
     * Restrict the response to these columns.
     *
     * New — the package sent no `column` parameter, so every read returned the whole table. On a
     * wide table this is the difference between a few columns and a few hundred.
     */
    column?: string[];
}

/** `'JSON'` for column-oriented, `'JSON_SEQ'` for row-oriented. */
export type TiledTableReturnType = 'JSON' | 'JSON_SEQ';

/** Which table endpoint to read: one partition or every partition. */
export type TiledTableEndpoint = 'partition' | 'full';

/** What each table format resolves to. */
export interface TiledTableReturnMap {
    /** Column-oriented: `{ colA: [...], colB: [...] }`. */
    JSON: TiledTableJSONResponse;
    /** Row-oriented: `[{ colA, colB }, …]`. */
    JSON_SEQ: TiledTableRow[];
}

export type TiledTableJSONEndpointOptions = TiledTableEndpointParams & {
    format?: 'application/json';
};
export type TiledTableJSONSequenceEndpointOptions = TiledTableEndpointParams & {
    format?: 'application/json-seq';
};

/** Per-format table *endpoint* options, indexable by {@link TiledTableReturnType}. */
export interface TiledTableEndpointOptionsMap {
    JSON: TiledTableJSONEndpointOptions;
    JSON_SEQ: TiledTableJSONSequenceEndpointOptions;
}

/** Table endpoint options accepted by the generic dispatcher. */
export type TiledTableAnyEndpointOptions = TiledTableEndpointParams & { format?: string };

/** Endpoint parameters **and** transport in one object — what a client method takes. */
export interface TiledTableRequestOptions extends TiledRequestOptions, TiledTableEndpointParams {}

export type TiledTableJSONOptions = TiledTableRequestOptions & { format?: 'application/json' };
export type TiledTableJSONSequenceOptions = TiledTableRequestOptions & {
    format?: 'application/json-seq';
};
export type TiledTableAnyOptions = TiledTableRequestOptions & { format?: string };

/** Per-format table options, indexable by {@link TiledTableReturnType}. */
export interface TiledTableOptionsMap {
    JSON: TiledTableJSONOptions;
    JSON_SEQ: TiledTableJSONSequenceOptions;
}

/** A column-oriented table response: `{ colA: [...], colB: [...] }`. */
export type TiledTableJSONData = TiledTableReturnMap['JSON'];

/** A row-oriented table response: `[{ colA, colB }, …]`. */
export type TiledTableJSONSequenceData = TiledTableReturnMap['JSON_SEQ'];

// #endregion

// #region container, node, awkward and ragged

/**
 * Options for the container / node / awkward / ragged reads.
 *
 * These endpoints have no partition or downsampling story — they take a field selection and a
 * format, and the format decides the return type. `format` is a {@link TiledFormatName} rather than
 * a media type so the client can pick the right axios `responseType`; pass a raw media type when a
 * server supports one this client does not name.
 */
export interface TiledNodeEndpointParams<Format extends TiledFormatName = TiledFormatName> {
    /** Restrict the response to these fields (child keys, or columns for a table). */
    field?: string[];
    /** The representation to request. Defaults to `'JSON'`. */
    format?: Format | string;
    /** Sets the download filename the server suggests, for formats that produce a file. */
    filename?: string;
}

export interface TiledNodeRequestOptions<Format extends TiledFormatName = TiledFormatName>
    extends TiledRequestOptions, TiledNodeEndpointParams<Format> {}

/** Options for a ragged read — a slice, rather than a field selection. */
export interface TiledRaggedEndpointParams {
    /** Tiled slice expression, e.g. `'::2'`. */
    slice?: string;
    format?: TiledFormatName | string;
    filename?: string;
    structure?: RaggedStructure;
}

export interface TiledRaggedRequestOptions extends TiledRequestOptions, TiledRaggedEndpointParams {}

/** Options for an awkward buffers read. */
export interface TiledAwkwardEndpointParams {
    /** Which buffers to fetch, by form key. Omit for all of them. */
    form_key?: string[];
    format?: TiledFormatName | string;
    filename?: string;
}

export interface TiledAwkwardRequestOptions
    extends TiledRequestOptions, TiledAwkwardEndpointParams {}

// #endregion
