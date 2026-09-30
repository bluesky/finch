import type { AxiosInstance } from 'axios';
import type {
    ApiKeyLocation,
    ApiKeyScheme,
    GetBodyStrategy,
    InterceptorHandle,
    QServerAuthErrorCallback,
    QServerErrorInterceptor,
    QServerRequestInterceptor,
    QServerResponseInterceptor,
} from '../types/common';
import {
    QServerApiClient,
    type QServerClientConfig,
    type QServerFallbackInfo,
} from './QServerApiClient';
import { defaultQServerBaseUrl } from './urlUtils';

/**
 * The app-wide queue-server client.
 *
 * Mirrors Tiled's `defaultTiledApiClient`: a module-level instance plus flat utility
 * functions, so callers can reconfigure every request from anywhere without prop-drilling
 * a client. Three levels of control are available:
 *
 * 1. mutate the active client — `setGlobalApiKey`, `setGlobalBaseUrl`, …
 * 2. replace it wholesale — `setDefaultQServerClient(new QServerApiClient({...}))`
 * 3. override a single call — every endpoint method takes `options.client` / `options.apiKey`
 */

let activeClient: QServerApiClient | null = null;

/** Construct a client without touching the singleton. */
export function createQServerApiClient(config: QServerClientConfig = {}): QServerApiClient {
    return new QServerApiClient(config);
}

/** The active client, constructed from `window.location` defaults on first use. */
export function getDefaultQServerClient(): QServerApiClient {
    if (!activeClient) {
        activeClient = new QServerApiClient({ baseUrl: defaultQServerBaseUrl() });
    }
    return activeClient;
}

/** Install a caller-built client as the app-wide instance. */
export function setDefaultQServerClient(client: QServerApiClient): void {
    activeClient = client;
}

/** Discard the active client. The next call builds a fresh one; useful in `beforeEach`. */
export function resetDefaultQServerClient(): void {
    activeClient = null;
}

/**
 * Apply a partial configuration to the active client, creating it if needed.
 * Only the provided keys are touched.
 */
export function configureQServerClient(config: QServerClientConfig): QServerApiClient {
    const client = getDefaultQServerClient();
    if (config.client) client.setAxiosClient(config.client);
    if (config.baseUrl !== undefined) client.setBaseUrl(config.baseUrl);
    if (config.apiKey !== undefined) client.setApiKey(config.apiKey);
    if (config.bearerToken !== undefined) client.setBearerToken(config.bearerToken);
    if (config.refreshToken !== undefined) client.setRefreshToken(config.refreshToken);
    if (config.apiKeyLocation !== undefined) client.setApiKeyLocation(config.apiKeyLocation);
    if (config.apiKeyScheme !== undefined) client.setApiKeyScheme(config.apiKeyScheme);
    if (config.signal !== undefined) client.setSignal(config.signal);
    if (config.timeout !== undefined) client.setTimeout(config.timeout);
    if (config.onAuthError !== undefined) client.setAuthErrorCallback(config.onAuthError);
    if (config.getBodyStrategy !== undefined) client.setGetBodyStrategy(config.getBodyStrategy);
    if (config.onFallback !== undefined) client.setFallbackCallback(config.onFallback);
    return client;
}

// #region auth utilities

/** Swap the API key used by every subsequent request. */
export function setGlobalApiKey(apiKey: string | null): void {
    getDefaultQServerClient().setApiKey(apiKey);
}

export function getGlobalApiKey(): string | null {
    return getDefaultQServerClient().getApiKey();
}

export function setGlobalBearerToken(token: string | null): void {
    getDefaultQServerClient().setBearerToken(token);
}

export function setGlobalRefreshToken(token: string | null): void {
    getDefaultQServerClient().setRefreshToken(token);
}

export function clearGlobalAuth(): void {
    getDefaultQServerClient().clearAuth();
}

/** `'header'` (default) or `'query'` (`?api_key=`). */
export function setGlobalApiKeyLocation(location: ApiKeyLocation): void {
    getDefaultQServerClient().setApiKeyLocation(location);
}

export function setGlobalApiKeyScheme(scheme: ApiKeyScheme): void {
    getDefaultQServerClient().setApiKeyScheme(scheme);
}

export function setGlobalAuthErrorCallback(callback: QServerAuthErrorCallback | undefined): void {
    getDefaultQServerClient().setAuthErrorCallback(callback);
}

// #endregion

// #region transport utilities

/** Server **origin**; a trailing `/api` is stripped, since spec paths already include it. */
export function setGlobalBaseUrl(baseUrl: string): void {
    getDefaultQServerClient().setBaseUrl(baseUrl);
}

export function getGlobalBaseUrl(): string {
    return getDefaultQServerClient().getBaseUrl();
}

/** Adopt a caller-built axios instance, carrying interceptors over to it. */
export function setGlobalAxiosClient(client: AxiosInstance): void {
    getDefaultQServerClient().setAxiosClient(client);
}

export function getGlobalAxiosClient(): AxiosInstance {
    return getDefaultQServerClient().getAxiosClient();
}

export function setGlobalGetBodyStrategy(strategy: GetBodyStrategy): void {
    getDefaultQServerClient().setGetBodyStrategy(strategy);
}

export function setGlobalFallbackCallback(
    callback: ((info: QServerFallbackInfo) => void) | undefined,
): void {
    getDefaultQServerClient().setFallbackCallback(callback);
}

// #endregion

// #region interceptor utilities

export function addRequestInterceptor(
    onFulfilled: QServerRequestInterceptor,
    onRejected?: QServerErrorInterceptor,
): InterceptorHandle {
    return getDefaultQServerClient().addRequestInterceptor(onFulfilled, onRejected);
}

export function addResponseInterceptor(
    onFulfilled: QServerResponseInterceptor,
    onRejected?: QServerErrorInterceptor,
): InterceptorHandle {
    return getDefaultQServerClient().addResponseInterceptor(onFulfilled, onRejected);
}

export function ejectInterceptor(handle: InterceptorHandle): boolean {
    return getDefaultQServerClient().ejectInterceptor(handle);
}

/** Remove caller-registered interceptors; the built-in auth handlers are untouched. */
export function clearInterceptors(kind?: 'request' | 'response'): void {
    getDefaultQServerClient().clearInterceptors(kind);
}

export function listInterceptors(): readonly InterceptorHandle[] {
    return getDefaultQServerClient().listInterceptors();
}

// #endregion
