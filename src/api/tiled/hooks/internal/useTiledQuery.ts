import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import type { TiledClientLike } from '../../runtime/clientLike';
import type { TiledRequestOptions } from '../../types/common';
import type { FinchQueryOptions, TiledHookError } from '../types';
import { useTiledClient } from '../useTiledClient';
import { mergeRequestOptions } from '@/api/shared/requestOptions';
import { resolveEnabled } from '@/api/shared/queryOptions';

/**
 * Note there is no per-hook request type parameter, unlike the queue server's engine.
 *
 * Every Tiled hook passes plain `TiledRequestOptions`: the array and table hooks used to widen it to
 * the package's merged option types, which is what the endpoint slot replaced. The queue server keeps
 * its parameter because `GetWithBodyOptions<T>` genuinely varies per hook.
 */
export interface TiledQueryEngineArgs<TResponse, TData, TQueryKey extends QueryKey> {
    /** Built from `tiledQueryKeys` by the calling hook, using the resolved scope. */
    queryKey: TQueryKey;
    /** Performs the request. Receives the merged transport options. */
    fetch: (client: TiledClientLike, request: TiledRequestOptions) => Promise<TResponse>;
    /** The hook's request-options parameter, merged under the resolver's defaults. */
    requestOptions?: TiledRequestOptions;
    /** The hook's TanStack options parameter. */
    queryOptions?: FinchQueryOptions<TResponse, TData, TQueryKey, TiledHookError>;
    /**
     * Hook-owned defaults (`retry`, `staleTime`, …). Spread *before* the caller's options, so the
     * caller wins.
     */
    defaults?: Omit<FinchQueryOptions<TResponse, TData, TQueryKey, TiledHookError>, 'enabled'>;
    /** Guard for hooks whose argument is required. Applied only when the caller says nothing. */
    defaultEnabled?: boolean;
}

/**
 * The single query implementation every `use*Query` hook delegates to.
 *
 * Each hook stays an explicitly written wrapper — no factory — so hover types, JSDoc and the
 * endpoint's own argument names survive.
 */
export function useTiledQuery<TResponse, TData, TQueryKey extends QueryKey>({
    queryKey,
    fetch,
    requestOptions,
    queryOptions,
    defaults,
    defaultEnabled,
}: TiledQueryEngineArgs<TResponse, TData, TQueryKey>): UseQueryResult<TData, TiledHookError> {
    const { client, requestDefaults } = useTiledClient();

    return useQuery<TResponse, TiledHookError, TData, TQueryKey>({
        queryKey,
        // TanStack's signal is merged with any caller signal, so unmount and `cancelQueries` cancel
        // the in-flight request.
        queryFn: ({ signal }) =>
            fetch(client, mergeRequestOptions(requestDefaults, requestOptions, signal)),
        ...defaults,
        ...queryOptions,
        // After the spread on purpose — see `resolveEnabled` for why.
        enabled: resolveEnabled(queryOptions?.enabled, defaultEnabled),
    });
}
