import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { requireArg } from '@/api/shared/errors';
import type {
    TiledAwkwardEndpointParams,
    TiledNodeEndpointParams,
    TiledRaggedEndpointParams,
} from '../types/dataOptions';
import type { TiledBinaryBody, TiledRequestOptions } from '../types/common';
import { useTiledMutation } from './internal/useTiledMutation';
import { useTiledQuery } from './internal/useTiledQuery';
import { TILED_MUTATION_INVALIDATIONS } from './invalidation';
import { tiledQueryKeys, type TiledQueryKeyFor } from './queryKeys';
import type { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
import { useTiledQueryScope } from './useTiledClient';

/**
 * Container, node, awkward and ragged hooks.
 *
 * Four structure families with one shape of request between them: a path, a selection (fields, or
 * form keys, or a slice) and a format. They get four separate query roots so that invalidating one
 * family does not refetch the others, but they share this file because the hooks are otherwise
 * identical and splitting them would be four files of the same twenty lines.
 *
 * None of these existed before — the package covered arrays and tables only. `container/full` in
 * particular is how you read a whole container's data in one request instead of walking its
 * children.
 *
 * Every read resolves `unknown`, because the format decides the type: `'JSON'` gives a parsed
 * document, `'CSV'` a string, `'PARQUET'` an `ArrayBuffer`, `'ZIP'` a `Blob`. Pass a type argument
 * when you know which you asked for, or narrow with `select`.
 */

/** The selection and format parts of a node read, projected for the query key. */
function nodeKeyArgs(
    path: string,
    selection: readonly string[] | undefined,
    format: string | undefined,
) {
    return {
        path,
        selection: selection?.length ? [...selection] : null,
        format: format ?? null,
    };
}

// #region container

/**
 * A container's metadata and data together — `GET /api/v1/container/full/{path}`.
 *
 * `format: 'HDF5'` or `'ZIP'` packages the whole subtree as a single download, which is the usual
 * reason to reach for this rather than for a search plus per-child reads.
 *
 * @param path **Required.** Idle while empty.
 * @param nodeOptions `field` restricts to named children; `format` and `filename` shape the response.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export function useTiledContainerFullQuery<TData = unknown>(
    path: string,
    nodeOptions?: TiledNodeEndpointParams,
    queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'container'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.container(
            scope,
            nodeKeyArgs(path, nodeOptions?.field, nodeOptions?.format),
        ),
        fetch: (client, request) => client.getContainerFull(path, { ...nodeOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0,
    });
}

/** The same read with the field list in the request body, for selections too long for a URL. */
export function useTiledPostContainerFullQuery<TData = unknown>(
    path: string,
    fields: string[] | null,
    params?: { format?: string; filename?: string },
    queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'container'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.container(
            scope,
            nodeKeyArgs(path, fields ?? undefined, params?.format),
        ),
        fetch: (client, request) => client.postContainerFull(path, fields, params, request),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0,
    });
}

// #endregion

// #region node

/**
 * Whichever of container or table the node turns out to be — `GET /api/v1/node/full/{path}`.
 *
 * Useful when the structure family is not known ahead of time: the server dispatches, so a caller
 * walking a tree does not have to read metadata first just to pick an endpoint.
 */
export function useTiledNodeFullQuery<TData = unknown>(
    path: string,
    nodeOptions?: TiledNodeEndpointParams,
    queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'node'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.node(
            scope,
            nodeKeyArgs(path, nodeOptions?.field, nodeOptions?.format),
        ),
        fetch: (client, request) => client.getNodeFull(path, { ...nodeOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0,
    });
}

/** What `useTiledPutNodeFullMutation().mutate` takes. */
export interface TiledPutNodeFullVariables {
    path: string;
    data: TiledBinaryBody;
    /** The encoding of `data`. The server dispatches its reader on exactly this. */
    mimetype: string;
}

/** Write a whole node — `PUT /api/v1/node/full/{path}`. */
export function useTiledPutNodeFullMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledPutNodeFullVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledPutNodeFullVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, data, mimetype }, request) =>
            client.putNodeFull(path, data, { mimetype }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledPutNodeFullMutation,
        requestOptions,
        mutationOptions,
    });
}

// #endregion

// #region awkward

/** A whole awkward array — `GET /api/v1/awkward/full/{path}`. */
export function useTiledAwkwardFullQuery<TData = unknown>(
    path: string,
    awkwardOptions?: TiledAwkwardEndpointParams,
    queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'awkward'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.awkward(
            scope,
            nodeKeyArgs(path, undefined, awkwardOptions?.format),
        ),
        fetch: (client, request) => client.getAwkwardFull(path, { ...awkwardOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0,
    });
}

