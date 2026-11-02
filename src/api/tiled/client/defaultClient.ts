import type { AxiosInstance } from 'axios';
import type {
    InterceptorHandle,
    TiledErrorInterceptor,
    TiledRequestInterceptor,
    TiledResponseInterceptor,
} from '../types/common';
import type {
    TiledApiKeyLocation,
    TiledApiKeyScheme,
    TiledAuthErrorCallback,
} from '../types/requestOptions';
import { TiledApiClient, type TiledApiClientConfig } from './TiledApiClient';
import type { TiledStoredTokens, TiledTokenStorage } from './tokenStorage';
import { defaultTiledBaseUrl } from './urlUtils';

/**
 * The app-wide Tiled client.
 *
 * A module-level instance plus flat utility functions, so callers can reconfigure every request
 * from anywhere without prop-drilling a client. Same three levels of control as
 * [`qServer/client/defaultClient.ts`](../../qServer/client/defaultClient.ts):
 *
 * 1. mutate the active client — `setGlobalTiledApiKey`, `setDefaultTiledUrl`, …
 * 2. replace it wholesale — `setDefaultTiledApiClient(new TiledApiClient({...}))`
 * 3. override a single call — every endpoint method takes `options.client` / `options.apiKey`
 *
 * The hooks use this whenever no `TiledApiProvider` is mounted, and `FinchConfigProvider` applies
 * `tiledApiUrl` / `tiledApiKey` to it — so most apps need none of these functions directly.
 */

let activeClient: TiledApiClient | null = null;

/** Construct a client without touching the singleton. */
export function createTiledApiClient(config: TiledApiClientConfig = {}): TiledApiClient {
    return new TiledApiClient(config);
}

/** The active client, constructed from `window.location` defaults on first use. */
export function getDefaultTiledApiClient(): TiledApiClient {
    if (!activeClient) {
        activeClient = new TiledApiClient({ baseUrl: defaultTiledBaseUrl() });
    }
    return activeClient;
}

/** Install a caller-built client as the app-wide instance. */
export function setDefaultTiledApiClient(client: TiledApiClient): void {
    activeClient = client;
}

/** Discard the active client. The next call builds a fresh one; useful in `beforeEach`. */
export function resetDefaultTiledApiClient(): void {
    activeClient = null;
}

/**
 * Apply a partial configuration to the active client, creating it if needed.
 * Only the provided keys are touched.
 */
export function configureTiledClient(config: TiledApiClientConfig): TiledApiClient {
    const client = getDefaultTiledApiClient();
    if (config.client) client.setAxiosClient(config.client);
    if (config.baseUrl !== undefined) client.setBaseUrl(config.baseUrl);
    if (config.initialPath !== undefined) client.setInitialPath(config.initialPath);
    if (config.apiKey !== undefined) client.setApiKey(config.apiKey);
    if (config.bearerToken !== undefined) client.setBearerToken(config.bearerToken);
    if (config.apiKeyScheme !== undefined) client.setApiKeyScheme(config.apiKeyScheme);
    if (config.apiKeyLocation !== undefined) client.setApiKeyLocation(config.apiKeyLocation);
    if (config.signal !== undefined) client.setSignal(config.signal);
    if (config.timeout !== undefined) client.setTimeout(config.timeout);
    if (config.maxArrayBytes !== undefined) client.setMaxArrayBytes(config.maxArrayBytes);
    if (config.onAuthError !== undefined) client.setAuthErrorCallback(config.onAuthError);
    if (config.tokenStorage !== undefined) client.setTokenStorage(config.tokenStorage);
    return client;
}

// #region transport utilities

/**
 * The base URL every subsequent request uses. **Must include the `/api/v1` segment.**
 *
 * Nothing appends it for you: a base URL is the one piece of configuration that cannot be guessed
 * at without risking a misconfigured app silently talking to a URL it never asked for.
 */
export function setDefaultTiledUrl(baseUrl: string): void {
    getDefaultTiledApiClient().setBaseUrl(baseUrl);
}

export function getDefaultTiledUrl(): string {
    return getDefaultTiledApiClient().getBaseUrl();
}

