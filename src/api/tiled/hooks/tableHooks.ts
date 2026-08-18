import type { UseQueryResult } from '@tanstack/react-query';
import type {
    TiledTableEndpoint,
    TiledTableJSONData,
    TiledTableJSONSequenceData,
    TiledTableJSONOptions,
    TiledTableJSONSequenceOptions,
    TiledTableOptionsMap,
    TiledTableReturnMap,
    TiledTableReturnType,
} from '../types/packageAliases';
import { tableKeyParts } from './internal/keyParts';
import { useTiledQuery } from './internal/useTiledQuery';
import { tiledQueryKeys, type TiledQueryKeyFor } from './queryKeys';
import type { FinchQueryOptions, TiledHookError } from './types';
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
 * Like the array hooks, these take one combined options object (the package's
 * `TiledTableRequestOptions` extends `TiledRequestOptions`), and only `partition` and `format` take
 * part in the query key — `structure` / `tableItem` are round-trip optimizations, not part of the
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
 * @param options Table and transport options: `partition`, `structure`, `baseUrl`, `apiKey`, `signal`, …
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledTableAsQuery<
    T extends TiledTableReturnType,
    TData = TiledTableReturnMap[T],
>(
    tablePath: string,
    type: T,
    endpoint: TiledTableEndpoint,
    options: TiledTableOptionsMap[T] = {} as TiledTableOptionsMap[T],
    queryOptions: FinchQueryOptions<
        TiledTableReturnMap[T],
        TData,
        TiledQueryKeyFor<'table'>,
        TiledHookError
    > = {},
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(options);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            type,
            endpoint,
            options: tableKeyParts(options),
        }),
        fetch: (client, request) =>
            client.getTableAs<T>(tablePath, type, endpoint, request) as Promise<
                TiledTableReturnMap[T]
            >,
        requestOptions: options,
        queryOptions,
        defaultEnabled: tablePath.length > 0,
    });
}

/**
 * One partition of a table, column-oriented.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param options Table and transport options; `partition` defaults to `0`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledTablePartitionAsJSONQuery<TData = TiledTableJSONData>(
    tablePath: string,
    options: TiledTableJSONOptions = {},
    queryOptions: FinchQueryOptions<
        TiledTableJSONData,
        TData,
        TiledQueryKeyFor<'table'>,
        TiledHookError
    > = {},
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(options);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            type: 'JSON',
            endpoint: 'partition',
            options: tableKeyParts(options),
        }),
        fetch: (client, request) => client.getTablePartitionAsJSON(tablePath, request),
        requestOptions: options,
        queryOptions,
        defaultEnabled: tablePath.length > 0,
    });
}

/**
 * One partition of a table, row-oriented.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param options Table and transport options; `partition` defaults to `0`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledTablePartitionAsJSONSequenceQuery<TData = TiledTableJSONSequenceData>(
    tablePath: string,
    options: TiledTableJSONSequenceOptions = {},
    queryOptions: FinchQueryOptions<
        TiledTableJSONSequenceData,
        TData,
        TiledQueryKeyFor<'table'>,
        TiledHookError
    > = {},
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(options);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            type: 'JSON_SEQ',
            endpoint: 'partition',
            options: tableKeyParts(options),
        }),
        fetch: (client, request) => client.getTablePartitionAsJSONSequence(tablePath, request),
        requestOptions: options,
        queryOptions,
        defaultEnabled: tablePath.length > 0,
    });
}

/**
 * A whole table, every partition, column-oriented.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param options Table and transport options.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledTableFullAsJSONQuery<TData = TiledTableJSONData>(
    tablePath: string,
    options: TiledTableJSONOptions = {},
    queryOptions: FinchQueryOptions<
        TiledTableJSONData,
        TData,
        TiledQueryKeyFor<'table'>,
        TiledHookError
    > = {},
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(options);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            type: 'JSON',
            endpoint: 'full',
            options: tableKeyParts(options),
        }),
        fetch: (client, request) => client.getTableFullAsJSON(tablePath, request),
        requestOptions: options,
        queryOptions,
        defaultEnabled: tablePath.length > 0,
    });
}

/**
 * A whole table, every partition, row-oriented.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param options Table and transport options.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useTiledTableFullAsJSONSequenceQuery<TData = TiledTableJSONSequenceData>(
    tablePath: string,
    options: TiledTableJSONSequenceOptions = {},
    queryOptions: FinchQueryOptions<
        TiledTableJSONSequenceData,
        TData,
        TiledQueryKeyFor<'table'>,
        TiledHookError
    > = {},
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(options);

    return useTiledQuery({
        queryKey: tiledQueryKeys.table(scope, {
            tablePath,
            type: 'JSON_SEQ',
            endpoint: 'full',
            options: tableKeyParts(options),
        }),
        fetch: (client, request) => client.getTableFullAsJSONSequence(tablePath, request),
        requestOptions: options,
        queryOptions,
        defaultEnabled: tablePath.length > 0,
    });
}
