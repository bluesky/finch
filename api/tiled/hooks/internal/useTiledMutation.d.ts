import { UseMutationResult } from '@tanstack/react-query';
import { TiledClientLike } from '../../runtime/clientLike';
import { TiledRequestOptions } from '../../types/common';
import { TiledInvalidationBundleName } from '../invalidation';
import { FinchMutationOptions, TiledHookError } from '../types';
export interface TiledMutationEngineArgs<TResponse, TVariables, TContext> {
    /** Performs the write. Receives `mutate`'s argument and the merged transport options. */
    perform: (client: TiledClientLike, variables: TVariables, request: TiledRequestOptions) => Promise<TResponse>;
    /** Caches to refresh on success; see `TILED_MUTATION_INVALIDATIONS`. */
    invalidates: readonly TiledInvalidationBundleName[];
    /** The hook's request-options parameter, merged under the resolver's defaults. */
    requestOptions?: TiledRequestOptions;
    /** The hook's TanStack options parameter. */
    mutationOptions?: FinchMutationOptions<TResponse, TVariables, TContext, TiledHookError>;
}
/**
 * The single mutation implementation every `use*Mutation` hook delegates to.
 *
 * Invalidation is awaited before the caller's `onSuccess`, so `mutateAsync` resolves only once the
 * affected queries have refetched — a caller can read fresh data on the next line.
 */
export declare function useTiledMutation<TResponse, TVariables, TContext = unknown>({ perform, invalidates, requestOptions, mutationOptions, }: TiledMutationEngineArgs<TResponse, TVariables, TContext>): UseMutationResult<TResponse, TiledHookError, TVariables, TContext>;
//# sourceMappingURL=useTiledMutation.d.ts.map