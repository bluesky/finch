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
import { QSERVER_PATHS } from '../types/paths';
import { payloadAs, type QServerEndpointDescriptor } from '../types/registry';

/**
 * Authentication and API-key management.
 *
 * These are the only endpoints with real schemas in the spec. They also assume the server
 * runs with an authentication provider configured: in `UNAUTHENTICATED_SINGLE_USER` mode
 * several answer 401 or 500, which is expected rather than a client bug.
 */
export interface QServerAuthEndpoints {
    /** `GET /api/auth/whoami` — the calling principal. */
    whoami(options?: QServerRequestOptions): Promise<WhoamiResponse>;
    /** `GET /api/auth/scopes` — roles and scopes granted to the caller. */
    getScopes(options?: QServerRequestOptions): Promise<ScopesResponse>;
    /** `GET /api/auth/principal` — list principals (admin only). */
    listPrincipals(options?: QServerRequestOptions): Promise<PrincipalListResponse>;
    /** `GET /api/auth/principal/{uuid}` — one principal (admin only). */
    getPrincipal(uuid: string, options?: QServerRequestOptions): Promise<PrincipalResponse>;
    /** `POST /api/auth/principal/{uuid}/apikey` — mint a key for another principal. */
    createApiKeyForPrincipal(
        uuid: string,
        body: APIKeyRequestParams,
        options?: QServerRequestOptions,
    ): Promise<NewApiKeyResponse>;
    /** `POST /api/auth/apikey` — mint a key for the caller. The secret is shown once. */
    createApiKey(
        body: APIKeyRequestParams,
        options?: QServerRequestOptions,
    ): Promise<NewApiKeyResponse>;
    /** `GET /api/auth/apikey` — metadata about the key authenticating this request. */
    getCurrentApiKeyInfo(options?: QServerRequestOptions): Promise<CurrentApiKeyInfoResponse>;
    /** `DELETE /api/auth/apikey?first_eight=` — revoke a key. */
    revokeApiKey(firstEight: string, options?: QServerRequestOptions): Promise<unknown>;
    /** `POST /api/auth/session/refresh` — exchange a refresh token for new tokens. */
    refreshSession(
        body: SessionRefreshBody,
        options?: QServerRequestOptions,
    ): Promise<AccessAndRefreshTokens>;
    /** `DELETE /api/auth/session/revoke/{session_id}` — revoke a refresh-token session. */
    revokeSession(sessionId: string, options?: QServerRequestOptions): Promise<unknown>;
    /** `POST /api/auth/logout` — clear the auth cookie. */
    logout(options?: QServerRequestOptions): Promise<LogoutResponse>;
}

export const authEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 'auth.whoami',
        group: 'auth',
        method: 'GET',
        path: QSERVER_PATHS.authWhoami,
        fn: 'whoami',
        summary: 'The calling principal.',
        browserSafe: true,
        call: (client) => client.whoami(),
    },
    {
        id: 'auth.scopes',
        group: 'auth',
        method: 'GET',
        path: QSERVER_PATHS.authScopes,
        fn: 'getScopes',
        summary: 'Roles and scopes granted to the caller.',
        browserSafe: true,
        call: (client) => client.getScopes(),
    },
    {
        id: 'auth.principalList',
        group: 'auth',
        method: 'GET',
        path: QSERVER_PATHS.authPrincipal,
        fn: 'listPrincipals',
        summary: 'List principals (admin only).',
        browserSafe: true,
        call: (client) => client.listPrincipals(),
    },
    {
        id: 'auth.principalGet',
        group: 'auth',
        method: 'GET',
        path: QSERVER_PATHS.authPrincipalByUuid,
        fn: 'getPrincipal',
        summary: 'One principal by uuid (admin only).',
        browserSafe: true,
        params: [{ name: 'uuid', in: 'path', required: true }],
        call: (client, input) => client.getPrincipal(input.params?.uuid ?? ''),
    },
    {
        id: 'auth.principalApikeyNew',
        group: 'auth',
        method: 'POST',
        path: QSERVER_PATHS.authPrincipalByUuidApikey,
        fn: 'createApiKeyForPrincipal',
        summary: 'Mint an API key for another principal (admin only).',
        browserSafe: true,
        params: [{ name: 'uuid', in: 'path', required: true }],
        sampleBody: { expires_in: 600, scopes: ['inherit'], note: 'finch test' },
        call: (client, input) =>
            client.createApiKeyForPrincipal(
                input.params?.uuid ?? '',
                payloadAs<APIKeyRequestParams>(input),
            ),
    },
    {
        id: 'auth.apikeyNew',
        group: 'auth',
        method: 'POST',
        path: QSERVER_PATHS.authApikey,
        fn: 'createApiKey',
        summary: 'Mint an API key for the caller.',
        browserSafe: true,
        sampleBody: { expires_in: 600, scopes: ['inherit'], note: 'finch test' },
        call: (client, input) => client.createApiKey(payloadAs<APIKeyRequestParams>(input)),
    },
    {
        id: 'auth.apikeyInfo',
        group: 'auth',
        method: 'GET',
        path: QSERVER_PATHS.authApikey,
        fn: 'getCurrentApiKeyInfo',
        summary: 'Metadata about the key used for this request.',
        browserSafe: true,
        call: (client) => client.getCurrentApiKeyInfo(),
    },
    {
        id: 'auth.apikeyRevoke',
        group: 'auth',
        method: 'DELETE',
        path: QSERVER_PATHS.authApikey,
        fn: 'revokeApiKey',
        summary: 'Revoke an API key by its first eight characters.',
        browserSafe: true,
        destructive: true,
        params: [{ name: 'first_eight', in: 'query', required: true }],
        call: (client, input) => client.revokeApiKey(input.params?.first_eight ?? ''),
    },
    {
        id: 'auth.sessionRefresh',
        group: 'auth',
        method: 'POST',
        path: QSERVER_PATHS.authSessionRefresh,
        fn: 'refreshSession',
        summary: 'Exchange a refresh token for new tokens.',
        browserSafe: true,
        sampleBody: { refresh_token: '' },
        call: (client, input) => client.refreshSession(payloadAs<SessionRefreshBody>(input)),
    },
    {
        id: 'auth.sessionRevoke',
        group: 'auth',
        method: 'DELETE',
        path: QSERVER_PATHS.authSessionRevokeBySessionId,
        fn: 'revokeSession',
        summary: 'Revoke a refresh-token session.',
        browserSafe: true,
        destructive: true,
        params: [{ name: 'session_id', in: 'path', required: true }],
        call: (client, input) => client.revokeSession(input.params?.session_id ?? ''),
    },
    {
        id: 'auth.logout',
        group: 'auth',
        method: 'POST',
        path: QSERVER_PATHS.authLogout,
        fn: 'logout',
        summary: 'Clear the authentication cookie.',
        browserSafe: true,
        destructive: true,
        call: (client) => client.logout(),
    },
];
