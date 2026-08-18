/**
 * Shared option shapes for the Tiled hooks.
 *
 * Every hook takes its arguments **positionally**, in the same order:
 *
 * ```ts
 * useTiledSomethingQuery(...endpointArgs, requestOptions?, queryOptions?);
 * useTiledSomethingMutation(requestOptions?, mutationOptions?);
 * ```
 *
 * The endpoint's own arguments come first, named and typed, so hovering the hook tells you what it
 * needs and whether it is required. A mutation has no argument slot because its variables travel
 * through `mutate(variables)`.
 *
 * The array and table hooks are the one wrinkle: `TiledArrayRequestOptions` and
 * `TiledTableRequestOptions` already *extend* `TiledRequestOptions`, so those hooks have a single
 * combined options slot rather than separate endpoint and transport ones. That is the package's shape,
 * not ours.
 */

/**
 * The rejection type of every hook.
 *
 * Declared as `Error` because `@blueskyproject/tiled` ships no error class of its own: what surfaces
 * is an axios error, a `TiledEndpointUnavailableError`, or a DOM `AbortError`. Narrow with
 * `isTiledEndpointUnavailableError`, or with axios's own `isAxiosError`.
 */
export type TiledHookError = Error;

/**
 * The TanStack option shapes are shared with the other Finch backends — see
 * `@/api/shared/queryOptions`. They are re-exported here so `@/api/tiled_new` stays the only import
 * path a Tiled consumer needs.
 *
 * `queryKey`, `queryFn` and `mutationFn` are omitted from them because the hook owns those:
 * invalidation is only correct while the key is the one `tiledQueryKeys` produced.
 */
export type { FinchMutationOptions, FinchQueryOptions } from '@/api/shared/queryOptions';
