import { FinchHookError } from '../../shared/errors';
/**
 * Shared option shapes for the queue-server hooks.
 *
 * Every hook takes its arguments **positionally**, in the same order:
 *
 * ```ts
 * useQueueSomethingQuery(arg?, queryOptions?, requestOptions?);
 * useQueueSomethingMutation(mutationOptions?, requestOptions?);
 * ```
 *
 * `arg` is present only when the endpoint takes one, and its type says whether it is required — that
 * is the whole point of the positional shape: hovering the hook shows the endpoint's own argument
 * first, named and typed, instead of one opaque options bag. A mutation has no `arg` slot because its
 * body travels through `mutate(variables)`, so one hook instance can perform many writes.
 *
 * `requestOptions` is last because it is the rarest — a one-off server, key or client. The Tiled hooks
 * follow the identical convention; it is stated in full, once, in `@/api/shared/queryOptions`.
 */
/**
 * The rejection type of every hook.
 *
 * `Error` rather than `QServerApiError` because a hook can also reject with
 * `QServerGetBodyUnsupportedError`, `QServerEndpointUnavailableError`, `FinchMissingArgumentError`,
 * or a DOM `AbortError`. Narrow with `isQServerApiError` / `isQServerEndpointUnavailableError` /
 * `isFinchMissingArgumentError`.
 */
export type QServerHookError = FinchHookError;
export type { FinchMutationOptions, FinchQueryOptions } from '../../shared/queryOptions';
//# sourceMappingURL=types.d.ts.map