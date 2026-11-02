import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { requireArg } from '@/api/shared/errors';
import type { TiledBinaryBody, TiledRequestOptions } from '../types/common';
import type { TiledFormatName } from '../client/formats';
import type {
    TiledTableAnyEndpointOptions,
    TiledTableEndpoint,
    TiledTableEndpointOptionsMap,
    TiledTableJSONData,
    TiledTableJSONEndpointOptions,
    TiledTableJSONSequenceData,
    TiledTableJSONSequenceEndpointOptions,
    TiledTableOptionsMap,
    TiledTableReturnMap,
    TiledTableReturnType,
} from '../types/dataOptions';
import { tableKeyParts } from './internal/keyParts';
import { useTiledMutation } from './internal/useTiledMutation';
import { useTiledQuery } from './internal/useTiledQuery';
import { TILED_MUTATION_INVALIDATIONS } from './invalidation';
import { tiledQueryKeys, type TiledQueryKeyFor } from './queryKeys';
import type { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
import { useTiledQueryScope } from './useTiledClient';

/**
 * Table-read hooks: `GET /api/v1/table/partition/{path}` and `/table/full/{path}`.
 *
 * Two axes, hence five hooks:
 *
 * - **format** — `JSON` is column-oriented (`{ colA: [...], colB: [...] }`), `JSON_SEQ` is
 *   row-oriented (`[{ colA, colB }, …]`). Column-oriented is what plotting libraries usually want;
 *   row-oriented is what tables want.
 * - **endpoint** — `partition` reads one partition (Tiled partitions are 0-based, and the default is
 *   `0`), `full` reads them all. Prefer `partition` for a growing table you are polling.
 *
 * Like the array hooks, these take a `tableOptions` slot for the endpoint's own parameters, separate
 * from `requestOptions` — the package merges the two, the hooks do not. Only `partition` and `format`
 * take part in the query key; `structure` / `tableItem` are round-trip optimizations, not part of the
 * request's identity.
 *
 * All of them stay idle while `tablePath` is empty.
 */

/**
 * Read a table in whichever format and from whichever endpoint you name.
 *
 * The generic dispatcher — prefer the four typed hooks below, which infer `data` without a type
 * argument.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param type `'JSON'` (column-oriented) or `'JSON_SEQ'` (row-oriented). Part of the query key.
 * @param endpoint `'partition'` or `'full'`. Part of the query key.
 * @param tableOptions Table parameters: `partition`, `structure`, `tableItem`, `format`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export function useTiledTableAsQuery<
    T extends TiledTableReturnType,
    TData = TiledTableReturnMap[T],
>(
    tablePath: string,
    type: T,
    endpoint: TiledTableEndpoint,
    tableOptions?: TiledTableEndpointOptionsMap[T],
    queryOptions?: FinchQueryOptions<
        TiledTableReturnMap[T],
        TData,
        TiledQueryKeyFor<'table'>,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            type,
            endpoint,
            options: tableKeyParts(tableOptions),
        }),
        // The cast is unavoidable here and only here — see the note on `useTiledArrayAsQuery`.
        fetch: (client, request) =>
            client.getTableAs<T>(tablePath, type, endpoint, {
                ...tableOptions,
                ...request,
            } as TiledTableOptionsMap[T]) as Promise<TiledTableReturnMap[T]>,
        requestOptions,
        queryOptions,
        defaultEnabled: tablePath.length > 0,
    });
}

/**
 * One partition of a table, column-oriented.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param tableOptions Table parameters; `partition` defaults to `0`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export function useTiledTablePartitionAsJSONQuery<TData = TiledTableJSONData>(
    tablePath: string,
    tableOptions?: TiledTableJSONEndpointOptions,
    queryOptions?: FinchQueryOptions<
        TiledTableJSONData,
        TData,
        TiledQueryKeyFor<'table'>,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            type: 'JSON',
            endpoint: 'partition',
            options: tableKeyParts(tableOptions),
        }),
        // Transport spread last so the composed signal and any per-call `baseUrl` win. A collision is
        // impossible anyway: `Omit` removed the transport keys from `tableOptions`.
        fetch: (client, request) =>
            client.getTablePartitionAsJSON(tablePath, { ...tableOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: tablePath.length > 0,
    });
}

/**
 * One partition of a table, row-oriented.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param tableOptions Table parameters; `partition` defaults to `0`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export function useTiledTablePartitionAsJSONSequenceQuery<TData = TiledTableJSONSequenceData>(
    tablePath: string,
    tableOptions?: TiledTableJSONSequenceEndpointOptions,
    queryOptions?: FinchQueryOptions<
        TiledTableJSONSequenceData,
        TData,
        TiledQueryKeyFor<'table'>,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            type: 'JSON_SEQ',
            endpoint: 'partition',
            options: tableKeyParts(tableOptions),
        }),
        fetch: (client, request) =>
            client.getTablePartitionAsJSONSequence(tablePath, { ...tableOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: tablePath.length > 0,
    });
}

/**
 * A whole table, every partition, column-oriented.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param tableOptions Table parameters. `partition` is ignored by this endpoint.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export function useTiledTableFullAsJSONQuery<TData = TiledTableJSONData>(
    tablePath: string,
    tableOptions?: TiledTableJSONEndpointOptions,
    queryOptions?: FinchQueryOptions<
        TiledTableJSONData,
        TData,
        TiledQueryKeyFor<'table'>,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            type: 'JSON',
            endpoint: 'full',
            options: tableKeyParts(tableOptions),
        }),
        fetch: (client, request) =>
            client.getTableFullAsJSON(tablePath, { ...tableOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: tablePath.length > 0,
    });
}

/**
 * A whole table, every partition, row-oriented.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param tableOptions Table parameters. `partition` is ignored by this endpoint.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export function useTiledTableFullAsJSONSequenceQuery<TData = TiledTableJSONSequenceData>(
    tablePath: string,
    tableOptions?: TiledTableJSONSequenceEndpointOptions,
    queryOptions?: FinchQueryOptions<
        TiledTableJSONSequenceData,
        TData,
        TiledQueryKeyFor<'table'>,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            type: 'JSON_SEQ',
            endpoint: 'full',
            options: tableKeyParts(tableOptions),
        }),
        fetch: (client, request) =>
            client.getTableFullAsJSONSequence(tablePath, { ...tableOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: tablePath.length > 0,
    });
}

// #region exports and writes

/**
 * Read a whole table in any representation — CSV, parquet, arrow, Excel, HDF5.
 *
 * The format decides the return type: `'CSV'` resolves a string, `'PARQUET'` and `'ARROW'` an
 * `ArrayBuffer`. See `client/formats.ts` for the table, and the server's own `About.formats.table`
 * for what a given deployment supports.
 *
 * This is what a download button reads. Note it caches the payload like any other query, so a large
 * export stays in the query cache — pass `gcTime: 0` if that matters.
 *
 * @param tablePath **Required.** Idle while empty.
 * @param format **Required.** A `TiledFormatName` or a raw media type.
 * @param tableOptions Table parameters: `column`, …
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export function useTiledTableFullAsQuery<TData = unknown>(
    tablePath: string,
    format: TiledFormatName | string,
    tableOptions?: TiledTableAnyEndpointOptions,
    queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'table'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            // The format is the discriminator here, so it has to reach the key; `tableKeyParts`
            // already carries it.
            type: 'JSON',
            endpoint: 'full',
            options: tableKeyParts({ ...tableOptions, format }),
        }),
        fetch: (client, request) =>
            client.getTableFullAs(tablePath, format, { ...tableOptions, ...request }),
        requestOptions,
        queryOptions,
        defaultEnabled: tablePath.length > 0,
    });
}

/**
 * Table writes.
 *
 * The payload is **encoded table bytes** and `mimetype` says which encoding — `'application/x-parquet'`,
 * `'text/csv'` or `'application/vnd.apache.arrow.file'`. It is required rather than defaulted: the
 * server dispatches its reader on exactly this header, so a wrong guess either fails outright or
 * silently writes nonsense.
 */

/** What `useTiledPutTablePartitionMutation().mutate` takes. */
export interface TiledPutTablePartitionVariables {
    path: string;
    data: TiledBinaryBody;
    partition: number;
    /** The encoding of `data`, e.g. `'application/x-parquet'`. */
    mimetype: string;
}

/** Write one partition — `PUT /api/v1/table/partition/{path}`. */
export function useTiledPutTablePartitionMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledPutTablePartitionVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledPutTablePartitionVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, data, partition, mimetype }, request) =>
            client.putTablePartition(path, data, { partition, mimetype }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledPutTablePartitionMutation,
        requestOptions,
        mutationOptions,
    });
}

