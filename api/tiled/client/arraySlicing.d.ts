import { TiledArrayEndpointParams } from '../types/dataOptions';
import { ArrayStructure } from '../types/structures';
/**
 * The structure a caller supplied, from either of the two fields that can carry it.
 *
 * **Validated, not just read.** The structure can arrive from a metadata fetch for a path the
 * caller believed was an array, and a table's structure has no `shape` at all — reading
 * `shape.length` off one threw a `TypeError` from inside the downsampling maths, three layers from
 * the mistake. Anything that is not shaped like an array structure is treated as "no structure",
 * which means no downsampling and lets the server answer with the real error.
 */
export declare function resolveArrayStructure(options?: TiledArrayEndpointParams): ArrayStructure | undefined;
/** Whether enough structure is already in hand to decide downsampling without a round-trip. */
export declare function hasArrayStructure(options?: TiledArrayEndpointParams): boolean;
/**
 * The display dimensions of an array.
 *
 * For an RGB array the last three axes are `[height, width, channels]`, or the first three when
 * `channelFirst`. Otherwise the last two are `[height, width]` and there is one channel. A 1-D array
 * is treated as a single row.
 */
export declare function getDisplayShape(structure: ArrayStructure, options?: TiledArrayEndpointParams): {
    height: number;
    width: number;
    channels: number;
};
/** Bytes per element, from the dtype's own `itemsize` or, failing that, its kind. */
export declare function getItemSize(structure: ArrayStructure): number;
export interface TiledDownsampleSteps {
    stepX: number;
    stepY: number;
}
/**
 * How far to stride in each axis.
 *
 * An explicit `downSampleRatio` wins outright. Otherwise the payload is estimated from the display
 * shape and item size, and if it exceeds the budget both axes are strided by
 * `ceil(sqrt(overBudget))` — square-rooted because striding both axes reduces the payload
 * quadratically.
 *
 * With no structure available there is nothing to estimate from, so nothing is downsampled. That is
 * upstream's behaviour and the right default: guessing would mean silently returning a different
 * array than asked for.
 */
export declare function computeDownsampleSteps(structure: ArrayStructure | undefined, options: TiledArrayEndpointParams): TiledDownsampleSteps;
/**
 * Format the `slice` query parameter.
 *
 * `stack` indices are fixed leading axes; the last two axes get the stride. The RGB variants keep
 * the channel axis whole — `:` leading when the channels come first, trailing when they come last —
 * because striding it would mix colours together.
 */
export declare function formatArraySlice(options: TiledArrayEndpointParams, steps: TiledDownsampleSteps): string;
/**
 * Build the `slice` parameter from structure already in hand.
 *
 * Synchronous, and therefore the version `getArrayAsImagePath` uses — it composes a URL and cannot
 * await a metadata fetch. Without a `structure` or `arrayItem` in the options, no downsampling is
 * applied.
 */
export declare function buildArraySlice(options?: TiledArrayEndpointParams): string;
/** Fetches an array's structure for a path. Supplied by the client so this module stays acyclic. */
export type StructureFetcher = (path: string) => Promise<ArrayStructure | undefined>;
/**
 * Build the `slice` parameter, fetching the array's structure when it is not already in hand.
 *
 * A failed fetch is swallowed and treated as "no structure", which means no downsampling rather than
 * a failed read. Upstream's behaviour, and the better trade: the caller asked for an array, and
 * returning all of it beats returning nothing because a metadata request was slow.
 */
export declare function buildArraySliceAsync(arrayPath: string, options?: TiledArrayEndpointParams, fetchStructure?: StructureFetcher): Promise<string>;
//# sourceMappingURL=arraySlicing.d.ts.map