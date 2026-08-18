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
 * The TanStack option shapes are shared with the other Finch backends — see
 * `@/api/shared/queryOptions`. They are re-exported here so that `@/api/qServer_new` stays the only
 * import path a queue-server consumer needs.
 *
 * `queryKey`, `queryFn` and `mutationFn` are omitted from them because the hook owns those: the
 * invalidation map is only correct while the key is the one `qServerQueryKeys` produced, so
 * overriding it would silently detach the entry from every mutation that should refresh it.
 */
export type { FinchMutationOptions, FinchQueryOptions } from '@/api/shared/queryOptions';
