import { QueryKey, UseQueryResult } from '@tanstack/react-query';
import { QServerEndpoints } from '../../types/clientSurface';
import { QServerRequestOptions } from '../../types/common';
import { FinchQueryOptions, QServerHookError } from '../types';
export interface QServerQueryEngineArgs<TResponse, TData, TQueryKey extends QueryKey, TRequest extends QServerRequestOptions> {
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
export declare function useQServerQuery<TResponse, TData, TQueryKey extends QueryKey, TRequest extends QServerRequestOptions>({ queryKey, fetch, requestOptions, queryOptions, defaults, defaultEnabled, }: QServerQueryEngineArgs<TResponse, TData, TQueryKey, TRequest>): UseQueryResult<TData, QServerHookError>;
//# sourceMappingURL=useQServerQuery.d.ts.map