/** The path prefix prepended to every relative request path. */
export function setDefaultInitialPath(initialPath: string): void {
    getDefaultTiledApiClient().setInitialPath(initialPath);
}

export function getDefaultTiledInitialPath(): string {
    return getDefaultTiledApiClient().getInitialPath();
}

/** Adopt a caller-built axios instance, carrying interceptors over to it. */
export function setGlobalTiledAxiosClient(client: AxiosInstance): void {
    getDefaultTiledApiClient().setAxiosClient(client);
}

export function getGlobalTiledAxiosClient(): AxiosInstance {
    return getDefaultTiledApiClient().getAxiosClient();
}

/** Default byte budget for array reads, so large images downsample instead of saturating the link. */
export function setGlobalMaxArrayBytes(maxArrayBytes: number | undefined): void {
    getDefaultTiledApiClient().setMaxArrayBytes(maxArrayBytes);
}

export function getGlobalMaxArrayBytes(): number | undefined {
    return getDefaultTiledApiClient().getMaxArrayBytes();
}

// #endregion

// #region auth utilities

/** Swap the API key used by every subsequent request. Effective immediately; nothing to rebuild. */
export function setGlobalApiKey(apiKey: string | null): void {
    getDefaultTiledApiClient().setApiKey(apiKey);
}

export function getGlobalApiKey(): string | null {
    return getDefaultTiledApiClient().getApiKey();
}

export function setDefaultBearerToken(token: string | null): void {
    getDefaultTiledApiClient().setBearerToken(token);
}

/** Seed or clear the app-wide client's session — bearer token and stored refresh token together. */
export function setGlobalTiledSession(tokens: TiledStoredTokens | null): void {
    getDefaultTiledApiClient().setSession(tokens);
}

export function getGlobalTiledSession(): TiledStoredTokens | null {
    return getDefaultTiledApiClient().getStoredTokens();
}

export function clearGlobalTiledAuth(): void {
    getDefaultTiledApiClient().clearAuth();
}

/** `'header'` (default) or `'query'` (`?api_key=`), for `<img src>` and future websockets. */
export function setGlobalTiledApiKeyLocation(location: TiledApiKeyLocation): void {
    getDefaultTiledApiClient().setApiKeyLocation(location);
}

/** `'ApiKey'` (default, the package's casing) or `'Apikey'` (Tiled's documented casing). */
export function setGlobalTiledApiKeyScheme(scheme: TiledApiKeyScheme): void {
    getDefaultTiledApiClient().setApiKeyScheme(scheme);
}

export function setDefaultAuthErrorCallback(callback: TiledAuthErrorCallback | undefined): void {
    getDefaultTiledApiClient().setAuthErrorCallback(callback);
}

/** Replace where login tokens are persisted — memory in tests, `localStorage` in a browser. */
export function setGlobalTiledTokenStorage(storage: TiledTokenStorage): void {
    getDefaultTiledApiClient().setTokenStorage(storage);
}

// #endregion

// #region interceptor utilities

export function addRequestInterceptor(
    onFulfilled: TiledRequestInterceptor,
    onRejected?: TiledErrorInterceptor,
): InterceptorHandle {
    return getDefaultTiledApiClient().addRequestInterceptor(onFulfilled, onRejected);
}

export function addResponseInterceptor(
    onFulfilled: TiledResponseInterceptor,
    onRejected?: TiledErrorInterceptor,
): InterceptorHandle {
    return getDefaultTiledApiClient().addResponseInterceptor(onFulfilled, onRejected);
}

export function ejectInterceptor(handle: InterceptorHandle): boolean {
    return getDefaultTiledApiClient().ejectInterceptor(handle);
}

/** Remove caller-registered interceptors; the built-in auth handlers are untouched. */
export function clearInterceptors(kind?: 'request' | 'response'): void {
    getDefaultTiledApiClient().clearInterceptors(kind);
}

export function listInterceptors(): readonly InterceptorHandle[] {
    return getDefaultTiledApiClient().listInterceptors();
}

// #endregion
