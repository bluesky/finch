import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { QServerEndpoints } from '../../types/clientSurface';
import type { QServerRequestOptions } from '../../types/common';
import {
    invalidateQServerRoots,
    resolveInvalidationRoots,
    type QServerInvalidationBundleName,
} from '../invalidation';
import type { FinchMutationOptions, QServerHookError } from '../types';
import { useQServerClient } from '../useQServerClient';
import { mergeRequestOptions } from './requestOptions';

export interface QServerMutationEngineArgs<TResponse, TVariables, TContext> {
    /** Performs the write. Receives `mutate`'s argument and the merged transport options. */
    perform: (
        client: QServerEndpoints,
        variables: TVariables,
        request: QServerRequestOptions,
    ) => Promise<TResponse>;
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
export function useQServerMutation<TResponse, TVariables, TContext = unknown>({
    perform,
    invalidates,
    requestOptions,
    mutationOptions,
}: QServerMutationEngineArgs<TResponse, TVariables, TContext>): UseMutationResult<
    TResponse,
    QServerHookError,
    TVariables,
    TContext
> {
    const { client, requestDefaults } = useQServerClient();
    const queryClient = useQueryClient();

    return useMutation<TResponse, QServerHookError, TVariables, TContext>({
        ...mutationOptions,
        // Mutations get no signal from TanStack, so only a caller-supplied one applies.
        mutationFn: (variables) =>
            perform(client, variables, mergeRequestOptions(requestDefaults, requestOptions)),
        // Forwarded with a rest parameter so the callback signature tracks whatever arity the
        // installed TanStack version uses.
        onSuccess: async (...args) => {
            await invalidateQServerRoots(queryClient, resolveInvalidationRoots(invalidates));
            await mutationOptions?.onSuccess?.(...args);
        },
    });
}
