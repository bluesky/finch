import { UseQueryResult } from '@tanstack/react-query';
import { TiledRequestOptions } from '../types/common';
import { TiledTableEndpoint, TiledTableEndpointOptionsMap, TiledTableJSONData, TiledTableJSONEndpointOptions, TiledTableJSONSequenceData, TiledTableJSONSequenceEndpointOptions, TiledTableReturnMap, TiledTableReturnType } from '../types/packageAliases';
import { TiledQueryKeyFor } from './queryKeys';
import { FinchQueryOptions, TiledHookError } from './types';
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
export declare function useTiledTableAsQuery<T extends TiledTableReturnType, TData = TiledTableReturnMap[T]>(tablePath: string, type: T, endpoint: TiledTableEndpoint, tableOptions?: TiledTableEndpointOptionsMap[T], queryOptions?: FinchQueryOptions<TiledTableReturnMap[T], TData, TiledQueryKeyFor<'table'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * One partition of a table, column-oriented.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param tableOptions Table parameters; `partition` defaults to `0`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export declare function useTiledTablePartitionAsJSONQuery<TData = TiledTableJSONData>(tablePath: string, tableOptions?: TiledTableJSONEndpointOptions, queryOptions?: FinchQueryOptions<TiledTableJSONData, TData, TiledQueryKeyFor<'table'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * One partition of a table, row-oriented.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param tableOptions Table parameters; `partition` defaults to `0`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export declare function useTiledTablePartitionAsJSONSequenceQuery<TData = TiledTableJSONSequenceData>(tablePath: string, tableOptions?: TiledTableJSONSequenceEndpointOptions, queryOptions?: FinchQueryOptions<TiledTableJSONSequenceData, TData, TiledQueryKeyFor<'table'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * A whole table, every partition, column-oriented.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param tableOptions Table parameters. `partition` is ignored by this endpoint.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export declare function useTiledTableFullAsJSONQuery<TData = TiledTableJSONData>(tablePath: string, tableOptions?: TiledTableJSONEndpointOptions, queryOptions?: FinchQueryOptions<TiledTableJSONData, TData, TiledQueryKeyFor<'table'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * A whole table, every partition, row-oriented.
 *
 * @param tablePath **Required.** Tiled path to the table. Idle while empty.
 * @param tableOptions Table parameters. `partition` is ignored by this endpoint.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides for this call only: `baseUrl`, `apiKey`, `initialPath`,
 * `pathMode`, `signal`, `client`.
 */
export declare function useTiledTableFullAsJSONSequenceQuery<TData = TiledTableJSONSequenceData>(tablePath: string, tableOptions?: TiledTableJSONSequenceEndpointOptions, queryOptions?: FinchQueryOptions<TiledTableJSONSequenceData, TData, TiledQueryKeyFor<'table'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
//# sourceMappingURL=tableHooks.d.ts.map