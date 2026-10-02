import type { TiledArrayEndpointParams } from '../types/dataOptions';
import type { ArrayStructure } from '../types/structures';

/**
 * Downsampling and slice-string construction for array reads.
 *
 * A faithful port of upstream's `TiledArrayApi`, constants included. The arithmetic decides how much
 * data crosses the network for every image Finch displays, so it is reproduced rather than
 * reinterpreted; where a number looks arbitrary it is upstream's and the comment says so.
 */

/** Fallback byte budget when neither `maxBytesAllowed` nor a client limit is set: 1 MB. */
const DEFAULT_MAX_BYTES = 1_000_000;

/**
 * Bytes per element by NumPy dtype kind, used when the dtype omits `itemsize`.
 *
 * Upstream's table, and deliberately pessimistic — `i` and `u` assume 4 bytes, `f` assumes 8 — so a
 * missing itemsize over-estimates the payload and downsamples a little harder rather than blowing
 * the budget.
 */
const ITEMSIZE_BY_KIND: Record<string, number> = {
    b: 1,
    i: 4,
    u: 4,
    f: 8,
    c: 16,
    m: 8,
    M: 8,
};

/**
 * The structure a caller supplied, from either of the two fields that can carry it.
 *
 * **Validated, not just read.** The structure can arrive from a metadata fetch for a path the
 * caller believed was an array, and a table's structure has no `shape` at all — reading
 * `shape.length` off one threw a `TypeError` from inside the downsampling maths, three layers from
 * the mistake. Anything that is not shaped like an array structure is treated as "no structure",
 * which means no downsampling and lets the server answer with the real error.
 */
export function resolveArrayStructure(
    options: TiledArrayEndpointParams = {},
): ArrayStructure | undefined {
    const candidate = options.structure ?? options.arrayItem?.attributes.structure;
    return isArrayShaped(candidate) ? candidate : undefined;
}

/** Whether a structure has the one field the downsampling maths needs. */
function isArrayShaped(structure: unknown): structure is ArrayStructure {
    if (!structure || typeof structure !== 'object') return false;
    const shape = (structure as { shape?: unknown }).shape;
    return Array.isArray(shape) && shape.every((axis) => typeof axis === 'number');
}

/** Whether enough structure is already in hand to decide downsampling without a round-trip. */
export function hasArrayStructure(options: TiledArrayEndpointParams = {}): boolean {
    return resolveArrayStructure(options) !== undefined;
}

/**
 * The display dimensions of an array.
 *
 * For an RGB array the last three axes are `[height, width, channels]`, or the first three when
 * `channelFirst`. Otherwise the last two are `[height, width]` and there is one channel. A 1-D array
 * is treated as a single row.
 */
export function getDisplayShape(
    structure: ArrayStructure,
    options: TiledArrayEndpointParams = {},
): { height: number; width: number; channels: number } {
    // Defensive: callers reach this through `resolveArrayStructure`, which already rejects a
    // non-array structure, but this is exported and a caller may hand it one directly.
    const shape = Array.isArray(structure?.shape) ? structure.shape : [];

    if (shape.length < 2) {
        return { height: 1, width: shape[0] ?? 1, channels: 1 };
    }
    if (options.isRGB && options.channelFirst && shape.length >= 3 && shape[0] === 3) {
        return { height: shape[1], width: shape[2], channels: 3 };
    }
    if (options.isRGB && shape.length >= 3 && shape[shape.length - 1] === 3) {
        return { height: shape[shape.length - 3], width: shape[shape.length - 2], channels: 3 };
    }
    return { height: shape[shape.length - 2], width: shape[shape.length - 1], channels: 1 };
}

/** Bytes per element, from the dtype's own `itemsize` or, failing that, its kind. */
export function getItemSize(structure: ArrayStructure): number {
    const declared = structure.data_type?.itemsize;
    if (typeof declared === 'number' && declared > 0) return declared;

    const kind = structure.data_type?.kind?.[0];
    return (kind && ITEMSIZE_BY_KIND[kind]) || 1;
}

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
export function computeDownsampleSteps(
    structure: ArrayStructure | undefined,
    options: TiledArrayEndpointParams,
): TiledDownsampleSteps {
    if (options.downSampleRatio && options.downSampleRatio > 1) {
        const step = Math.ceil(options.downSampleRatio);
        return { stepX: step, stepY: step };
    }

    if (!isArrayShaped(structure)) return { stepX: 1, stepY: 1 };

    const { width, height, channels } = getDisplayShape(structure, options);
    const itemSize = getItemSize(structure);
    const budget = options.maxBytesAllowed ?? DEFAULT_MAX_BYTES;
    const estimated = width * height * channels * itemSize;

    if (estimated <= budget) return { stepX: 1, stepY: 1 };

    const step = Math.ceil(Math.sqrt(estimated / budget));
    return { stepX: step, stepY: step };
}

/**
 * Format the `slice` query parameter.
 *
 * `stack` indices are fixed leading axes; the last two axes get the stride. The RGB variants keep
 * the channel axis whole — `:` leading when the channels come first, trailing when they come last —
 * because striding it would mix colours together.
 */
export function formatArraySlice(
    options: TiledArrayEndpointParams,
    steps: TiledDownsampleSteps,
): string {
    const { stepX, stepY } = steps;
    const stack = options.stack ?? [];
    const leading = stack.length > 0 ? `${stack.join(',')},` : '';

    if (options.isRGB && options.channelFirst) return `:,${leading}::${stepY},::${stepX}`;
    if (options.isRGB) return `${leading}::${stepY},::${stepX},:`;
    return `${leading}::${stepY},::${stepX}`;
}

/**
 * Build the `slice` parameter from structure already in hand.
 *
 * Synchronous, and therefore the version `getArrayAsImagePath` uses — it composes a URL and cannot
 * await a metadata fetch. Without a `structure` or `arrayItem` in the options, no downsampling is
 * applied.
 */
export function buildArraySlice(options: TiledArrayEndpointParams = {}): string {
    return formatArraySlice(
        options,
        computeDownsampleSteps(resolveArrayStructure(options), options),
    );
}

/** Fetches an array's structure for a path. Supplied by the client so this module stays acyclic. */
export type StructureFetcher = (path: string) => Promise<ArrayStructure | undefined>;

/**
 * Build the `slice` parameter, fetching the array's structure when it is not already in hand.
 *
 * A failed fetch is swallowed and treated as "no structure", which means no downsampling rather than
 * a failed read. Upstream's behaviour, and the better trade: the caller asked for an array, and
 * returning all of it beats returning nothing because a metadata request was slow.
 */
export async function buildArraySliceAsync(
    arrayPath: string,
    options: TiledArrayEndpointParams = {},
    fetchStructure?: StructureFetcher,
): Promise<string> {
    let structure = resolveArrayStructure(options);

    if (!structure && fetchStructure) {
        try {
            structure = await fetchStructure(arrayPath);
        } catch {
            // Intentionally ignored — see the doc comment.
        }
    }

    return formatArraySlice(options, computeDownsampleSteps(structure, options));
}
