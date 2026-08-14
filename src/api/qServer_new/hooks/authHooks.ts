import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
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
import type {
    QServerHookError,
    QServerMutationHookOptions,
    QServerQueryHookOptions,
} from './types';
import { useQServerClient } from './useQServerClient';

/**
 * Authentication and API-key hooks.
 *
 * These assume the server runs with an authentication provider configured. In
 * `UNAUTHENTICATED_SINGLE_USER` mode several answer 401 or 500 — that is the server's behaviour, not
 * a client fault. None is in `QServerClientLike`, so all eleven reject with
 * `QServerEndpointUnavailableError` against a partial injected client.
 *
 * The four endpoints that take positional scalars are normalized here into object variables, so
 * `mutate({ firstEight })` reads clearly at the call site.
 */

// #region reads

export type UseQueueWhoamiQueryOptions<TData = WhoamiResponse> = QServerQueryHookOptions<
    WhoamiResponse,
    TData,
    QServerQueryKeyFor<'whoami'>,
    QServerRequestOptions
>;

/** The calling principal: identities, api keys and sessions. */
export function useQueueWhoamiQuery<TData = WhoamiResponse>(
    options: UseQueueWhoamiQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.whoami(scope),
        fetch: (client, mergedRequest) => client.whoami(mergedRequest),
        request,
        query,
    });
}

export type UseQueueGetScopesQueryOptions<TData = ScopesResponse> = QServerQueryHookOptions<
    ScopesResponse,
    TData,
    QServerQueryKeyFor<'scopes'>,
    QServerRequestOptions
>;

/** Roles and scopes granted to the caller — useful for hiding controls the key cannot use. */
export function useQueueGetScopesQuery<TData = ScopesResponse>(
    options: UseQueueGetScopesQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.scopes(scope),
        fetch: (client, mergedRequest) => client.getScopes(mergedRequest),
        request,
        query,
    });
}

export type UseQueueListPrincipalsQueryOptions<TData = PrincipalListResponse> =
    QServerQueryHookOptions<
        PrincipalListResponse,
        TData,
        QServerQueryKeyFor<'principals'>,
        QServerRequestOptions
    >;

/** Every principal. Admin only. */
export function useQueueListPrincipalsQuery<TData = PrincipalListResponse>(
    options: UseQueueListPrincipalsQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.principals(scope),
        fetch: (client, mergedRequest) => client.listPrincipals(mergedRequest),
        request,
        query,
    });
}

export interface UseQueueGetPrincipalQueryOptions<
    TData = PrincipalResponse,
> extends QServerQueryHookOptions<
    PrincipalResponse,
    TData,
    QServerQueryKeyFor<'principal'>,
    QServerRequestOptions
> {
    /** Principal uuid. Part of the query key; the query stays idle until it is present. */
    uuid?: string;
}

/** One principal by uuid. Admin only. */
export function useQueueGetPrincipalQuery<TData = PrincipalResponse>(
    options: UseQueueGetPrincipalQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { uuid, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.principal(scope, uuid),
        fetch: (client, mergedRequest) => client.getPrincipal(uuid as string, mergedRequest),
        request,
        query,
        defaultEnabled: Boolean(uuid),
    });
}

export type UseQueueGetCurrentApiKeyInfoQueryOptions<TData = CurrentApiKeyInfoResponse> =
    QServerQueryHookOptions<
        CurrentApiKeyInfoResponse,
        TData,
        QServerQueryKeyFor<'apiKeyInfo'>,
        QServerRequestOptions
    >;

/** Metadata about the key authenticating this request — its scopes, note and expiry. */
export function useQueueGetCurrentApiKeyInfoQuery<TData = CurrentApiKeyInfoResponse>(
    options: UseQueueGetCurrentApiKeyInfoQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.apiKeyInfo(scope),
        fetch: (client, mergedRequest) => client.getCurrentApiKeyInfo(mergedRequest),
        request,
        query,
    });
}

// #endregion

// #region writes

export type UseQueueCreateApiKeyMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    NewApiKeyResponse,
    APIKeyRequestParams,
    TContext
>;

/**
 * Mint an API key for the caller.
 *
 * The `secret` is returned **once** — capture it from the resolved value. Invalidates nothing: a new
 * key does not change the *current* key's info.
 */
export function useQueueCreateApiKeyMutation<TContext = unknown>(
    options: UseQueueCreateApiKeyMutationOptions<TContext> = {},
): UseMutationResult<NewApiKeyResponse, QServerHookError, APIKeyRequestParams, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.createApiKey(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueCreateApiKeyMutation,
        ...options,
    });
}

/** `createApiKeyForPrincipal` takes a uuid and a body; they travel together as one variable. */
export interface QueueCreateApiKeyForPrincipalVariables {
    uuid: string;
    body: APIKeyRequestParams;
}

export type UseQueueCreateApiKeyForPrincipalMutationOptions<TContext = unknown> =
    QServerMutationHookOptions<NewApiKeyResponse, QueueCreateApiKeyForPrincipalVariables, TContext>;

/** Mint an API key for another principal. Admin only. */
export function useQueueCreateApiKeyForPrincipalMutation<TContext = unknown>(
    options: UseQueueCreateApiKeyForPrincipalMutationOptions<TContext> = {},
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
        ...options,
    });
}

/** `revokeApiKey` identifies the key by its first eight characters. */
export interface QueueRevokeApiKeyVariables {
    firstEight: string;
}

export type UseQueueRevokeApiKeyMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    unknown,
    QueueRevokeApiKeyVariables,
    TContext
>;

/** Revoke an API key. */
export function useQueueRevokeApiKeyMutation<TContext = unknown>(
    options: UseQueueRevokeApiKeyMutationOptions<TContext> = {},
): UseMutationResult<unknown, QServerHookError, QueueRevokeApiKeyVariables, TContext> {
    return useQServerMutation({
        perform: (client, { firstEight }, request) => client.revokeApiKey(firstEight, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueRevokeApiKeyMutation,
        ...options,
    });
}

export type UseQueueRefreshSessionMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    AccessAndRefreshTokens,
    SessionRefreshBody,
    TContext
>;

/**
 * Exchange a refresh token for a new access token.
 *
 * Rarely needed directly: the client refreshes on a 401 by itself when given a `refreshToken`.
 */
export function useQueueRefreshSessionMutation<TContext = unknown>(
    options: UseQueueRefreshSessionMutationOptions<TContext> = {},
): UseMutationResult<AccessAndRefreshTokens, QServerHookError, SessionRefreshBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.refreshSession(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueRefreshSessionMutation,
        ...options,
    });
}

/** `revokeSession` identifies the session by id. */
export interface QueueRevokeSessionVariables {
    sessionId: string;
}

export type UseQueueRevokeSessionMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    unknown,
    QueueRevokeSessionVariables,
    TContext
>;

/** Revoke a refresh-token session, invalidating the chain of tokens it issued. */
export function useQueueRevokeSessionMutation<TContext = unknown>(
    options: UseQueueRevokeSessionMutationOptions<TContext> = {},
): UseMutationResult<unknown, QServerHookError, QueueRevokeSessionVariables, TContext> {
    return useQServerMutation({
        perform: (client, { sessionId }, request) => client.revokeSession(sessionId, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueRevokeSessionMutation,
        ...options,
    });
}

export type UseQueueLogoutMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    LogoutResponse,
    void,
    TContext
>;

/**
 * Clear the authentication cookie.
 *
 * Invalidates the auth queries; if you also change the client's key, call
 * `invalidateAllQServerQueries` — credentials are deliberately not part of any query key.
 */
export function useQueueLogoutMutation<TContext = unknown>(
    options: UseQueueLogoutMutationOptions<TContext> = {},
): UseMutationResult<LogoutResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.logout(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueLogoutMutation,
        ...options,
    });
}

// #endregion
