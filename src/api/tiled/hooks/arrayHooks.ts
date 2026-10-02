import { useMemo } from 'react';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { requireArg } from '@/api/shared/errors';
import { mergeRequestOptions } from '@/api/shared/requestOptions';
import type { TiledBinaryBody, TiledRequestOptions } from '../types/common';
import type {
    TiledArrayBufferEndpointOptions,
    TiledArrayEndpointOptionsMap,
    TiledArrayImagePathEndpointOptions,
    TiledArrayJSONEndpointOptions,
    TiledArrayOptionsMap,
    TiledArrayPngEndpointOptions,
    TiledArrayReturnMap,
    TiledArrayReturnType,
} from '../types/dataOptions';
import { arrayKeyParts } from './internal/keyParts';
import { useTiledMutation } from './internal/useTiledMutation';
import { useTiledQuery } from './internal/useTiledQuery';
import { TILED_MUTATION_INVALIDATIONS } from './invalidation';
import { tiledQueryKeys, type TiledQueryKeyFor } from './queryKeys';
import type { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
import { useTiledClient, useTiledQueryScope } from './useTiledClient';

/**
 * Array hooks — four format reads, a chunk read, a URL builder and three writes.
 *
 * These take an extra slot the search hooks do not — `arrayOptions`, for the parameters that change
 * what the server returns: `stack`, `downSampleRatio`, `maxBytesAllowed`, `format`. The client's own
 * option types bundle those together with the transport fields (`TiledArrayRequestOptions` extends
 * `TiledRequestOptions`); the hooks keep them apart and recombine before calling through, so
 * `requestOptions` means transport here exactly as it does on every other Finch hook.
 *
 * Only the options that change what the server returns take part in the query key — see
 * `internal/keyParts.ts`. In particular `structure` / `arrayItem` do not: they let the client skip a
 * metadata round-trip on the way to identical bytes.
 *
 * All of them stay idle while `arrayPath` is empty.
 */

/**
 * Read an array in whichever format `type` names.
 *
 * The generic dispatcher — prefer the typed hooks below, which infer `data` without a type argument.
 * `'IMAGE_PATH'` is accepted for completeness but resolves synchronously; prefer
 * `useTiledArrayImagePath`.
 *
 * @param arrayPath **Required.** Tiled path to the array. Idle while empty.
 * @param type `'JSON' | 'PNG' | 'BUFFER' | 'IMAGE_PATH'`. Part of the query key.
 * @param arrayOptions Array parameters: `stack`, `downSampleRatio`, `maxBytesAllowed`, `structure`, …
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export function useTiledArrayAsQuery<
    T extends TiledArrayReturnType,
    TData = TiledArrayReturnMap[T],
>(
    arrayPath: string,
    type: T,
    arrayOptions?: TiledArrayEndpointOptionsMap[T],
    queryOptions?: FinchQueryOptions<
        TiledArrayReturnMap[T],
        TData,
        TiledQueryKeyFor<'array'>,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.array(scope, {
            arrayPath,
            type,
            options: arrayKeyParts(arrayOptions),
        }),
        // The cast is unavoidable here and only here: TypeScript cannot prove that spreading the two
        // halves of a generic-indexed type reconstitutes it, even though `Omit` guarantees the keys
        // are disjoint. The four concrete hooks below need no cast.
        fetch: (client, request) =>
            client.getArrayAs<T>(arrayPath, type, {
                ...arrayOptions,
                ...request,
            } as TiledArrayOptionsMap[T]) as Promise<TiledArrayReturnMap[T]>,
        requestOptions,
        queryOptions,
        defaultEnabled: arrayPath.length > 0,
    });
}

/**
 * Read an array as JSON — `number[][]` by default.
 *
 * Override the shape when the array is not 2-D numeric:
 * `useTiledArrayAsJSONQuery<number[][][]>(path, { stack: [0] })`.
 *
 * @param arrayPath **Required.** Tiled path to the array. Idle while empty.
 * @param arrayOptions Array parameters; `stack: [n]` selects one frame of a 3-D array.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export function useTiledArrayAsJSONQuery<TResponse = number[][], TData = TResponse>(
    arrayPath: string,
    arrayOptions?: TiledArrayJSONEndpointOptions,
    queryOptions?: FinchQueryOptions<TResponse, TData, TiledQueryKeyFor<'array'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.array(scope, {
            arrayPath,
            type: 'JSON',
            options: arrayKeyParts(arrayOptions),
        }),
        // Transport spread last so the composed signal and any per-call `baseUrl` win. A collision is
        // impossible anyway: `Omit` removed the transport keys from `arrayOptions`.
        fetch: (client, request) =>
            client.getArrayAsJSON<TResponse>(arrayPath, { ...arrayOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: arrayPath.length > 0,
    });
}

/**
 * Read an array as a PNG `Blob`.
 *
 * Remember to `URL.revokeObjectURL` any object URL you create from the blob. For an `<img src>` that
 * needs no fetch at all, use `useTiledArrayImagePath`.
 *
 * @param arrayPath **Required.** Tiled path to the array. Idle while empty.
 * @param arrayOptions Array parameters; `maxBytesAllowed` auto-downsamples large frames.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export function useTiledArrayAsPngQuery<TData = Blob>(
    arrayPath: string,
    arrayOptions?: TiledArrayPngEndpointOptions,
    queryOptions?: FinchQueryOptions<Blob, TData, TiledQueryKeyFor<'array'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.array(scope, {
            arrayPath,
            type: 'PNG',
            options: arrayKeyParts(arrayOptions),
        }),
        fetch: (client, request) =>
            client.getArrayAsPng(arrayPath, { ...arrayOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: arrayPath.length > 0,
    });
}

/**
 * Read an array as a raw `ArrayBuffer`.
 *
 * @param arrayPath **Required.** Tiled path to the array. Idle while empty.
 * @param arrayOptions Array parameters: `stack`, `downSampleRatio`, `maxBytesAllowed`, `structure`, …
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export function useTiledArrayAsBufferQuery<TData = ArrayBuffer>(
    arrayPath: string,
    arrayOptions?: TiledArrayBufferEndpointOptions,
    queryOptions?: FinchQueryOptions<ArrayBuffer, TData, TiledQueryKeyFor<'array'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.array(scope, {
            arrayPath,
            type: 'BUFFER',
            options: arrayKeyParts(arrayOptions),
        }),
        fetch: (client, request) =>
            client.getArrayAsBuffer(arrayPath, { ...arrayOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: arrayPath.length > 0,
    });
}

/**
 * Build the URL of an array image, for use directly as an `<img src>`.
 *
 * **Not a query**, so there is no `queryOptions` slot. `getArrayAsImagePath` is synchronous — it
 * composes a URL and makes no request — so caching it would only cache string concatenation. This
 * hook exists to resolve the client (and therefore the configured base URL and API key) and to
 * memoize the result; the browser does the fetching, and its own HTTP cache applies.
 *
 * Because it is synchronous, it cannot fetch the array structure: pass `structure` or `arrayItem` in
 * `arrayOptions` if you want downsampling applied.
 *
 * ```tsx
 * const src = useTiledArrayImagePath(path, { stack: [frame], structure });
 * return src ? <img src={src} alt="detector frame" /> : null;
 * ```
 *
 * @param arrayPath **Required.** Tiled path to the array. Returns `''` while empty.
 * @param arrayOptions Array parameters; `format` may be `'image/png'` or `'image/tiff'`.
 * @param requestOptions Transport overrides for this call only. `signal` is accepted but ignored —
 * there is no request to abort.
 * @returns The image URL, or `''` when `arrayPath` is empty.
 */
export function useTiledArrayImagePath(
    arrayPath: string,
    arrayOptions?: TiledArrayImagePathEndpointOptions,
    requestOptions?: TiledRequestOptions,
): string {
    const { client, requestDefaults } = useTiledClient();
    // Depend on the projection, not the options object: a caller passing a fresh object literal every
    // render must not recompute, and `structure` must not be hashed.
    const partsKey = JSON.stringify(arrayKeyParts(arrayOptions));
    const defaultsKey = JSON.stringify(requestDefaults);
    // Destructured rather than stringified: `requestOptions` can hold a client instance (circular, so
    // `JSON.stringify` throws) and an `AbortSignal`. `signal` is deliberately not a dependency — a
    // synchronous URL build cannot be aborted, so a fresh one each render must not recompute.
    const { baseUrl, initialPath, pathMode, apiKey, client: clientOverride } = requestOptions ?? {};

    return useMemo(() => {
        if (arrayPath.length === 0) return '';
        return client.getArrayAsImagePath(arrayPath, {
            ...arrayOptions,
            ...mergeRequestOptions(requestDefaults, requestOptions),
        });
        // `arrayOptions`, `requestOptions` and `requestDefaults` are intentionally absent: the keys
        // and scalars above capture everything about them that can change the URL, and depending on
        // the objects themselves would recompute every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        client,
        arrayPath,
        partsKey,
        defaultsKey,
        baseUrl,
        initialPath,
        pathMode,
        apiKey,
        clientOverride,
    ]);
}

// #region block reads and writes

/** What `useTiledArrayBlockQuery` reads: one chunk, addressed by its block index. */
export interface TiledArrayBlockParams {
    /** The chunk's index along each axis, e.g. `[0, 2]`. */
    block: number[];
    slice?: string;
    expected_shape?: string;
    format?: string;
}

/**
 * Read one chunk of an array — `GET /api/v1/array/block/{path}`.
 *
 * Chunk-addressed rather than slice-addressed: this is the endpoint a chunked reader uses, where
 * `useTiledArrayAsJSONQuery` is the one a plot uses. Resolves raw bytes; decode them according to
 * the array's dtype.
 *
 * @param arrayPath **Required.** Idle while empty.
 * @param params **Required.** `block` locates the chunk.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export function useTiledArrayBlockQuery<TData = ArrayBuffer>(
    arrayPath: string,
    params: TiledArrayBlockParams | undefined,
    queryOptions?: FinchQueryOptions<ArrayBuffer, TData, TiledQueryKeyFor<'array'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.array(scope, {
            arrayPath,
            type: 'BUFFER',
            options: arrayKeyParts(params ? { stack: params.block } : undefined),
        }),
        fetch: (client, request) =>
            client.getArrayBlock(
                arrayPath,
                requireArg(params, 'useTiledArrayBlockQuery', 'params'),
                request,
            ),
        requestOptions,
        queryOptions,
        defaultEnabled: arrayPath.length > 0 && params !== undefined,
    });
}

/**
 * Array writes.
 *
 * All three accept bytes (`ArrayBuffer`, a typed array, a `Blob`) or a nested `number[][]`. Bytes go
 * as `application/octet-stream` and must already be in the array's own dtype and C order — the
 * server trusts the declared structure and does not convert. `number[][]` goes as JSON, which is
 * slower but needs no dtype knowledge. Nothing converts one to the other; see the client's
 * `putArrayFull` for why.
 *
 * Each invalidates `data` **and** `metadata`, because a write can change a structure —
 * `patchArrayFull` with `extend: true` grows the shape, and a cached structure that still says
 * otherwise is what the downsampling maths reads.
 */

/** What `useTiledPutArrayFullMutation().mutate` takes. */
export interface TiledPutArrayFullVariables {
    path: string;
    data: TiledBinaryBody | number[][];
    /** Flush to storage rather than leaving the write in the server's cache. */
    persist?: boolean;
}

/** Write a whole array — `PUT /api/v1/array/full/{path}`. */
export function useTiledPutArrayFullMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledPutArrayFullVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledPutArrayFullVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, data, persist }, request) =>
            client.putArrayFull(path, data, { persist }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledPutArrayFullMutation,
        requestOptions,
        mutationOptions,
    });
}

