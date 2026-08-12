import type { APIKey, APIKeyWithSecret, Principal } from './generatedAliases';

/**
 * Auth endpoints are the only part of the spec with real schemas, so these are thin
 * aliases over the generated types.
 *
 * Most of them only work when the server runs with an authentication provider
 * configured; in `UNAUTHENTICATED_SINGLE_USER` mode several answer 401 or 500.
 */

export type WhoamiResponse = Principal;
export type PrincipalListResponse = Principal[];
export type PrincipalResponse = Principal;

export type NewApiKeyResponse = APIKeyWithSecret;
export type CurrentApiKeyInfoResponse = APIKey;

export interface ScopesResponse {
    roles: string[];
    scopes: string[];
}

export interface SessionRefreshBody {
    refresh_token: string;
}

export interface LogoutResponse {
    [key: string]: unknown;
}
