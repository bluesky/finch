import { useMemo } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type {
    TiledArrayBufferOptions,
    TiledArrayImagePathOptions,
    TiledArrayJSONOptions,
    TiledArrayOptionsMap,
    TiledArrayPngOptions,
    TiledArrayReturnMap,
    TiledArrayReturnType,
} from '../types/packageAliases';
import { arrayKeyParts } from './internal/keyParts';
import { mergeRequestOptions } from './internal/requestOptions';
import { useTiledQuery } from './internal/useTiledQuery';
import { tiledQueryKeys, type TiledQueryKeyFor } from './queryKeys';
import type { FinchQueryOptions, TiledHookError } from './types';
import { useTiledClient, useTiledQueryScope } from './useTiledClient';

/**
 * Array-read hooks: `GET /api/v1/array/block/{path}` and friends.
 *
 * These take **one** options object rather than separate endpoint and transport options, because the
 * package's `TiledArrayRequestOptions` already extends `TiledRequestOptions`. So `stack` sits beside
 * `baseUrl` in the same argument, and the same object is both the request configuration and the
 * endpoint's parameters.
 *
 * Only the fields that change what the server returns take part in the query key — see
 * `internal/keyParts.ts`. In particular `structure` / `arrayItem` do not: they let the client skip a
 * metadata round-trip on the way to identical bytes. Passing a fresh `signal` every render is also
 * safe for the same reason.
 *
 * All of them stay idle while `arrayPath` is empty.
 */

/**
 * Read an array in whichever format `type` names.
 *
 * The generic dispatcher — prefer the typed hooks below, which infer `data` without a type argument.
 * `'IMAGE_PATH'` is accepted for completeness but resolves synchronously in the package; prefer
 * `useTiledArrayImagePath`.
 *
 * @param arrayPath **Required.** Tiled path to the array. Idle while empty.
 * @param type `'JSON' | 'PNG' | 'BUFFER' | 'IMAGE_PATH'`. Part of the query key.
 * @param options Array and transport options: `stack`, `downSampleRatio`, `maxBytesAllowed`,
 * `structure`, `baseUrl`, `apiKey`, `signal`, …
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledArrayAsQuery<
    T extends TiledArrayReturnType,
    TData = TiledArrayReturnMap[T],
>(
    arrayPath: string,
    type: T,
    options: TiledArrayOptionsMap[T] = {} as TiledArrayOptionsMap[T],
    queryOptions: FinchQueryOptions<
        TiledArrayReturnMap[T],
        TData,
        TiledQueryKeyFor<'array'>,
        TiledHookError
    > = {},
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(options);

    return useTiledQuery({
        queryKey: tiledQueryKeys.array(scope, {
            arrayPath,
            type,
            options: arrayKeyParts(options),
        }),
        fetch: (client, request) =>
            client.getArrayAs<T>(arrayPath, type, request) as Promise<TiledArrayReturnMap[T]>,
        requestOptions: options,
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
 * @param options Array and transport options; `stack: [n]` selects one frame of a 3-D array.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledArrayAsJSONQuery<TResponse = number[][], TData = TResponse>(
    arrayPath: string,
    options: TiledArrayJSONOptions = {},
    queryOptions: FinchQueryOptions<
        TResponse,
        TData,
        TiledQueryKeyFor<'array'>,
        TiledHookError
    > = {},
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(options);

    return useTiledQuery({
        queryKey: tiledQueryKeys.array(scope, {
            arrayPath,
            type: 'JSON',
            options: arrayKeyParts(options),
        }),
        fetch: (client, request) => client.getArrayAsJSON<TResponse>(arrayPath, request),
        requestOptions: options,
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
 * @param options Array and transport options; `maxBytesAllowed` auto-downsamples large frames.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledArrayAsPngQuery<TData = Blob>(
    arrayPath: string,
    options: TiledArrayPngOptions = {},
    queryOptions: FinchQueryOptions<Blob, TData, TiledQueryKeyFor<'array'>, TiledHookError> = {},
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(options);

    return useTiledQuery({
        queryKey: tiledQueryKeys.array(scope, {
            arrayPath,
            type: 'PNG',
            options: arrayKeyParts(options),
        }),
        fetch: (client, request) => client.getArrayAsPng(arrayPath, request),
        requestOptions: options,
        queryOptions,
        defaultEnabled: arrayPath.length > 0,
    });
}

/**
 * Read an array as a raw `ArrayBuffer`.
 *
 * @param arrayPath **Required.** Tiled path to the array. Idle while empty.
 * @param options Array and transport options.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledArrayAsBufferQuery<TData = ArrayBuffer>(
    arrayPath: string,
    options: TiledArrayBufferOptions = {},
    queryOptions: FinchQueryOptions<
        ArrayBuffer,
        TData,
        TiledQueryKeyFor<'array'>,
        TiledHookError
    > = {},
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(options);

    return useTiledQuery({
        queryKey: tiledQueryKeys.array(scope, {
            arrayPath,
            type: 'BUFFER',
            options: arrayKeyParts(options),
        }),
        fetch: (client, request) => client.getArrayAsBuffer(arrayPath, request),
        requestOptions: options,
        queryOptions,
        defaultEnabled: arrayPath.length > 0,
    });
}

/**
 * Build the URL of an array image, for use directly as an `<img src>`.
 *
 * **Not a query.** `getArrayAsImagePath` is synchronous — it composes a URL and makes no request — so
 * caching it would only cache string concatenation. This hook exists to resolve the client (and
 * therefore the configured base URL and API key) and to memoize the result; the browser does the
 * fetching, and its own HTTP cache applies.
 *
 * Because it is synchronous, it cannot fetch the array structure: pass `structure` or `arrayItem` in
 * `options` if you want downsampling applied.
 *
 * ```tsx
 * const src = useTiledArrayImagePath(path, { stack: [frame], structure });
 * return src ? <img src={src} alt="detector frame" /> : null;
 * ```
 *
 * @param arrayPath **Required.** Tiled path to the array. Returns `''` while empty.
 * @param options Array and transport options; `format` may be `'image/png'` or `'image/tiff'`.
 * @returns The image URL, or `''` when `arrayPath` is empty.
 */
export function useTiledArrayImagePath(
    arrayPath: string,
    options: TiledArrayImagePathOptions = {},
): string {
    const { client, requestDefaults } = useTiledClient();
    const keyParts = arrayKeyParts(options);
    // Depend on the projection, not the options object: a caller passing a fresh object literal (or a
    // fresh `signal`) every render must not recompute, and `structure` must not be hashed.
    const partsKey = JSON.stringify(keyParts);
    const defaultsKey = JSON.stringify(requestDefaults);

    return useMemo(() => {
        if (arrayPath.length === 0) return '';
        return client.getArrayAsImagePath(arrayPath, mergeRequestOptions(requestDefaults, options));
        // `options` is intentionally absent: `partsKey` and `defaultsKey` capture everything about it
        // that can change the URL, and depending on the object itself would recompute every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, arrayPath, partsKey, defaultsKey]);
}