/** Append to one partition — `PATCH /api/v1/table/partition/{path}`. */
export function useTiledPatchTablePartitionMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledPutTablePartitionVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledPutTablePartitionVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, data, partition, mimetype }, request) =>
            client.patchTablePartition(path, data, { partition, mimetype }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledPatchTablePartitionMutation,
        requestOptions,
        mutationOptions,
    });
}

/** What `useTiledPutTableFullMutation().mutate` takes. */
export interface TiledPutTableFullVariables {
    path: string;
    data: TiledBinaryBody;
    mimetype: string;
}

/**
 * Write a whole table — `PUT /api/v1/table/full/{path}`.
 *
 * The same server operation as `useTiledPutNodeFullMutation`; the spec simply mounts it at two
 * paths.
 */
export function useTiledPutTableFullMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledPutTableFullVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledPutTableFullVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, data, mimetype }, request) =>
            client.putTableFull(path, data, { mimetype }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledPutTableFullMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * The POST variants of the table reads — `POST /api/v1/table/full/{path}` and
 * `.../partition/{path}`.
 *
 * **Reads, despite the verb.** The body carries a column list rather than changing anything; the
 * endpoint exists for selections too long for a query string. They are queries for the same reason
 * `useQueueGetRunsQuery` is.
 */

/** Read a whole table with the column list in the request body. */
export function useTiledPostTableFullQuery<TData = unknown>(
    tablePath: string,
    columns: string[] | null,
    params?: { format?: string; filename?: string },
    queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'table'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            type: 'JSON',
            endpoint: 'full',
            options: tableKeyParts({ column: columns ?? undefined, format: params?.format }),
        }),
        fetch: (client, request) => client.postTableFull(tablePath, columns, params, request),
        requestOptions,
        queryOptions,
        defaultEnabled: tablePath.length > 0,
    });
}

/** Read one partition with the column list in the request body. */
export function useTiledPostTablePartitionQuery<TData = unknown>(
    tablePath: string,
    columns: string[] | null,
    params: { partition: number; format?: string; filename?: string } | undefined,
    queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'table'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            type: 'JSON',
            endpoint: 'partition',
            options: tableKeyParts({
                column: columns ?? undefined,
                partition: params?.partition,
                format: params?.format,
            }),
        }),
        fetch: (client, request) =>
            client.postTablePartition(
                tablePath,
                columns,
                requireArg(params, 'useTiledPostTablePartitionQuery', 'params'),
                request,
            ),
        requestOptions,
        queryOptions,
        defaultEnabled: tablePath.length > 0 && params !== undefined,
    });
}

// #endregion
