import type { TiledArrayAnyOptions, TiledTableAnyOptions } from '../../types/packageAliases';

/**
 * Projections of the array/table option objects for use in a cache key.
 *
 * The array and table hooks take one combined options object, because the package's
 * `TiledArrayRequestOptions` / `TiledTableRequestOptions` extend `TiledRequestOptions`. That object
 * **must not** go into a query key as-is:
 *
 * - `signal` is a fresh `AbortSignal` on most renders. In a key it rewrites the key every render,
 *   which refetches every render, forever.
 * - `client` is an axios instance, and `arrayItem` can be a whole Tiled item. Hashing either is
 *   wasteful, and neither identifies the *request*.
 * - `baseUrl`, `initialPath` and `pathMode` are already folded into the scope by
 *   `useTiledQueryScope`, so repeating them would double-count.
 *
 * So each hook keys on an explicit allow-list of the fields that change what the server returns. Any
 * new option the package adds is absent from the key until it is added here — deliberately the safe
 * direction: a missing field means an over-shared cache entry a caller can work around with
 * `queryKey`-independent `refetch`, whereas a wrongly-included field means an infinite refetch loop.
 */

/** The array options that change the response. */
export interface TiledArrayKeyParts {
    readonly stack?: number[];
    readonly downSampleRatio?: number;
    readonly maxBytesAllowed?: number;
    readonly format?: string;
    readonly isRGB?: boolean;
    readonly channelFirst?: boolean;
}

/**
 * Project the cache-relevant fields out of a set of array options.
 *
 * `structure` and `arrayItem` are excluded on purpose: they only let the client skip a metadata
 * round-trip on the way to the same bytes, so two calls that differ only in whether they passed one
 * are the same request and should share a cache entry.
 */
export function arrayKeyParts(options?: TiledArrayAnyOptions): TiledArrayKeyParts {
    if (!options) return {};

    return stripUndefined({
        stack: options.stack,
        downSampleRatio: options.downSampleRatio,
        maxBytesAllowed: options.maxBytesAllowed,
        format: options.format,
        isRGB: options.isRGB,
        channelFirst: options.channelFirst,
    });
}

/** The table options that change the response. */
export interface TiledTableKeyParts {
    readonly partition?: number;
    readonly format?: string;
}

/**
 * Project the cache-relevant fields out of a set of table options.
 *
 * `structure` and `tableItem` are excluded for the same reason as their array counterparts.
 * `partition` is ignored by the `full` endpoint, but including it is harmless — the endpoint itself is
 * part of the key.
 */
export function tableKeyParts(options?: TiledTableAnyOptions): TiledTableKeyParts {
    if (!options) return {};

    return stripUndefined({
        partition: options.partition,
        format: options.format,
    });
}

/**
 * Drop `undefined`-valued keys.
 *
 * TanStack's key hash treats `{}` and `{ stack: undefined }` as different strings, so leaving the
 * holes in would give `getArrayAsJSON(path)` and `getArrayAsJSON(path, {})` separate cache entries
 * for one identical request.
 */
function stripUndefined<T extends object>(value: T): T {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
        if (entry !== undefined) result[key] = entry;
    }
    return result as T;
}
