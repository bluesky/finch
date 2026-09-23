import { CurrentApiKeyInfoResponse, LogoutResponse, NewApiKeyResponse, PrincipalListResponse, PrincipalResponse, ScopesResponse, SessionRefreshBody, WhoamiResponse } from '../types/auth';
import { QServerRequestOptions } from '../types/common';
import { AccessAndRefreshTokens, APIKeyRequestParams } from '../types/generatedAliases';
import { QServerEndpointDescriptor } from '../types/registry';
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
    createApiKeyForPrincipal(uuid: string, body: APIKeyRequestParams, options?: QServerRequestOptions): Promise<NewApiKeyResponse>;
    /** `POST /api/auth/apikey` — mint a key for the caller. The secret is shown once. */
    createApiKey(body: APIKeyRequestParams, options?: QServerRequestOptions): Promise<NewApiKeyResponse>;
    /** `GET /api/auth/apikey` — metadata about the key authenticating this request. */
    getCurrentApiKeyInfo(options?: QServerRequestOptions): Promise<CurrentApiKeyInfoResponse>;
    /** `DELETE /api/auth/apikey?first_eight=` — revoke a key. */
    revokeApiKey(firstEight: string, options?: QServerRequestOptions): Promise<unknown>;
    /** `POST /api/auth/session/refresh` — exchange a refresh token for new tokens. */
    refreshSession(body: SessionRefreshBody, options?: QServerRequestOptions): Promise<AccessAndRefreshTokens>;
    /** `DELETE /api/auth/session/revoke/{session_id}` — revoke a refresh-token session. */
    revokeSession(sessionId: string, options?: QServerRequestOptions): Promise<unknown>;
    /** `POST /api/auth/logout` — clear the auth cookie. */
    logout(options?: QServerRequestOptions): Promise<LogoutResponse>;
}
export declare const authEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=authEndpoints.d.ts.map