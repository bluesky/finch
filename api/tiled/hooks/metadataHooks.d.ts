import { UseQueryResult } from '@tanstack/react-query';
import { TiledRequestOptions, TiledSearchItem, TiledStructures } from '../types/common';
import { TiledQueryKeyFor } from './queryKeys';
import { FinchQueryOptions, TiledHookError } from './types';
/** Metadata hook: `GET /api/v1/metadata/{path}`. */
/**
 * One Tiled item's metadata, specs, links and structure.
 *
 * Resolves the `TiledSearchItem` itself, not a `{ data, error }` envelope — read the item's path from
 * `item.id` and its structure from `item.attributes.structure`. Narrow the structure with the exported
 * `isArrayStructure` / `isTableStructure` / `isContainerStructure` guards, or pass the structure type
 * explicitly:
 *
 * ```ts
 * const item = useTiledMetadataQuery<ArrayStructure>('scans/run1/detector');
 * item.data?.attributes.structure.shape; // number[]
 * ```
 *
 * @param path **Required.** Tiled path to the item. Part of the query key; the query stays idle while
 * it is empty, so `useTiledMetadataQuery(selectedPath ?? '')` makes no request until something is
 * selected. Override with `queryOptions.enabled`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides: `baseUrl`, `apiKey`, `initialPath`, `pathMode`, `signal`.
 */
export declare function useTiledMetadataQuery<S extends TiledStructures = TiledStructures, TData = TiledSearchItem<S>>(path: string, queryOptions?: FinchQueryOptions<TiledSearchItem<S>, TData, TiledQueryKeyFor<'metadata'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
//# sourceMappingURL=metadataHooks.d.ts.map