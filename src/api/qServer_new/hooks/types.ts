import type { QueryKey, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

/**
 * Shared option shapes for the queue-server hooks.
 *
 * Every hook takes its arguments **positionally**, in the same order:
 *
 * ```ts
 * useQueueSomethingQuery(arg?, requestOptions?, queryOptions?);
 * useQueueSomethingMutation(requestOptions?, mutationOptions?);
 * ```
 *
 * `arg` is present only when the endpoint takes one, and its type says whether it is required — that
 * is the whole point of the positional shape: hovering the hook shows the endpoint's own argument
 * first, named and typed, instead of one opaque options bag. A mutation has no `arg` slot because its
 * body travels through `mutate(variables)`, so one hook instance can perform many writes.
 */

/**
 * The rejection type of every hook.
 *
 * Declared as `Error` rather than `QServerApiError` because a hook can also reject with
 * `QServerGetBodyUnsupportedError`, `QServerEndpointUnavailableError`, or a DOM `AbortError`.
 * Narrow with `isQServerApiError` / `isQServerEndpointUnavailableError`.
 */
export type QServerHookError = Error;

/**
 * TanStack query options accepted in every query hook's last parameter.
 *
 * `queryKey` and `queryFn` are omitted because the hook owns them. That is deliberate rather than
 * defensive: the invalidation map is only correct while the key is the one `qServerQueryKeys`
 * produced, so overriding it would silently detach the entry from every mutation that should
 * refresh it.
 *
 * @typeParam TResponse The endpoint's response type.
 * @typeParam TData What the hook returns — differs from `TResponse` only when `select` is used.
 * @typeParam TQueryKey The key this resource produces; see `QServerQueryKeyFor`.
 */
export type FinchQueryOptions<
    TResponse,
    TData = TResponse,
    TQueryKey extends QueryKey = QueryKey,
> = Omit<UseQueryOptions<TResponse, QServerHookError, TData, TQueryKey>, 'queryKey' | 'queryFn'>;

/**
 * TanStack mutation options accepted in every mutation hook's last parameter.
 *
 * `mutationFn` is owned by the hook. `onSuccess` is *composed*, not replaced: the hook's cache
 * invalidation runs and is awaited first, so by the time your handler runs the affected queries have
 * already refetched.
 *
 * @typeParam TResponse The endpoint's response type.
 * @typeParam TVariables What `mutate` accepts. `void` for endpoints that take no body.
 * @typeParam TContext Inferred from `onMutate`, for optimistic updates.
 */
export type FinchMutationOptions<TResponse, TVariables = void, TContext = unknown> = Omit<
    UseMutationOptions<TResponse, QServerHookError, TVariables, TContext>,
    'mutationFn'
>;
