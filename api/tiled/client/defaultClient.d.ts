import { AxiosInstance } from 'axios';
import { InterceptorHandle, TiledErrorInterceptor, TiledRequestInterceptor, TiledResponseInterceptor } from '../types/common';
import { TiledApiKeyLocation, TiledApiKeyScheme, TiledAuthErrorCallback } from '../types/requestOptions';
import { TiledApiClient, TiledApiClientConfig } from './TiledApiClient';
import { TiledStoredTokens, TiledTokenStorage } from './tokenStorage';
/** Construct a client without touching the singleton. */
export declare function createTiledApiClient(config?: TiledApiClientConfig): TiledApiClient;
/** The active client, constructed from `window.location` defaults on first use. */
export declare function getDefaultTiledApiClient(): TiledApiClient;
/** Install a caller-built client as the app-wide instance. */
export declare function setDefaultTiledApiClient(client: TiledApiClient): void;
/** Discard the active client. The next call builds a fresh one; useful in `beforeEach`. */
export declare function resetDefaultTiledApiClient(): void;
/**
 * Apply a partial configuration to the active client, creating it if needed.
 * Only the provided keys are touched.
 */
export declare function configureTiledClient(config: TiledApiClientConfig): TiledApiClient;
/**
 * The base URL every subsequent request uses. **Must include the `/api/v1` segment.**
 *
 * Nothing appends it for you: a base URL is the one piece of configuration that cannot be guessed
 * at without risking a misconfigured app silently talking to a URL it never asked for.
 */
export declare function setDefaultTiledUrl(baseUrl: string): void;
export declare function getDefaultTiledUrl(): string;
/** The path prefix prepended to every relative request path. */
export declare function setDefaultInitialPath(initialPath: string): void;
export declare function getDefaultTiledInitialPath(): string;
/** Adopt a caller-built axios instance, carrying interceptors over to it. */
export declare function setGlobalTiledAxiosClient(client: AxiosInstance): void;
export declare function getGlobalTiledAxiosClient(): AxiosInstance;
/** Default byte budget for array reads, so large images downsample instead of saturating the link. */
export declare function setGlobalMaxArrayBytes(maxArrayBytes: number | undefined): void;
export declare function getGlobalMaxArrayBytes(): number | undefined;
/** Swap the API key used by every subsequent request. Effective immediately; nothing to rebuild. */
export declare function setGlobalApiKey(apiKey: string | null): void;
export declare function getGlobalApiKey(): string | null;
export declare function setDefaultBearerToken(token: string | null): void;
/** Seed or clear the app-wide client's session — bearer token and stored refresh token together. */
export declare function setGlobalTiledSession(tokens: TiledStoredTokens | null): void;
export declare function getGlobalTiledSession(): TiledStoredTokens | null;
export declare function clearGlobalTiledAuth(): void;
/** `'header'` (default) or `'query'` (`?api_key=`), for `<img src>` and future websockets. */
export declare function setGlobalTiledApiKeyLocation(location: TiledApiKeyLocation): void;
/** `'ApiKey'` (default, the package's casing) or `'Apikey'` (Tiled's documented casing). */
export declare function setGlobalTiledApiKeyScheme(scheme: TiledApiKeyScheme): void;
export declare function setDefaultAuthErrorCallback(callback: TiledAuthErrorCallback | undefined): void;
/** Replace where login tokens are persisted — memory in tests, `localStorage` in a browser. */
export declare function setGlobalTiledTokenStorage(storage: TiledTokenStorage): void;
export declare function addRequestInterceptor(onFulfilled: TiledRequestInterceptor, onRejected?: TiledErrorInterceptor): InterceptorHandle;
export declare function addResponseInterceptor(onFulfilled: TiledResponseInterceptor, onRejected?: TiledErrorInterceptor): InterceptorHandle;
export declare function ejectInterceptor(handle: InterceptorHandle): boolean;
/** Remove caller-registered interceptors; the built-in auth handlers are untouched. */
export declare function clearInterceptors(kind?: 'request' | 'response'): void;
export declare function listInterceptors(): readonly InterceptorHandle[];
//# sourceMappingURL=defaultClient.d.ts.map