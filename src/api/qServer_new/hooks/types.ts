import type { QueryKey, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import type { QServerRequestOptions } from '../types/common';

/**
 * Shared option shapes for the queue-server hooks.
 *
 * Every hook takes exactly **one** optional object, carrying up to three things: the endpoint's own
 * argument, transport overrides (`request`), and TanStack options (`query` / `mutation`). Keeping
 * them in separate, named buckets is what makes a call like
 * `useQueueGetQuery({ refetchInterval: 1000 })` a compile error rather than being silently read as a
 * request payload — which matters, because the legacy hooks in `src/api/qServer/hooks.ts` took
 * TanStack options in exactly that position.
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
 * The shape every query hook's argument extends.
 *
 * @typeParam TResponse The endpoint's response type.
 * @typeParam TData What the hook returns — differs from `TResponse` only when `query.select` is used.
 * @typeParam TQueryKey The key this resource produces; see `QServerQueryKeyFor`.
 * @typeParam TRequest `GetWithBodyOptions<TResponse>` for the payload-GET endpoints (so `strategy`
 * and `fallback` are reachable), plain `QServerRequestOptions` for the rest.
 */
export interface QServerQueryHookOptions<
    TResponse,
    TData,
    TQueryKey extends QueryKey,
    TRequest extends QServerRequestOptions = QServerRequestOptions,
> {
    /**
     * Per-call transport overrides, forwarded to the client method's last parameter — a different
     * `baseUrl` or `apiKey`, extra headers, an abort signal, `axiosConfig`.
     *
     * `baseUrl` participates in the query key, so two hooks pointed at different servers keep
     * separate cache entries.
     */
    request?: TRequest;
    /**
     * Standard TanStack query options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
     *
     * `queryKey` and `queryFn` are owned by the hook. That is deliberate rather than defensive:
     * the invalidation map is only correct while the key is the one `qServerQueryKeys` produced, so
     * overriding it would silently detach the entry from every mutation that should refresh it.
     */
    query?: Omit<
        UseQueryOptions<TResponse, QServerHookError, TData, TQueryKey>,
        'queryKey' | 'queryFn'
    >;
}

/**
 * The shape every mutation hook's argument extends.
 *
 * The request body is **not** here — it travels through `mutate(variables)` / `mutateAsync`, so one
 * hook instance can perform many different writes.
 *
 * @typeParam TResponse The endpoint's response type.
 * @typeParam TVariables What `mutate` accepts. `void` for endpoints that take no body.
 * @typeParam TContext Inferred from `mutation.onMutate`, for optimistic updates.
 */
export interface QServerMutationHookOptions<TResponse, TVariables, TContext = unknown> {
    /** Per-call transport overrides, forwarded to the client method's last parameter. */
    request?: QServerRequestOptions;
    /**
     * Standard TanStack mutation options.
     *
     * `mutationFn` is owned by the hook. `onSuccess` is *composed*: the hook's cache invalidation
     * runs and is awaited first, then yours — so by the time your handler runs, the affected
     * queries have already refetched.
     */
    mutation?: Omit<
        UseMutationOptions<TResponse, QServerHookError, TVariables, TContext>,
        'mutationFn'
    >;
}