/**
 * Selected buffers of an awkward array — `GET /api/v1/awkward/buffers/{path}`.
 *
 * An awkward array is stored as a form plus a map of named buffers; this fetches some of them by
 * form key, which is how a reader loads one field of a deeply nested record without the rest.
 */
export function useTiledAwkwardBuffersQuery<TData = unknown>(
    path: string,
    awkwardOptions?: TiledAwkwardEndpointParams,
    queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'awkward'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.awkward(
            scope,
            nodeKeyArgs(path, awkwardOptions?.form_key, awkwardOptions?.format),
        ),
        fetch: (client, request) =>
            client.getAwkwardBuffers(path, { ...awkwardOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0,
    });
}

/** The same read with the form-key list in the request body. A read, despite the verb. */
export function useTiledPostAwkwardBuffersQuery<TData = unknown>(
    path: string,
    formKeys: string[] | undefined,
    params?: { format?: string; filename?: string },
    queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'awkward'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.awkward(scope, nodeKeyArgs(path, formKeys, params?.format)),
        fetch: (client, request) =>
            client.postAwkwardBuffers(
                path,
                requireArg(formKeys, 'useTiledPostAwkwardBuffersQuery', 'formKeys'),
                params,
                request,
            ),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0 && formKeys !== undefined,
    });
}

/** What `useTiledPutAwkwardFullMutation().mutate` takes. */
export interface TiledPutAwkwardFullVariables {
    path: string;
    /** The awkward form describing the layout. */
    form: unknown;
    length: number;
    /** The named buffers, base64- or array-encoded as the server expects. */
    container: Record<string, unknown>;
}

/** Write an awkward array — `PUT /api/v1/awkward/full/{path}`. */
export function useTiledPutAwkwardFullMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledPutAwkwardFullVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledPutAwkwardFullVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, form, length, container }, request) =>
            client.putAwkwardFull(path, { form, length, container }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledPutAwkwardFullMutation,
        requestOptions,
        mutationOptions,
    });
}

// #endregion

// #region ragged

/** A ragged array — `GET /api/v1/ragged/full/{path}`. */
export function useTiledRaggedFullQuery<TData = unknown>(
    path: string,
    raggedOptions?: TiledRaggedEndpointParams,
    queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'ragged'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.ragged(scope, {
            path,
            // A slice is a selection like any other; naming it here keeps one key shape for all
            // four families.
            selection: raggedOptions?.slice ? [raggedOptions.slice] : null,
            format: raggedOptions?.format ?? null,
        }),
        fetch: (client, request) => client.getRaggedFull(path, { ...raggedOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0,
    });
}

/** What the ragged whole-array and block writes take. */
export interface TiledPutRaggedVariables {
    path: string;
    data: TiledBinaryBody | unknown[];
    persist?: boolean;
}

/** Write a whole ragged array — `PUT /api/v1/ragged/full/{path}`. */
export function useTiledPutRaggedFullMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledPutRaggedVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledPutRaggedVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, data, persist }, request) =>
            client.putRaggedFull(path, data, { persist }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledPutRaggedFullMutation,
        requestOptions,
        mutationOptions,
    });
}

/** What `useTiledPutRaggedBlockMutation().mutate` takes. */
export interface TiledPutRaggedBlockVariables extends TiledPutRaggedVariables {
    block: number[];
}

/** Write one chunk of a ragged array — `PUT /api/v1/ragged/block/{path}`. */
export function useTiledPutRaggedBlockMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledPutRaggedBlockVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledPutRaggedBlockVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, data, block, persist }, request) =>
            client.putRaggedBlock(path, data, { block, persist }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledPutRaggedBlockMutation,
        requestOptions,
        mutationOptions,
    });
}

/** What `useTiledPatchRaggedFullMutation().mutate` takes. */
export interface TiledPatchRaggedFullVariables extends TiledPutRaggedVariables {
    offset: number[];
    shape: number[];
    extend?: boolean;
}

/** Write a sub-region of a ragged array — `PATCH /api/v1/ragged/full/{path}`. */
export function useTiledPatchRaggedFullMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledPatchRaggedFullVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledPatchRaggedFullVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, data, offset, shape, extend, persist }, request) =>
            client.patchRaggedFull(path, data, { offset, shape, extend, persist }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledPatchRaggedFullMutation,
        requestOptions,
        mutationOptions,
    });
}

// #endregion