/** What `useTiledPutArrayBlockMutation().mutate` takes. */
export interface TiledPutArrayBlockVariables {
    path: string;
    data: TiledBinaryBody | number[][];
    block: number[];
    persist?: boolean;
}

/** Write one chunk — `PUT /api/v1/array/block/{path}`. */
export function useTiledPutArrayBlockMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledPutArrayBlockVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledPutArrayBlockVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, data, block, persist }, request) =>
            client.putArrayBlock(path, data, { block, persist }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledPutArrayBlockMutation,
        requestOptions,
        mutationOptions,
    });
}

/** What `useTiledPatchArrayFullMutation().mutate` takes. */
export interface TiledPatchArrayFullVariables {
    path: string;
    data: TiledBinaryBody | number[][];
    /** Where the region starts, per axis. */
    offset: number[];
    /** The region's size, per axis. */
    shape: number[];
    /** Allow the write to grow a resizable array past its current bounds — how a scan appends. */
    extend?: boolean;
    persist?: boolean;
}

/**
 * Write a sub-region of an array — `PATCH /api/v1/array/full/{path}`.
 *
 * With `extend: true` this is how an in-progress acquisition appends frames: write at
 * `offset: [n, 0, 0]` with `shape: [1, h, w]` and the array grows by one frame.
 */
export function useTiledPatchArrayFullMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledPatchArrayFullVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledPatchArrayFullVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, data, offset, shape, extend, persist }, request) =>
            client.patchArrayFull(path, data, { offset, shape, extend, persist }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledPatchArrayFullMutation,
        requestOptions,
        mutationOptions,
    });
}

// #endregion
