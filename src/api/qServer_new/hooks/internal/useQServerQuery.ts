import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import type { QServerEndpoints } from '../../types/clientSurface';
import type { QServerRequestOptions } from '../../types/common';
import { useQServerClient } from '../useQServerClient';
import type { QServerHookError, QServerQueryHookOptions } from '../types';
import { mergeRequestOptions } from './requestOptions';

export interface QServerQueryEngineArgs<
    TResponse,
    TData,
    TQueryKey extends QueryKey,
    TRequest extends QServerRequestOptions,
> extends QServerQueryHookOptions<TResponse, TData, TQueryKey, TRequest> {
    /** Built from `qServerQueryKeys` by the calling hook, using the resolved scope. */
    queryKey: TQueryKey;
    /** Performs the request. Receives the merged transport options. */
    fetch: (client: QServerEndpoints, request: TRequest) => Promise<TResponse>;
    /**
     * Hook-owned defaults (`retry`, `staleTime`, …). Spread *before* the caller's options, so the
     * caller wins.
     */
    defaults?: Omit<
        NonNullable<QServerQueryHookOptions<TResponse, TData, TQueryKey, TRequest>['query']>,
        'enabled'
    >;
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
    request,
    query,
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
            fetch(client, mergeRequestOptions(requestDefaults, request, signal) as TRequest),
        ...defaults,
        ...query,
        // After the spread on purpose: an options object carrying `enabled: undefined` (trivially
        // produced by spreading props) must fall through to the guard, not clobber it — the bug the
        // legacy `useQueueItemQuery` had.
        enabled: query?.enabled ?? defaultEnabled ?? true,
    });
}
