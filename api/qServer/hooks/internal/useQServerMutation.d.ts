import { UseMutationResult } from '@tanstack/react-query';
import { QServerEndpoints } from '../../types/clientSurface';
import { QServerRequestOptions } from '../../types/common';
import { QServerInvalidationBundleName } from '../invalidation';
import { FinchMutationOptions, QServerHookError } from '../types';
export interface QServerMutationEngineArgs<TResponse, TVariables, TContext> {
    /** Performs the write. Receives `mutate`'s argument and the merged transport options. */
    perform: (client: QServerEndpoints, variables: TVariables, request: QServerRequestOptions) => Promise<TResponse>;
    /** Caches to refresh on success; see `QSERVER_MUTATION_INVALIDATIONS`. */
    invalidates: readonly QServerInvalidationBundleName[];
    /** The hook's `requestOptions` parameter, merged under the resolver's defaults. */
    requestOptions?: QServerRequestOptions;
    /** The hook's `mutationOptions` parameter. */
    mutationOptions?: FinchMutationOptions<TResponse, TVariables, TContext>;
}
/**
 * The single mutation implementation every `use*Mutation` hook delegates to.
 *
 * Invalidation is awaited before the caller's `onSuccess`, so `mutateAsync` resolves only once the
 * affected queries have refetched — a caller can read fresh data on the next line.
 */
export declare function useQServerMutation<TResponse, TVariables, TContext = unknown>({ perform, invalidates, requestOptions, mutationOptions, }: QServerMutationEngineArgs<TResponse, TVariables, TContext>): UseMutationResult<TResponse, QServerHookError, TVariables, TContext>;
//# sourceMappingURL=useQServerMutation.d.ts.map