import { stripUndefined } from '@/api/shared/requestOptions';
import type {
    TiledArrayAnyEndpointOptions,
    TiledTableAnyEndpointOptions,
} from '../../types/packageAliases';

/**
 * Projections of the array/table endpoint options for use in a cache key.
 *
 * The transport fields can no longer reach here — the hooks keep them in a separate slot and the
 * `TiledArrayEndpointOptions` types have them `Omit`ted — so a stray `signal` rewriting the key on
 * every render, which used to be the hazard this guarded against, is now impossible by construction.
 * What remains is a real distinction: not every *endpoint* option identifies the request.
 *
 * Each hook keys on an explicit allow-list of the fields that change what the server returns. Any new
 * option the package adds is absent from the key until it is added here — deliberately the safe
 * direction: a missing field means an over-shared cache entry a caller can work around with
 * `queryKey`-independent `refetch`, whereas a wrongly-included per-render identity would mean an
 * infinite refetch loop.
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
}

/**
 * Project the cache-relevant fields out of a set of table options.
 *
 * `structure` and `tableItem` are excluded for the same reason as their array counterparts.
 * `partition` is ignored by the `full` endpoint, but including it is harmless — the endpoint itself is
 * part of the key.
 */
export function tableKeyParts(options?: TiledTableAnyEndpointOptions): TiledTableKeyParts {
    if (!options) return {};

    return stripUndefined({
        partition: options.partition,
        format: options.format,
    });
}
