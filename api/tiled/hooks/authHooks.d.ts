import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { TiledAuthProvider, TiledRequestOptions } from '../types/common';
import { TiledLoginTokens } from '../types/requestOptions';
import { TiledQueryKeyFor } from './queryKeys';
import { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
/**
 * Authentication hooks.
 *
 * ## These endpoints are not in the OpenAPI schema
 *
 * Tiled generates `openapi.json` without its auth router, so there is no spec entry for any of
 * them. What the spec *does* carry is `AboutAuthenticationLinks`, and the client resolves every URL
 * from `GET /api/v1/`'s `authentication.links` rather than hard-coding paths. See
 * `client/TiledApiClient.ts`.
 *
 * ## A server with authentication disabled
 *
 * Reports `authentication: { required: false, providers: [], links: null }` — verified against
 * Tiled 0.2.15b1. Every hook below except `useTiledLoginMutation` then rejects with a
 * `TiledApiError` saying so, rather than requesting a URL built from `null`. Check
 * `useTiledServerInfoQuery().data?.authentication?.required` before offering a login UI at all.
 */
/** What `mutate` takes. `url` and `provider` are both optional overrides. */
export interface TiledLoginVariables {
    username: string;
    password: string;
    /** Server URL override. Defaults to the resolved client's own base URL. */
    url?: string;
    /**
     * A pre-fetched auth provider — e.g. one picked out of
     * `useTiledServerInfoQuery().data?.authentication?.providers`. Omit it and the client uses the
     * first password/internal provider the server advertises.
     */
    provider?: TiledAuthProvider;
}
/**
 * Log in with a username and password.
 *
 * On success the tokens are persisted (`localStorage` in a browser, memory elsewhere — see
 * `client/tokenStorage.ts`), set as the client's bearer token, and refreshed automatically on a
 * later 401. **Resolves `null` on failure rather than rejecting** — a wrong password is
 * `data === null`, not `isError`, so check the resolved value:
 *
 * ```ts
 * const login = useTiledLoginMutation();
 * const tokens = await login.mutateAsync({ username, password });
 * if (!tokens) setError('Login failed');
 * ```
 *
 * Invalidates **every** Tiled query on success: what a caller may see changes with their identity, so
 * every cached read — including a search that legitimately returned nothing — is now suspect.
 * Credentials are deliberately not part of any query key, which is why this has to be handled by
 * invalidating rather than by re-keying.
 *
 * @param mutationOptions TanStack options. `mutate({ username, password, url?, provider? })`.
 * `onSuccess` runs after every Tiled query has been refreshed.
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 */
export declare function useTiledLoginMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<TiledLoginTokens | null, TiledLoginVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<TiledLoginTokens | null, TiledHookError, TiledLoginVariables, TContext>;
/**
 * Who the current credentials identify — the `whoami` link from `About`.
 *
 * Keyed under the `auth` root with `null` args, because the answer is determined entirely by the
 * credentials and credentials are deliberately absent from every query key. That is exactly why a
 * login or key rotation invalidates rather than re-keys.
 */
export declare function useTiledWhoamiQuery<TData = unknown>(queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'auth'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/** What `useTiledCreateApiKeyMutation().mutate` takes. */
export interface TiledCreateApiKeyVariables {
    /** Lifetime in seconds. `null` or omitted means the server's default. */
    expires_in?: number | null;
    /** Scopes to grant. Omitted means every scope the principal already has. */
    scopes?: string[] | null;
    /** A human-readable label, so the key can be recognised later. */
    note?: string | null;
}
/**
 * Mint a new API key for the current principal.
 *
 * **The secret is returned once and never again.** Capture it from the resolved value; there is no
 * endpoint that will tell you what it was.
 */
export declare function useTiledCreateApiKeyMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, TiledCreateApiKeyVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, TiledCreateApiKeyVariables, TContext>;
/** Revoke an API key by its first eight characters — which is all the server will show you of one. */
export declare function useTiledRevokeApiKeyMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, {
    firstEight: string;
}, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, {
    firstEight: string;
}, TContext>;
/**
 * Exchange the stored refresh token for a new access token, explicitly.
 *
 * Rarely needed: the client refreshes on a 401 by itself, single-flight, and retries the original
 * request. This is for the cases that sit outside a request — a tab waking from sleep, or a UI that
 * wants to refresh ahead of a long upload rather than during it.
 */
export declare function useTiledRefreshSessionMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, void, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, void, TContext>;
/** Revoke one session by id. */
export declare function useTiledRevokeSessionMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, {
    sessionId: string;
}, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, {
    sessionId: string;
}, TContext>;
/**
 * Log out.
 *
 * Local credentials are cleared whether or not the server acknowledges — someone who pressed log out
 * is logged out of this tab regardless — and every Tiled query is then invalidated, for the same
 * reason login invalidates them.
 */
export declare function useTiledLogoutMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, void, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, void, TContext>;
//# sourceMappingURL=authHooks.d.ts.map