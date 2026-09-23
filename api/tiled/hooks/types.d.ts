import { FinchHookError } from '../../shared/errors';
/**
 * Shared option shapes for the Tiled hooks.
 *
 * Every hook takes its arguments **positionally**, in the same order:
 *
 * ```ts
 * useTiledSomethingQuery(...endpointArgs, queryOptions?, requestOptions?);
 * useTiledSomethingMutation(mutationOptions?, requestOptions?);
 * ```
 *
 * The endpoint's own arguments come first, named and typed, so hovering the hook tells you what it
 * needs and whether it is required. A mutation has no argument slot because its variables travel
 * through `mutate(variables)`. `requestOptions` is last because it is the rarest — a one-off server,
 * key or client.
 *
 * The array and table hooks take an extra endpoint slot (`arrayOptions` / `tableOptions`) for the
 * parameters that change what the server returns — `stack`, `partition`, `downSampleRatio`. The
 * package bundles those into one object with the transport fields, since its
 * `TiledArrayRequestOptions` extends `TiledRequestOptions`; the hooks split them apart again and
 * recombine before the call, so `requestOptions` means transport here exactly as it does everywhere
 * else. The convention is stated in full, once, in `@/api/shared/queryOptions`.
 */
/**
 * The rejection type of every hook.
 *
 * `Error` because `@blueskyproject/tiled` ships no error class of its own: what surfaces is an axios
 * error, a `TiledEndpointUnavailableError`, or a DOM `AbortError`. Narrow with
 * `isTiledEndpointUnavailableError`, or with axios's own `isAxiosError`.
 */
export type TiledHookError = FinchHookError;
export type { FinchMutationOptions, FinchQueryOptions } from '../../shared/queryOptions';
//# sourceMappingURL=types.d.ts.map