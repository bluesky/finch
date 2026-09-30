import type { QueryKey, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

/**
 * The calling convention every Finch backend hook follows, and the TanStack option shapes it uses.
 *
 * Shared by `@/api/qServer/hooks` and `@/api/tiled/hooks` (and whatever comes next) so the backends
 * present one convention rather than several near-identical ones. **This file is the canonical
 * statement of it** — the place to read before adding a backend.
 *
 * ## Slot order
 *
 * ```ts
 * useXSomethingQuery(...endpointArgs, queryOptions?, requestOptions?);
 * useXSomethingMutation(mutationOptions?, requestOptions?);
 * ```
 *
 * Positional, and `requestOptions` is **always last**, with the TanStack options immediately before
 * it. The order follows how often each slot is used: `enabled` / `refetchInterval` / `select` appear
 * at nearly every call site, while `requestOptions` — a one-off server, key or client for *this call
 * only* — is rare. Putting transport last means the common call needs no placeholder:
 *
 * ```ts
 * useQueueGetQuery({ refetchInterval: 1000 });
 * useQueueGetQuery({ refetchInterval: 1000 }, { baseUrl: 'http://other:60610' });
 * ```
 *
 * ## The endpoint's own arguments
 *
 * Come first, named and typed so hover says what is required. Two shapes, and the difference is
 * deliberate:
 *
 * - **`arg?: T`** — the endpoint has a meaningful zero-argument form.
 *   `useQueueGetPlansAllowedQuery()` is a complete, correct call.
 * - **`arg: T | undefined`** — the endpoint cannot be called without it. Positionally required, so a
 *   caller who does not have the value yet writes `undefined` on purpose; the hook then idles rather
 *   than firing a malformed request. Forcing `enabled: true` past that guard raises
 *   `FinchMissingArgumentError` (see `./errors.ts`).
 *
 * Naming: a JSON request body is always `body`. A path or query scalar keeps the endpoint's own name
 * for that segment (`uuid`, `arrayPath`, `searchPath`). A structured non-body parameter keeps its
 * domain name (`filter`, `searchOptions`, `arrayOptions`, `type`, `endpoint`). Mutation variables
 * never occupy a slot — they travel through `mutate(variables)`.
 *
 * ## The other two slots
 *
 * `requestOptions` is transport only, per `./requestOptions.ts`. Endpoint parameters that change what
 * the server returns never belong there, even when the underlying package bundles them together.
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

/**
 * Resolve a query's `enabled` from the caller's options and the hook's own guard.
 *
 * Must be applied **after** the caller's options are spread, not merged into them. An options object
 * carrying `enabled: undefined` is trivially produced by spreading props, and if it lands on top of
 * the hook's guard it clobbers it — a hook that should have stayed idle fires with a missing
 * argument. Spreading last and resolving here makes `undefined` fall through to the guard, which is
 * what a caller passing it means.
 *
 * Both backends' query engines route through this so the rule is stated once. `enabled` is typed
 * loosely because TanStack v5 also accepts a function of the query; a non-boolean is passed straight
 * back for TanStack to interpret.
 */
export function resolveEnabled<T>(
    callerEnabled: T | undefined,
    defaultEnabled?: boolean,
): T | boolean {
    return callerEnabled ?? defaultEnabled ?? true;
}
