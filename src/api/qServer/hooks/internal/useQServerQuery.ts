import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import type { QServerEndpoints } from '../../types/clientSurface';
import type { QServerRequestOptions } from '../../types/common';
import { useQServerClient } from '../useQServerClient';
import type { FinchQueryOptions, QServerHookError } from '../types';
import { mergeRequestOptions } from '@/api/shared/requestOptions';
import { resolveEnabled } from '@/api/shared/queryOptions';

export interface QServerQueryEngineArgs<
    TResponse,
    TData,
    TQueryKey extends QueryKey,
    TRequest extends QServerRequestOptions,
> {
    /** Built from `qServerQueryKeys` by the calling hook, using the resolved scope. */
    queryKey: TQueryKey;
    /** Performs the request. Receives the merged transport options. */
    fetch: (client: QServerEndpoints, request: TRequest) => Promise<TResponse>;
    /** The hook's `requestOptions` parameter, merged under the resolver's defaults. */
    requestOptions?: TRequest;
    /** The hook's `queryOptions` parameter. */
    queryOptions?: FinchQueryOptions<TResponse, TData, TQueryKey>;
    /**
     * Hook-owned defaults (`retry`, `staleTime`, …). Spread *before* the caller's options, so the
     * caller wins.
     */
    defaults?: Omit<FinchQueryOptions<TResponse, TData, TQueryKey>, 'enabled'>;
    /** Guard for hooks whose argument is required. Applied only when the caller says nothing. */
    defaultEnabled?: boolean;
}

/**
 * The single query implementation every `use*Query` hook delegates to.
 *
 * Each hook stays an explicitly written wrapper — no factory — so hover types, JSDoc and the
 * endpoint's own argument name survive.
 */
export function useQServerQuery<
    TResponse,
    TData,
    TQueryKey extends QueryKey,
    TRequest extends QServerRequestOptions,
>({
    queryKey,
    fetch,
    requestOptions,
    queryOptions,
    defaults,
    defaultEnabled,
}: QServerQueryEngineArgs<TResponse, TData, TQueryKey, TRequest>): UseQueryResult<
    TData,
    QServerHookError
> {
    const { client, requestDefaults } = useQServerClient();

    return useQuery<TResponse, QServerHookError, TData, TQueryKey>({
        queryKey,
        // TanStack's signal is merged with any caller signal, so unmount and `cancelQueries` cancel
        // the in-flight request.
        queryFn: ({ signal }) =>
            fetch(client, mergeRequestOptions(requestDefaults, requestOptions, signal) as TRequest),
        ...defaults,
        ...queryOptions,
        // After the spread on purpose — see `resolveEnabled` for why.
        enabled: resolveEnabled(queryOptions?.enabled, defaultEnabled),
    });
}
