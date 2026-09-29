import type { UseQueryResult } from '@tanstack/react-query';
import type { TiledRequestOptions, TiledSearchItem, TiledStructures } from '../types/common';
import { useTiledQuery } from './internal/useTiledQuery';
import { tiledQueryKeys, type TiledQueryKeyFor } from './queryKeys';
import type { FinchQueryOptions, TiledHookError } from './types';
import { useTiledQueryScope } from './useTiledClient';

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
export function useTiledMetadataQuery<
    S extends TiledStructures = TiledStructures,
    TData = TiledSearchItem<S>,
>(
    path: string,
    queryOptions?: FinchQueryOptions<
        TiledSearchItem<S>,
        TData,
        TiledQueryKeyFor<'metadata'>,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.metadata(scope, path),
        fetch: (client, request) => client.getMetadata<S>(path, request),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0,
    });
}
