import type { QueryKey, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

/**
 * The TanStack option shapes every Finch backend hook accepts.
 *
 * Shared by `@/api/qServer/hooks` and `@/api/tiled/hooks` (and whatever comes next) so the
 * three backends present one calling convention rather than three near-identical ones. The hooks
 * themselves are positional:
 *
 * ```ts
 * useQueueSomethingQuery(arg?, requestOptions?, queryOptions?);
 * useTiledSomethingQuery(arg, requestOptions?, queryOptions?);
 * useQueueSomethingMutation(requestOptions?, mutationOptions?);
 * ```
 */

/**
 * TanStack query options accepted in a query hook's last parameter.
 *
 * `queryKey` and `queryFn` are omitted because the hook owns them. That is deliberate rather than
 * defensive: a hook's invalidation map is only correct while the key is the one its key factory
 * produced, so overriding it would silently detach the entry from every mutation that should refresh
 * it.
 *
 * @typeParam TResponse The endpoint's response type.
 * @typeParam TData What the hook returns — differs from `TResponse` only when `select` is used.
 * @typeParam TQueryKey The key this resource produces.
 * @typeParam TError How the hook rejects. Every backend currently uses plain `Error`.
 */
export type FinchQueryOptions<
    TResponse,
    TData = TResponse,
    TQueryKey extends QueryKey = QueryKey,
    TError = Error,
> = Omit<UseQueryOptions<TResponse, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>;

/**
 * TanStack mutation options accepted in a mutation hook's last parameter.
 *
 * `mutationFn` is owned by the hook. `onSuccess` is *composed*, not replaced: the hook's cache
 * invalidation runs and is awaited first, so by the time your handler runs the affected queries have
 * already refetched.
 *
 * @typeParam TResponse The endpoint's response type.
 * @typeParam TVariables What `mutate` accepts. `void` for endpoints that take no body.
 * @typeParam TContext Inferred from `onMutate`, for optimistic updates.
 * @typeParam TError How the hook rejects.
 */
export type FinchMutationOptions<
    TResponse,
    TVariables = void,
    TContext = unknown,
    TError = Error,
> = Omit<UseMutationOptions<TResponse, TError, TVariables, TContext>, 'mutationFn'>;
