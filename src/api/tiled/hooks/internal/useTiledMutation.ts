import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { TiledClientLike } from '../../runtime/clientLike';
import type { TiledRequestOptions } from '../../types/common';
import {
    invalidateTiledRoots,
    resolveInvalidationRoots,
    type TiledInvalidationBundleName,
} from '../invalidation';
import type { FinchMutationOptions, TiledHookError } from '../types';
import { useTiledClient } from '../useTiledClient';
import { mergeRequestOptions } from './requestOptions';

export interface TiledMutationEngineArgs<TResponse, TVariables, TContext> {
    /** Performs the write. Receives `mutate`'s argument and the merged transport options. */
    perform: (
        client: TiledClientLike,
        variables: TVariables,
        request: TiledRequestOptions,
    ) => Promise<TResponse>;
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
export function useTiledMutation<TResponse, TVariables, TContext = unknown>({
    perform,
    invalidates,
    requestOptions,
    mutationOptions,
}: TiledMutationEngineArgs<TResponse, TVariables, TContext>): UseMutationResult<
    TResponse,
    TiledHookError,
    TVariables,
    TContext
> {
    const { client, requestDefaults } = useTiledClient();
    const queryClient = useQueryClient();

    return useMutation<TResponse, TiledHookError, TVariables, TContext>({
        ...mutationOptions,
        // Mutations get no signal from TanStack, so only a caller-supplied one applies.
        mutationFn: (variables) =>
            perform(client, variables, mergeRequestOptions(requestDefaults, requestOptions)),
        // Forwarded with a rest parameter so the callback signature tracks whatever arity the
        // installed TanStack version uses.
        onSuccess: async (...args) => {
            await invalidateTiledRoots(queryClient, resolveInvalidationRoots(invalidates));
            await mutationOptions?.onSuccess?.(...args);
        },
    });
}
