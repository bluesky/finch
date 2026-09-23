import { AxiosInstance } from 'axios';
import { ApiKeyLocation, ApiKeyScheme, GetBodyStrategy, InterceptorHandle, QServerAuthErrorCallback, QServerErrorInterceptor, QServerRequestInterceptor, QServerResponseInterceptor } from '../types/common';
import { QServerApiClient, QServerClientConfig, QServerFallbackInfo } from './QServerApiClient';
/** Construct a client without touching the singleton. */
export declare function createQServerApiClient(config?: QServerClientConfig): QServerApiClient;
/** The active client, constructed from `window.location` defaults on first use. */
export declare function getDefaultQServerClient(): QServerApiClient;
/** Install a caller-built client as the app-wide instance. */
export declare function setDefaultQServerClient(client: QServerApiClient): void;
/** Discard the active client. The next call builds a fresh one; useful in `beforeEach`. */
export declare function resetDefaultQServerClient(): void;
/**
 * Apply a partial configuration to the active client, creating it if needed.
 * Only the provided keys are touched.
 */
export declare function configureQServerClient(config: QServerClientConfig): QServerApiClient;
/** Swap the API key used by every subsequent request. */
export declare function setGlobalApiKey(apiKey: string | null): void;
export declare function getGlobalApiKey(): string | null;
export declare function setGlobalBearerToken(token: string | null): void;
export declare function setGlobalRefreshToken(token: string | null): void;
export declare function clearGlobalAuth(): void;
/** `'header'` (default) or `'query'` (`?api_key=`). */
export declare function setGlobalApiKeyLocation(location: ApiKeyLocation): void;
export declare function setGlobalApiKeyScheme(scheme: ApiKeyScheme): void;
export declare function setGlobalAuthErrorCallback(callback: QServerAuthErrorCallback | undefined): void;
/** Server **origin**; a trailing `/api` is stripped, since spec paths already include it. */
export declare function setGlobalBaseUrl(baseUrl: string): void;
export declare function getGlobalBaseUrl(): string;
/** Adopt a caller-built axios instance, carrying interceptors over to it. */
export declare function setGlobalAxiosClient(client: AxiosInstance): void;
export declare function getGlobalAxiosClient(): AxiosInstance;
export declare function setGlobalGetBodyStrategy(strategy: GetBodyStrategy): void;
export declare function setGlobalFallbackCallback(callback: ((info: QServerFallbackInfo) => void) | undefined): void;
export declare function addRequestInterceptor(onFulfilled: QServerRequestInterceptor, onRejected?: QServerErrorInterceptor): InterceptorHandle;
export declare function addResponseInterceptor(onFulfilled: QServerResponseInterceptor, onRejected?: QServerErrorInterceptor): InterceptorHandle;
export declare function ejectInterceptor(handle: InterceptorHandle): boolean;
/** Remove caller-registered interceptors; the built-in auth handlers are untouched. */
export declare function clearInterceptors(kind?: 'request' | 'response'): void;
export declare function listInterceptors(): readonly InterceptorHandle[];
//# sourceMappingURL=defaultClient.d.ts.map