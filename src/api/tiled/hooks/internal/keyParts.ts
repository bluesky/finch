import { stripUndefined } from '@/api/shared/requestOptions';
import type {
    TiledArrayAnyEndpointOptions,
    TiledTableAnyEndpointOptions,
} from '../../types/dataOptions';

/**
 * Projections of the array/table endpoint options for use in a cache key.
 *
 * The transport fields can no longer reach here — the hooks keep them in a separate slot and the
 * `TiledArrayEndpointOptions` types have them `Omit`ted — so a stray `signal` rewriting the key on
 * every render, which used to be the hazard this guarded against, is now impossible by construction.
 * What remains is a real distinction: not every *endpoint* option identifies the request.
 *
 * Each hook keys on an explicit allow-list of the fields that change what the server returns, so a
 * newly added option is absent from the key until it is added here.
 *
 * **That default is not automatically safe.** It used to be described as the safe direction, on the
 * grounds that an over-shared entry is recoverable while a per-render identity in a key is an
 * infinite refetch loop. The second half holds; the first does not. If the omitted option changes
 * the response — as `column` does — the two requests collide and each can be served the other's
 * data, which is silent and wrong rather than merely stale.
 *
 * So the rule when adding an option is: **include it unless it provably cannot change the bytes the
 * server sends.** `structure` and `arrayItem` meet that bar (they only skip a metadata round-trip on
 * the way to identical data); nothing else so far does.
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
export function arrayKeyParts(options?: TiledArrayAnyEndpointOptions): TiledArrayKeyParts {
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
    readonly column?: string[];
}

/**
 * Project the cache-relevant fields out of a set of table options.
 *
 * `structure` and `tableItem` are excluded for the same reason as their array counterparts.
 * `partition` is ignored by the `full` endpoint, but including it is harmless — the endpoint itself is
 * part of the key.
 *
 * **`column` is included, and must be.** It narrows the response to the named columns, so a read of
 * `['energy']` and a read of `['intensity']` are different data from the same path — leaving it out
 * gave them one cache entry and let each display the other's columns. The allow-list in this file is
 * safe in the *missing a field* direction only when the omitted field does not change the response;
 * `column` does, which is what made this a bug rather than an over-shared entry.
 *
 * It is keyed by value, not identity: TanStack hashes keys with `JSON.stringify`, so a freshly
 * built array of the same column names each render is still the same key. Order matters, though —
 * `['a','b']` and `['b','a']` are two entries for one response. Sorting here would be wrong: the
 * server echoes the order, and a caller who reordered deliberately would get the previous order's
 * data back.
 */
export function tableKeyParts(options?: TiledTableAnyEndpointOptions): TiledTableKeyParts {
    if (!options) return {};

    return stripUndefined({
        partition: options.partition,
        format: options.format,
        // Empty means "every column", which is what an absent `column` means too — so they are the
        // same request and should share an entry rather than getting one keyed on `[]`.
        column: options.column?.length ? options.column : undefined,
    });
}
