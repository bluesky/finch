import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { requireArg } from '@/api/shared/errors';
import type {
    CurrentApiKeyInfoResponse,
    LogoutResponse,
    NewApiKeyResponse,
    PrincipalListResponse,
    PrincipalResponse,
    ScopesResponse,
    SessionRefreshBody,
    WhoamiResponse,
} from '../types/auth';
import type { QServerRequestOptions } from '../types/common';
import type { AccessAndRefreshTokens, APIKeyRequestParams } from '../types/generatedAliases';
import { useQServerMutation } from './internal/useQServerMutation';
import { useQServerQuery } from './internal/useQServerQuery';
import { QSERVER_MUTATION_INVALIDATIONS } from './invalidation';
import { qServerQueryKeys, type QServerQueryKeyFor } from './queryKeys';
import type { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
import { useQServerQueryScope } from './useQServerClient';

/**
 * Authentication and API-key hooks.
 *
 * These assume the server runs with an authentication provider configured. In
 * `UNAUTHENTICATED_SINGLE_USER` mode several answer 401 or 500 — that is the server's behaviour, not
 * a client fault. None is in `QServerClientLike`, so all eleven reject with
 * `QServerEndpointUnavailableError` against a partial injected client.
 *
 * The three endpoints that take positional scalars are normalized here into object variables, so
 * `mutate({ firstEight })` reads clearly at the call site.
 */

// #region reads

/**
 * The calling principal: identities, api keys and sessions.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueWhoamiQuery<TData = WhoamiResponse>(
    queryOptions?: FinchQueryOptions<WhoamiResponse, TData, QServerQueryKeyFor<'whoami'>>,
    requestOptions?: QServerRequestOptions,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.whoami(scope),
        fetch: (client, request) => client.whoami(request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Roles and scopes granted to the caller — useful for hiding controls the key cannot use.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetScopesQuery<TData = ScopesResponse>(
    queryOptions?: FinchQueryOptions<ScopesResponse, TData, QServerQueryKeyFor<'scopes'>>,
    requestOptions?: QServerRequestOptions,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.scopes(scope),
        fetch: (client, request) => client.getScopes(request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Every principal. Admin only.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueListPrincipalsQuery<TData = PrincipalListResponse>(
    queryOptions?: FinchQueryOptions<
        PrincipalListResponse,
        TData,
        QServerQueryKeyFor<'principals'>
    >,
    requestOptions?: QServerRequestOptions,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.principals(scope),
        fetch: (client, request) => client.listPrincipals(request),
        requestOptions,
        queryOptions,
    });
}

/**
 * One principal by uuid. Admin only.
 *
 * @param uuid **Required.** The principal's uuid. Part of the query key; pass `undefined` to hold
 * the query idle until one is selected.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetPrincipalQuery<TData = PrincipalResponse>(
    uuid: string | undefined,
    queryOptions?: FinchQueryOptions<PrincipalResponse, TData, QServerQueryKeyFor<'principal'>>,
    requestOptions?: QServerRequestOptions,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.principal(scope, uuid),
        fetch: (client, request) =>
            client.getPrincipal(requireArg(uuid, 'useQueueGetPrincipalQuery', 'uuid'), request),
        requestOptions,
        queryOptions,
        defaultEnabled: Boolean(uuid),
    });
}

/**
 * Metadata about the key authenticating this request — its scopes, note and expiry.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueGetCurrentApiKeyInfoQuery<TData = CurrentApiKeyInfoResponse>(
    queryOptions?: FinchQueryOptions<
        CurrentApiKeyInfoResponse,
        TData,
        QServerQueryKeyFor<'apiKeyInfo'>
    >,
    requestOptions?: QServerRequestOptions,
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.apiKeyInfo(scope),
        fetch: (client, request) => client.getCurrentApiKeyInfo(request),
        requestOptions,
        queryOptions,
    });
}

// #endregion

// #region writes

/**
 * Mint an API key for the caller.
 *
 * The `secret` is returned **once** — capture it from the resolved value. Invalidates nothing: a new
 * key does not change the *current* key's info.
 *
 * @param mutationOptions TanStack options. `mutate({ expires_in, scopes, note })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueCreateApiKeyMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<NewApiKeyResponse, APIKeyRequestParams, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<NewApiKeyResponse, QServerHookError, APIKeyRequestParams, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.createApiKey(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueCreateApiKeyMutation,
        requestOptions,
        mutationOptions,
    });
}

/** `createApiKeyForPrincipal` takes a uuid and a body; they travel together as one variable. */
export interface QueueCreateApiKeyForPrincipalVariables {
    uuid: string;
    body: APIKeyRequestParams;
}

/**
 * Mint an API key for another principal. Admin only.
 *
 * @param mutationOptions TanStack options. `mutate({ uuid, body })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueCreateApiKeyForPrincipalMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        NewApiKeyResponse,
        QueueCreateApiKeyForPrincipalVariables,
        TContext
    >,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<
    NewApiKeyResponse,
    QServerHookError,
    QueueCreateApiKeyForPrincipalVariables,
    TContext
> {
    return useQServerMutation({
        perform: (client, { uuid, body }, request) =>
            client.createApiKeyForPrincipal(uuid, body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueCreateApiKeyForPrincipalMutation,
        requestOptions,
        mutationOptions,
    });
}

/** `revokeApiKey` identifies the key by its first eight characters. */
export interface QueueRevokeApiKeyVariables {
    firstEight: string;
}

/**
 * Revoke an API key.
 *
 * @param mutationOptions TanStack options. `mutate({ firstEight })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueRevokeApiKeyMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<unknown, QueueRevokeApiKeyVariables, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<unknown, QServerHookError, QueueRevokeApiKeyVariables, TContext> {
    return useQServerMutation({
        perform: (client, { firstEight }, request) => client.revokeApiKey(firstEight, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueRevokeApiKeyMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Exchange a refresh token for a new access token.
 *
 * Rarely needed directly: the client refreshes on a 401 by itself when given a `refreshToken`.
 *
 * @param mutationOptions TanStack options. `mutate({ refresh_token })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueRefreshSessionMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<AccessAndRefreshTokens, SessionRefreshBody, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<AccessAndRefreshTokens, QServerHookError, SessionRefreshBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.refreshSession(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueRefreshSessionMutation,
        requestOptions,
        mutationOptions,
    });
}

/** `revokeSession` identifies the session by id. */
export interface QueueRevokeSessionVariables {
    sessionId: string;
}

/**
 * Revoke a refresh-token session, invalidating the chain of tokens it issued.
 *
 * @param mutationOptions TanStack options. `mutate({ sessionId })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueRevokeSessionMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<unknown, QueueRevokeSessionVariables, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<unknown, QServerHookError, QueueRevokeSessionVariables, TContext> {
    return useQServerMutation({
        perform: (client, { sessionId }, request) => client.revokeSession(sessionId, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueRevokeSessionMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Clear the authentication cookie.
 *
 * Invalidates the auth queries; if you also change the client's key, call
 * `invalidateAllQServerQueries` — credentials are deliberately not part of any query key.
 *
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export function useQueueLogoutMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<LogoutResponse, void, TContext>,
    requestOptions?: QServerRequestOptions,
): UseMutationResult<LogoutResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.logout(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueLogoutMutation,
        requestOptions,
        mutationOptions,
    });
}

// #endregion
