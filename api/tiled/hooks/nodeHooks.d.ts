import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { TiledAwkwardEndpointParams, TiledNodeEndpointParams, TiledRaggedEndpointParams } from '../types/dataOptions';
import { TiledBinaryBody, TiledRequestOptions } from '../types/common';
import { TiledQueryKeyFor } from './queryKeys';
import { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
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
export declare function useTiledContainerFullQuery<TData = unknown>(path: string, nodeOptions?: TiledNodeEndpointParams, queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'container'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/** The same read with the field list in the request body, for selections too long for a URL. */
export declare function useTiledPostContainerFullQuery<TData = unknown>(path: string, fields: string[] | null, params?: {
    format?: string;
    filename?: string;
}, queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'container'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * Whichever of container or table the node turns out to be — `GET /api/v1/node/full/{path}`.
 *
 * Useful when the structure family is not known ahead of time: the server dispatches, so a caller
 * walking a tree does not have to read metadata first just to pick an endpoint.
 */
export declare function useTiledNodeFullQuery<TData = unknown>(path: string, nodeOptions?: TiledNodeEndpointParams, queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'node'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/** What `useTiledPutNodeFullMutation().mutate` takes. */
export interface TiledPutNodeFullVariables {
    path: string;
    data: TiledBinaryBody;
    /** The encoding of `data`. The server dispatches its reader on exactly this. */
    mimetype: string;
}
/** Write a whole node — `PUT /api/v1/node/full/{path}`. */
export declare function useTiledPutNodeFullMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, TiledPutNodeFullVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, TiledPutNodeFullVariables, TContext>;
/** A whole awkward array — `GET /api/v1/awkward/full/{path}`. */
export declare function useTiledAwkwardFullQuery<TData = unknown>(path: string, awkwardOptions?: TiledAwkwardEndpointParams, queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'awkward'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * Selected buffers of an awkward array — `GET /api/v1/awkward/buffers/{path}`.
 *
 * An awkward array is stored as a form plus a map of named buffers; this fetches some of them by
 * form key, which is how a reader loads one field of a deeply nested record without the rest.
 */
export declare function useTiledAwkwardBuffersQuery<TData = unknown>(path: string, awkwardOptions?: TiledAwkwardEndpointParams, queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'awkward'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/** The same read with the form-key list in the request body. A read, despite the verb. */
export declare function useTiledPostAwkwardBuffersQuery<TData = unknown>(path: string, formKeys: string[] | undefined, params?: {
    format?: string;
    filename?: string;
}, queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'awkward'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
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
export declare function useTiledPutAwkwardFullMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, TiledPutAwkwardFullVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, TiledPutAwkwardFullVariables, TContext>;
/** A ragged array — `GET /api/v1/ragged/full/{path}`. */
export declare function useTiledRaggedFullQuery<TData = unknown>(path: string, raggedOptions?: TiledRaggedEndpointParams, queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'ragged'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/** What the ragged whole-array and block writes take. */
export interface TiledPutRaggedVariables {
    path: string;
    data: TiledBinaryBody | unknown[];
    persist?: boolean;
}
/** Write a whole ragged array — `PUT /api/v1/ragged/full/{path}`. */
export declare function useTiledPutRaggedFullMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, TiledPutRaggedVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, TiledPutRaggedVariables, TContext>;
/** What `useTiledPutRaggedBlockMutation().mutate` takes. */
export interface TiledPutRaggedBlockVariables extends TiledPutRaggedVariables {
    block: number[];
}
/** Write one chunk of a ragged array — `PUT /api/v1/ragged/block/{path}`. */
export declare function useTiledPutRaggedBlockMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, TiledPutRaggedBlockVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, TiledPutRaggedBlockVariables, TContext>;
/** What `useTiledPatchRaggedFullMutation().mutate` takes. */
export interface TiledPatchRaggedFullVariables extends TiledPutRaggedVariables {
    offset: number[];
    shape: number[];
    extend?: boolean;
}
/** Write a sub-region of a ragged array — `PATCH /api/v1/ragged/full/{path}`. */
export declare function useTiledPatchRaggedFullMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, TiledPatchRaggedFullVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, TiledPatchRaggedFullVariables, TContext>;
//# sourceMappingURL=nodeHooks.d.ts.map