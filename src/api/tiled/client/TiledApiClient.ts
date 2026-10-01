import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
    type ResponseType,
} from 'axios';
import type {
    InterceptorHandle,
    TiledBinaryBody,
    TiledBody,
    TiledErrorInterceptor,
    TiledRequestInterceptor,
    TiledResponseInterceptor,
} from '../types/common';
import { TiledApiError, toTiledApiError, type TiledHttpMethod } from '../types/errors';
import type {
    GetDistinctResponse,
    DeliveryResponse,
    PatchMetadataRequest,
    PatchMetadataResponse,
    PostMetadataRequest,
    PostMetadataResponse,
    PutDataSourceRequest,
    PutMetadataRequest,
    PutMetadataResponse,
    WebhookRegistrationRequest,
    WebhookResponse,
} from '../types/generatedAliases';
import {
    isValidTiledInfoResponse,
    type TiledAuthProvider,
    type TiledInfoResponse,
} from '../types/info';
import type { TiledSearchItem, TiledSearchResult, TiledTableRow } from '../types/nodes';
import { TILED_PATHS, buildPath } from '../types/paths';
import type {
    TiledApiKeyLocation,
    TiledApiKeyScheme,
    TiledAuthErrorCallback,
    TiledLoginTokens,
    TiledPathMode,
    TiledRequestOptions,
} from '../types/requestOptions';
import type {
    TiledArrayEndpointParams,
    TiledArrayBufferOptions,
    TiledArrayImagePathOptions,
    TiledArrayJSONOptions,
    TiledArrayOptionsMap,
    TiledArrayPngOptions,
    TiledArrayReturnMap,
    TiledArrayReturnType,
    TiledAwkwardRequestOptions,
    TiledNodeRequestOptions,
    TiledRaggedRequestOptions,
    TiledTableJSONOptions,
    TiledTableJSONSequenceOptions,
    TiledTableOptionsMap,
    TiledTableRequestOptions,
    TiledTableReturnMap,
    TiledTableReturnType,
    TiledTableEndpoint,
} from '../types/dataOptions';
import type { ArrayStructure, TiledStructures } from '../types/structures';
import type { TiledDistinctConfig, TiledSearchConfig } from '../types/searchFilters';
import { buildArraySliceAsync, buildArraySlice, type StructureFetcher } from './arraySlicing';
import { parseJsonSequence, resolveFormat, type TiledFormatName } from './formats';
import { InterceptorRegistry } from './interceptorRegistry';
import { buildDistinctParams, buildSearchParams, type TiledQueryParams } from './searchParams';
import {
    createDefaultTokenStorage,
    type TiledTokenStorage,
    type TiledStoredTokens,
} from './tokenStorage';
import {
    defaultTiledBaseUrl,
    formatIndexTuple,
    normalizeTiledBaseUrl,
    normalizeTiledPath,
    resolveEncodedTiledPath,
    tiledOriginFromBaseUrl,
} from './urlUtils';

export interface TiledApiClientConfig {
    /** Adopt a pre-built axios instance. Built-in interceptors are installed onto it. */
    client?: AxiosInstance;
    /** Server base URL **including** the version segment, e.g. `http://localhost:8000/api/v1`. */
    baseUrl?: string;
    /** Path prefix prepended to every relative request path. */
    initialPath?: string;
    apiKey?: string | null;
    /** Sent as `Authorization: Bearer …`; takes precedence over `apiKey`. */
    bearerToken?: string | null;
    signal?: AbortSignal;
    timeout?: number;
    /** Default byte budget for array reads, overridable per call with `maxBytesAllowed`. */
    maxArrayBytes?: number;
    apiKeyScheme?: TiledApiKeyScheme;
    apiKeyLocation?: TiledApiKeyLocation;
    onAuthError?: TiledAuthErrorCallback;
    /** Where login tokens are persisted. Defaults to `localStorage`, or memory outside a browser. */
    tokenStorage?: TiledTokenStorage;
}

/**
 * How array-valued query parameters are serialised.
 *
 * **`indexes: null` is load-bearing.** Axios's default appends brackets — `column[]=a&column[]=b` —
 * and FastAPI reads a repeated bare key, `column=a&column=b`. The mismatch does not fail loudly: an
 * unrecognised parameter is dropped, so `column` selection silently returned every column and
 * `fields` silently returned every field. The `in` / `notin` filters are worse — their bracketed
 * form makes the server answer **500**.
 *
 * Verified against Tiled 0.2.15b1. This affects `column`, `field`, `form_key`, `fields`, `sort`,
 * `metadata`, and the `keys_filter`, `in`, `notin` and `access_blob_filter` conditions — which is
 * most of the interesting query surface.
 */
const TILED_PARAMS_SERIALIZER = { indexes: null } as const;

/** Marks a request that opted out of credentials entirely (`options.apiKey === null`). */
type AuthAwareConfig = InternalAxiosRequestConfig & { __tiledNoAuth?: boolean };
/** Marks a request that has already been retried once after a 401. */
type RetryableConfig = InternalAxiosRequestConfig & { __tiledRetried?: boolean };

/** Options for the low-level request funnel, beyond the public transport contract. */
interface RequestExtras {
    params?: TiledQueryParams;
    headers?: Record<string, string>;
    responseType?: ResponseType;
    /** Issue against the server origin rather than the `/api/v1` base — `/healthz`, zarr, … */
    origin?: boolean;
}

/**
 * The Tiled API client.
 *
 * Covers every operation in `../openapi.json` plus the auth routes the spec omits. Built on the
 * client in
 * [`tiled-viewer-react`](https://github.com/bluesky/tiled-viewer-react/tree/main/src/components/Tiled/api)
 * — the read paths are ports, not rewrites — and shaped like
 * [`QServerApiClient`](../../qServer/client/QServerApiClient.ts) so the two backends are learnable
 * as one thing.
 *
 * Three levels of control, same as the queue server:
 *
 * 1. mutate the app-wide client — `setGlobalTiledApiKey`, `setDefaultTiledUrl`, …
 * 2. replace it wholesale — `setDefaultTiledApiClient(new TiledApiClient({...}))`
 * 3. override a single call — every method takes `options.baseUrl` / `options.apiKey` /
 *    `options.client`
 *
 * ## Two things that are Tiled's rather than ours
 *
 * **The base URL carries `/api/v1`.** Nothing here appends or strips it — guessing would silently
 * point a misconfigured app at a URL it never asked for. The handful of routes outside the version
 * segment (`/healthz`, `/tiled-ui-settings`, zarr) are issued against the derived origin instead;
 * see `urlUtils.tiledOriginFromBaseUrl`.
 *
 * **`getServerInfo` resolves `null` instead of throwing** when the server is unreachable. Every
 * other method rejects with a {@link TiledApiError}. The asymmetry is upstream's and is preserved,
 * because the login screen depends on it: it asks an unknown server what it supports and needs an
 * answer, not an exception.
 */
export class TiledApiClient {
    private client: AxiosInstance;
    private baseUrl: string;
    private initialPath: string;
    private apiKey: string | null;
    private bearerToken: string | null;
    private signal: AbortSignal | undefined;
    private timeout: number | undefined;
    private maxArrayBytes: number | undefined;
    private apiKeyScheme: TiledApiKeyScheme;
    private apiKeyLocation: TiledApiKeyLocation;
    private authErrorCallback: TiledAuthErrorCallback | undefined;
    private tokenStorage: TiledTokenStorage;
    private interceptors = new InterceptorRegistry();
    private refreshPromise: Promise<string> | null = null;

    constructor(config: TiledApiClientConfig = {}) {
        this.baseUrl = normalizeTiledBaseUrl(config.baseUrl ?? defaultTiledBaseUrl());
        this.initialPath = normalizeTiledPath(config.initialPath ?? '');
        this.apiKey = config.apiKey ?? null;
        this.bearerToken = config.bearerToken ?? null;
        this.signal = config.signal;
        this.timeout = config.timeout;
        this.maxArrayBytes = config.maxArrayBytes;
        this.apiKeyScheme = config.apiKeyScheme ?? 'ApiKey';
        this.apiKeyLocation = config.apiKeyLocation ?? 'header';
        this.authErrorCallback = config.onAuthError;
        this.tokenStorage = config.tokenStorage ?? createDefaultTokenStorage();

        this.client =
            config.client ??
            axios.create({
                baseURL: this.baseUrl,
                // Upstream sets this, and Tiled's cookie-based session flows need it. Note it is
                // also why a cross-origin dev server must allow credentials explicitly rather than
                // answering `Access-Control-Allow-Origin: *`.
                withCredentials: true,
                paramsSerializer: TILED_PARAMS_SERIALIZER,
                ...(this.timeout !== undefined ? { timeout: this.timeout } : {}),
            });

        this.installBuiltinInterceptors();
    }

    // #region configuration

    /** The base URL, **including** the `/api/v1` segment. */
    getBaseUrl(): string {
        return this.baseUrl;
    }

    setBaseUrl(baseUrl: string): void {
        this.baseUrl = normalizeTiledBaseUrl(baseUrl);
        this.client.defaults.baseURL = this.baseUrl;
    }

    getInitialPath(): string {
        return this.initialPath;
    }

    setInitialPath(initialPath: string): void {
        this.initialPath = normalizeTiledPath(initialPath);
    }

    getApiKey(): string | null {
        return this.apiKey;
    }

    /** Takes effect on the next request — the auth interceptor reads the key at request time. */
    setApiKey(apiKey: string | null): void {
        this.apiKey = apiKey;
    }

    getApiKeyScheme(): TiledApiKeyScheme {
        return this.apiKeyScheme;
    }

    setApiKeyScheme(scheme: TiledApiKeyScheme): void {
        this.apiKeyScheme = scheme;
    }

    getApiKeyLocation(): TiledApiKeyLocation {
        return this.apiKeyLocation;
    }

    setApiKeyLocation(location: TiledApiKeyLocation): void {
        this.apiKeyLocation = location;
    }

    getBearerToken(): string | null {
        return this.bearerToken;
    }

    setBearerToken(token: string | null): void {
        this.bearerToken = token;
    }

    /** Drop every credential this client holds, including anything in token storage. */
    clearAuth(): void {
        this.apiKey = null;
        this.bearerToken = null;
        this.tokenStorage.clear();
    }

    getStoredTokens(): TiledStoredTokens | null {
        return this.tokenStorage.read();
    }

    setTokenStorage(storage: TiledTokenStorage): void {
        this.tokenStorage = storage;
    }

    getAxiosClient(): AxiosInstance {
        return this.client;
    }

    /** Adopt a different axios instance, re-installing every interceptor onto it. */
    setAxiosClient(client: AxiosInstance): void {
        this.client = client;
        this.client.defaults.baseURL = this.baseUrl;
        this.interceptors.reinstallOn(client);
    }

    getSignal(): AbortSignal | undefined {
        return this.signal;
    }

    setSignal(signal: AbortSignal | undefined): void {
        this.signal = signal;
    }

    getMaxArrayBytes(): number | undefined {
        return this.maxArrayBytes;
    }

    setMaxArrayBytes(maxArrayBytes: number | undefined): void {
        this.maxArrayBytes = maxArrayBytes;
    }

    setTimeout(timeout: number): void {
        this.timeout = timeout;
        this.client.defaults.timeout = timeout;
    }

    setAuthErrorCallback(callback: TiledAuthErrorCallback | undefined): void {
        this.authErrorCallback = callback;
    }

    /** Everything this client is currently configured with, for diagnostics and test harnesses. */
    getConfigSnapshot(): {
        baseUrl: string;
        origin: string;
        initialPath: string;
        hasApiKey: boolean;
        hasBearerToken: boolean;
        apiKeyScheme: TiledApiKeyScheme;
        apiKeyLocation: TiledApiKeyLocation;
        maxArrayBytes: number | undefined;
        timeout: number | undefined;
    } {
        return {
            baseUrl: this.baseUrl,
            origin: tiledOriginFromBaseUrl(this.baseUrl),
            initialPath: this.initialPath,
            // Never the key itself: a snapshot ends up in logs and test output.
            hasApiKey: this.apiKey !== null,
            hasBearerToken: this.bearerToken !== null,
            apiKeyScheme: this.apiKeyScheme,
            apiKeyLocation: this.apiKeyLocation,
            maxArrayBytes: this.maxArrayBytes,
            timeout: this.timeout,
        };
    }

    // #endregion

    // #region interceptors

    addRequestInterceptor(
        onFulfilled: TiledRequestInterceptor,
        onRejected?: TiledErrorInterceptor,
    ): InterceptorHandle {
        return this.interceptors.registerUser(this.client, (client) => ({
            kind: 'request',
            id: client.interceptors.request.use(onFulfilled, onRejected),
        }));
    }

    addResponseInterceptor(
        onFulfilled: TiledResponseInterceptor,
        onRejected?: TiledErrorInterceptor,
    ): InterceptorHandle {
        return this.interceptors.registerUser(this.client, (client) => ({
            kind: 'response',
            id: client.interceptors.response.use(onFulfilled, onRejected),
        }));
    }

    ejectInterceptor(handle: InterceptorHandle): boolean {
        return this.interceptors.ejectUser(this.client, handle);
    }

    /** Remove caller-registered interceptors; the built-in auth handlers are untouched. */
    clearInterceptors(kind?: 'request' | 'response'): void {
        this.interceptors.clearUsers(this.client, kind);
    }

    listInterceptors(): readonly InterceptorHandle[] {
        return this.interceptors.listUsers();
    }

    private installBuiltinInterceptors(): void {
        this.interceptors.registerBuiltin(this.client, (client) => ({
            kind: 'request',
            id: client.interceptors.request.use((config) => this.applyAuth(config)),
        }));

        this.interceptors.registerBuiltin(this.client, (client) => ({
            kind: 'response',
            id: client.interceptors.response.use(
                (response) => response,
                (error: unknown) => this.handleResponseError(error),
            ),
        }));
    }

    /**
     * Attach credentials, unless the call already carries its own.
     *
     * Reading the key here rather than baking it into a header at construction is what makes
     * `setApiKey` effective immediately, with nothing to rebuild.
     */
    private applyAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
        // `options.apiKey: null` opted this call out of auth entirely.
        if ((config as AuthAwareConfig).__tiledNoAuth) return config;

        const params = (config.params ?? {}) as Record<string, unknown>;
        const alreadyAuthorized = !!config.headers?.Authorization || params.api_key !== undefined;
        if (alreadyAuthorized) return config;

        if (this.bearerToken) {
            config.headers.Authorization = `Bearer ${this.bearerToken}`;
            return config;
        }
        if (!this.apiKey) return config;

        if (this.apiKeyLocation === 'query') {
            config.params = { ...params, api_key: this.apiKey };
        } else {
            config.headers.Authorization = `${this.apiKeyScheme} ${this.apiKey}`;
        }
        return config;
    }

    /** Single-flight 401 refresh, then one retry of the original request. */
    private async handleResponseError(error: unknown): Promise<AxiosResponse> {
        const originalRequest = axios.isAxiosError(error)
            ? (error.config as RetryableConfig | undefined)
            : undefined;
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;

        const canRetry =
            status === 401 &&
            !!originalRequest &&
            !originalRequest.__tiledRetried &&
            !!this.tokenStorage.read();

        if (!canRetry) throw error;

        originalRequest.__tiledRetried = true;
        if (!this.refreshPromise) {
            const origin = tiledOriginFromBaseUrl(originalRequest.baseURL ?? this.baseUrl);
            this.refreshPromise = this.doTokenRefresh(origin).finally(() => {
                this.refreshPromise = null;
            });
        }

        let accessToken: string;
        try {
            // Concurrent 401s all await the first refresh rather than starting their own.
            accessToken = await this.refreshPromise;
        } catch {
            throw error;
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return this.client(originalRequest);
    }

    /**
     * Exchange the refresh token for a new access token.
     *
     * Issued through a bare `axios`, not `this.client`, so a failure cannot re-enter this handler
     * and recurse. Two endpoints are tried because Tiled moved the route: `/auth/session/refresh`
     * is current, `/auth/refresh` is what older servers answer, and a 404 on the first is the
     * documented signal to try the second. Upstream does the same.
     */
    private async doTokenRefresh(origin: string): Promise<string> {
        const stored = this.tokenStorage.read();
        if (!stored) {
            this.authErrorCallback?.(null);
            throw new Error('No stored auth tokens');
        }

        try {
            const body = { refresh_token: stored.refreshToken };
            let accessToken: string | undefined;

            const response = await axios.post<{ access_token?: string; refresh_token?: string }>(
                `${origin}/api/v1/auth/session/refresh`,
                body,
                { timeout: this.timeout, validateStatus: (code) => code < 500 },
            );

            if (response.status === 404) {
                const legacy = await axios.post<{ access_token?: string }>(
                    `${origin}/api/v1/auth/refresh`,
                    body,
                    { timeout: this.timeout },
                );
                accessToken = legacy.data?.access_token;
            } else if (response.status >= 400) {
                throw new Error(`Token refresh failed with ${response.status}`);
            } else {
                accessToken = response.data?.access_token;
            }

            if (!accessToken) throw new Error('No access token returned from refresh endpoint');

            this.tokenStorage.write({ accessToken, refreshToken: stored.refreshToken });
            this.setBearerToken(accessToken);
            return accessToken;
        } catch (refreshError) {
            this.clearAuth();
            this.authErrorCallback?.(refreshError);
            throw refreshError;
        }
    }

    // #endregion

    // #region request funnels

    private resolveClient(options?: TiledRequestOptions): AxiosInstance {
        return options?.client ?? this.client;
    }

    /** The base URL this call should go to: the API base, or the bare origin for `origin` routes. */
    private resolveBaseUrl(options?: TiledRequestOptions, origin = false): string {
        const base =
            options?.baseUrl !== undefined ? normalizeTiledBaseUrl(options.baseUrl) : this.baseUrl;
        return origin ? tiledOriginFromBaseUrl(base) : base;
    }

    /** Resolve a Tiled node path against the initial path, honouring `pathMode`. */
    private encodePath(path: string, options?: TiledRequestOptions): string {
        return resolveEncodedTiledPath(
            path,
            options?.initialPath ?? this.initialPath,
            options?.pathMode ?? ('relative' as TiledPathMode),
        );
    }

    private buildConfig(
        path: string,
        options: TiledRequestOptions | undefined,
        extras: RequestExtras | undefined,
    ): AxiosRequestConfig {
        const headers: Record<string, string> = { ...options?.headers, ...extras?.headers };
        const params: Record<string, unknown> = {};

        // The endpoint's own parameters first, then the caller's `query`, so a caller can override.
        for (const [key, value] of Object.entries(extras?.params ?? {})) {
            if (value !== undefined) params[key] = value;
        }
        for (const [key, value] of Object.entries(options?.query ?? {})) {
            if (value !== undefined) params[key] = value;
        }

        // A per-request key must be applied here; the built-in interceptor defers to it.
        if (options?.apiKey) {
            if (this.apiKeyLocation === 'query') params.api_key = options.apiKey;
            else headers.Authorization = `${this.apiKeyScheme} ${options.apiKey}`;
        }

        return {
            ...options?.axiosConfig,
            baseURL: this.resolveBaseUrl(options, extras?.origin),
            url: path,
            signal: options?.signal ?? this.signal,
            headers,
            params,
            // Also set per request, not just on the instance, so an adopted axios client
            // (`config.client`, or `options.client`) serialises arrays correctly too.
            paramsSerializer: options?.axiosConfig?.paramsSerializer ?? TILED_PARAMS_SERIALIZER,
            ...(extras?.responseType ? { responseType: extras.responseType } : {}),
            // An explicit `null` means "no credentials for this call" — distinct from `undefined`,
            // which inherits the client's. Flagged here so the auth interceptor can tell them apart.
            ...(options?.apiKey === null ? { __tiledNoAuth: true } : {}),
        } as AxiosRequestConfig;
    }

    /** Issue a request and unwrap `response.data`, normalizing failures. */
    protected async request<T>(
        method: TiledHttpMethod,
        path: string,
        data: unknown,
        options?: TiledRequestOptions,
        extras?: RequestExtras,
    ): Promise<T> {
        const client = this.resolveClient(options);
        const config: AxiosRequestConfig = {
            ...this.buildConfig(path, options, extras),
            method,
            ...(data !== undefined ? { data } : {}),
        };

        try {
            const response = await client.request<T>(config);
            return response.data;
        } catch (error) {
            throw toTiledApiError(error, method, path);
        }
    }

    /** Untyped escape hatch for callers who want to declare a shape themselves. */
    requestRaw<T = unknown>(
        method: TiledHttpMethod,
        path: string,
        data?: unknown,
        options?: TiledRequestOptions,
        extras?: {
            params?: TiledQueryParams;
            headers?: Record<string, string>;
            responseType?: ResponseType;
        },
    ): Promise<T> {
        return this.request<T>(method, path, data, options, extras);
    }

    private get<T>(
        path: string,
        options?: TiledRequestOptions,
        extras?: RequestExtras,
    ): Promise<T> {
        return this.request<T>('GET', path, undefined, options, extras);
    }

    private post<T>(
        path: string,
        body: TiledBody | undefined,
        options?: TiledRequestOptions,
        extras?: RequestExtras,
    ): Promise<T> {
        return this.request<T>('POST', path, body ?? {}, options, extras);
    }

    private put<T>(
        path: string,
        body: TiledBody | undefined,
        options?: TiledRequestOptions,
        extras?: RequestExtras,
    ): Promise<T> {
        return this.request<T>('PUT', path, body ?? {}, options, extras);
    }

    private patch<T>(
        path: string,
        body: TiledBody | undefined,
        options?: TiledRequestOptions,
        extras?: RequestExtras,
    ): Promise<T> {
        return this.request<T>('PATCH', path, body ?? {}, options, extras);
    }

    private del<T>(
        path: string,
        options?: TiledRequestOptions,
        extras?: RequestExtras,
    ): Promise<T> {
        return this.request<T>('DELETE', path, undefined, options, extras);
    }

    /**
     * Send a binary payload.
     *
     * The content type is explicit rather than inferred. axios would otherwise guess from the body
     * — `application/json` for a plain array, nothing at all for an `ArrayBuffer` — and Tiled
     * dispatches its writers on exactly this header, so a wrong guess is a 415 or, worse, a
     * successful write of the wrong thing.
     */
    private sendBinary<T>(
        method: 'PUT' | 'PATCH' | 'POST',
        path: string,
        body: TiledBinaryBody | unknown[],
        mimetype: string,
        options?: TiledRequestOptions,
        extras?: RequestExtras,
    ): Promise<T> {
        return this.request<T>(method, path, body, options, {
            ...extras,
            headers: { 'Content-Type': mimetype, ...extras?.headers },
        });
    }

    /**
     * A structure fetcher bound to these request options, for the downsampling helpers.
     *
     * The node may not be an array — a caller can point an array read at a table by mistake — so
     * what comes back is whatever structure the node has. `resolveArrayStructure` validates it and
     * treats a non-array structure as absent, so the request still goes out and the *server*
     * reports the mismatch, rather than the downsampling maths throwing first.
     */
    private makeStructureFetcher(options: TiledRequestOptions): StructureFetcher {
        return (path: string) =>
            this.getMetadata<ArrayStructure>(path, options)
                .then((item) => item.attributes.structure)
                .catch(() => undefined);
    }

    /** Apply the client's array byte budget unless the call set its own. */
    private resolveArrayOptions<T extends TiledArrayEndpointParams>(options: T): T {
        if (this.maxArrayBytes === undefined || options.maxBytesAllowed !== undefined) {
            return options;
        }
        return { ...options, maxBytesAllowed: this.maxArrayBytes };
    }

    // #endregion

    // #region endpoint paths

    private searchPath(path: string, options?: TiledRequestOptions): string {
        const encoded = this.encodePath(path, options);
        // The root container is a legal search target, and the server wants the trailing slash.
        return encoded ? `/search/${encoded}` : '/search/';
    }

    private distinctPath(path: string, options?: TiledRequestOptions): string {
        const encoded = this.encodePath(path, options);
        return encoded ? `/distinct/${encoded}` : '/distinct/';
    }

    private metadataPath(path: string, options?: TiledRequestOptions): string {
        return `/metadata/${this.encodePath(path, options)}`;
    }

    private dataPath(
        kind:
            | 'array/full'
            | 'array/block'
            | 'ragged/full'
            | 'ragged/block'
            | 'table/full'
            | 'table/partition'
            | 'container/full'
            | 'node/full'
            | 'awkward/full'
            | 'awkward/buffers'
            | 'register'
            | 'data_source'
            | 'revisions'
            | 'stream/close'
            | 'asset/bytes'
            | 'asset/manifest'
            | 'webhooks/target',
        path: string,
        options?: TiledRequestOptions,
    ): string {
        return `/${kind}/${this.encodePath(path, options)}`;
    }

    // #endregion

    // #region info

    /**
     * The `/api/v1/` root document: versions, supported formats, auth providers.
     *
     * **Resolves `null` rather than rejecting** when the server is unreachable or answers something
     * that is not an About document. Upstream's behaviour, preserved deliberately — the login flow
     * probes servers it knows nothing about and needs a value back. Every other read on this client
     * rejects with a {@link TiledApiError}.
     */
    async getServerInfo(options: TiledRequestOptions = {}): Promise<TiledInfoResponse | null> {
        try {
            const data = await this.get<unknown>('/', options, {
                headers: { Accept: 'application/json' },
            });
            return isValidTiledInfoResponse(data) ? data : null;
        } catch {
            return null;
        }
    }

    /** The same document, but rejecting on failure. For callers that want the error. */
    getAbout(options: TiledRequestOptions = {}): Promise<TiledInfoResponse> {
        return this.get<TiledInfoResponse>('/', options, {
            headers: { Accept: 'application/json' },
        });
    }

    /** `GET /healthz` — liveness. Outside `/api/v1`, so issued against the origin. */
    getHealth(options: TiledRequestOptions = {}): Promise<unknown> {
        return this.get<unknown>(TILED_PATHS.healthz, options, { origin: true });
    }

    /** `GET /tiled-ui-settings` — the server's hints for its own web UI. */
    getUiSettings(options: TiledRequestOptions = {}): Promise<unknown> {
        return this.get<unknown>(TILED_PATHS.uiSettings, options, { origin: true });
    }

    /** `GET /api/v1/metrics` — Prometheus-style server metrics. */
    getMetrics(options: TiledRequestOptions = {}): Promise<unknown> {
        return this.get<unknown>('/metrics', options);
    }

    // #endregion

    // #region search

    /**
     * `GET /search/{path}` — list and filter the children of a container.
     *
     * `searchPath: ''` is the root container, and legal.
     */
    getSearch(
        searchPath: string,
        config: TiledSearchConfig = {},
        options: TiledRequestOptions = {},
    ): Promise<TiledSearchResult> {
        return this.get<TiledSearchResult>(this.searchPath(searchPath, options), options, {
            params: buildSearchParams(config),
            headers: { Accept: 'application/json' },
        });
    }

    /**
     * `GET /distinct/{path}` — the distinct values of metadata keys, specs and structure families
     * across a container, optionally with counts.
     *
     * New: the package never exposed this, so building a facet UI meant paginating the whole
     * container client-side.
     */
    getDistinct(
        searchPath: string,
        config: TiledDistinctConfig = {},
        options: TiledRequestOptions = {},
    ): Promise<GetDistinctResponse> {
        return this.get<GetDistinctResponse>(this.distinctPath(searchPath, options), options, {
            params: buildDistinctParams(config),
            headers: { Accept: 'application/json' },
        });
    }

    // #endregion

    // #region metadata

    /** `GET /metadata/{path}` — one node's metadata, specs, structure and links. */
    async getMetadata<S extends TiledStructures = TiledStructures>(
        path: string,
        options: TiledRequestOptions = {},
    ): Promise<TiledSearchItem<S>> {
        const response = await this.get<{ data: TiledSearchItem<S> }>(
            this.metadataPath(path, options),
            options,
            { headers: { Accept: 'application/json' } },
        );
        return response.data;
    }

    /**
     * `POST /metadata/{path}` — create a node **inside** the container at `path`.
     *
     * **`parentPath` is the container to create in, not the node being created.** The new node's own
     * key goes in `body.id`; omit it and the server assigns a uuid. Posting to the path you want the
     * node to have answers 404 `No such entry`, which is confusing enough to be worth the parameter
     * name. Verified against Tiled 0.2.15b1.
     *
     * ```ts
     * await client.createNode('', { id: 'processed', structure_family: 'container', … });
     * // creates /processed
     * await client.createNode('processed', { id: 'run1', structure_family: 'array', … });
     * // creates /processed/run1
     * ```
     *
     * For an array or table, `body.data_sources[0].structure` must describe the data you are about
     * to write — the server allocates from it and does not infer it later.
     */
    createNode(
        parentPath: string,
        body: PostMetadataRequest,
        options: TiledRequestOptions = {},
    ): Promise<PostMetadataResponse> {
        return this.post<PostMetadataResponse>(
            this.metadataPath(parentPath, options),
            body,
            options,
        );
    }

    /** `PUT /metadata/{path}` — replace a node's metadata, specs and access blob wholesale. */
    updateMetadata(
        path: string,
        body: PutMetadataRequest,
        params: { drop_revision?: boolean } = {},
        options: TiledRequestOptions = {},
    ): Promise<PutMetadataResponse> {
        return this.put<PutMetadataResponse>(this.metadataPath(path, options), body, options, {
            params,
        });
    }

    /**
     * `PATCH /metadata/{path}` — partial update, in either of two modes.
     *
     * Tiled dispatches on the body's own `content-type` field, not the HTTP header:
     *
     * - `'application/merge-patch+json'` — `metadata` is an object merged into the existing one
     * - `'application/json-patch+json'` — `metadata` is an RFC 6902 operation list
     *
     * One method rather than two, because it is one endpoint and the mode is a property of the
     * body. `patchMetadataMerge` and `patchMetadataJsonPatch` below are the ergonomic wrappers.
     */
    patchMetadata(
        path: string,
        body: PatchMetadataRequest,
        params: { drop_revision?: boolean } = {},
        options: TiledRequestOptions = {},
    ): Promise<PatchMetadataResponse> {
        return this.patch<PatchMetadataResponse>(this.metadataPath(path, options), body, options, {
            params,
        });
    }

    /** {@link patchMetadata} in merge mode: the given fields are merged into what is there. */
    patchMetadataMerge(
        path: string,
        body: {
            metadata?: Record<string, unknown>;
            specs?: PatchMetadataRequest['specs'];
            access_blob?: Record<string, unknown>;
        },
        params: { drop_revision?: boolean } = {},
        options: TiledRequestOptions = {},
    ): Promise<PatchMetadataResponse> {
        return this.patchMetadata(
            path,
            {
                'content-type': 'application/merge-patch+json',
                specs: body.specs ?? null,
                ...(body.metadata !== undefined ? { metadata: body.metadata } : {}),
                ...(body.access_blob !== undefined ? { access_blob: body.access_blob } : {}),
            },
            params,
            options,
        );
    }

    /** {@link patchMetadata} in JSON Patch mode: `metadata` is a list of RFC 6902 operations. */
    patchMetadataJsonPatch(
        path: string,
        body: {
            metadata?: PatchMetadataRequest['metadata'];
            specs?: PatchMetadataRequest['specs'];
            access_blob?: PatchMetadataRequest['access_blob'];
        },
        params: { drop_revision?: boolean } = {},
        options: TiledRequestOptions = {},
    ): Promise<PatchMetadataResponse> {
        return this.patchMetadata(
            path,
            {
                'content-type': 'application/json-patch+json',
                specs: body.specs ?? null,
                ...(body.metadata !== undefined ? { metadata: body.metadata } : {}),
                ...(body.access_blob !== undefined ? { access_blob: body.access_blob } : {}),
            },
            params,
            options,
        );
    }

    /**
     * `DELETE /metadata/{path}` — remove a node.
     *
     * `recursive` deletes children too. `external_only` defaults to **true** server-side, which
     * refuses the delete with a 409 when any of the tree is internally managed — deleting those
     * records would delete the underlying data files. Pass `external_only: false` to mean it.
     * Verified against Tiled 0.2.15b1.
     *
     * Destructive and not undoable; flagged as such in the endpoint registry.
     */
    deleteNode(
        path: string,
        params: { recursive?: boolean; external_only?: boolean } = {},
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        return this.del<unknown>(this.metadataPath(path, options), options, { params });
    }

    // #endregion

    // #region arrays

    /** Generic array dispatcher. Prefer the typed helpers below. */
    async getArrayAs<T extends TiledArrayReturnType>(
        arrayPath: string,
        type: T,
        options: TiledArrayOptionsMap[T] = {} as TiledArrayOptionsMap[T],
    ): Promise<TiledArrayReturnMap[T]> {
        switch (type) {
            // The switch discriminates on `type`, but TypeScript cannot tie that back to the
            // options parameter's own union, so each branch asserts the pairing the map declares.
            case 'JSON':
                return (await this.getArrayAsJSON(
                    arrayPath,
                    options as TiledArrayJSONOptions,
                )) as TiledArrayReturnMap[T];
            case 'PNG':
                return (await this.getArrayAsPng(
                    arrayPath,
                    options as TiledArrayPngOptions,
                )) as TiledArrayReturnMap[T];
            case 'BUFFER':
                return (await this.getArrayAsBuffer(
                    arrayPath,
                    options as TiledArrayBufferOptions,
                )) as TiledArrayReturnMap[T];
            case 'IMAGE_PATH':
                return this.getArrayAsImagePath(
                    arrayPath,
                    options as TiledArrayImagePathOptions,
                ) as TiledArrayReturnMap[T];
            default:
                throw new Error(`Unsupported array return type: ${String(type)}`);
        }
    }

    /** `GET /array/full/{path}` as JSON. Defaults to `number[][]`; override the shape if you know it. */
    async getArrayAsJSON<T = number[][]>(
        arrayPath: string,
        options: TiledArrayJSONOptions = {},
    ): Promise<T> {
        const resolved = this.resolveArrayOptions(options);
        const format = resolved.format ?? 'application/json';
        const slice = await buildArraySliceAsync(
            arrayPath,
            resolved,
            this.makeStructureFetcher(resolved),
        );
        return this.get<T>(this.dataPath('array/full', arrayPath, resolved), resolved, {
            params: { format, slice },
            headers: { Accept: format },
        });
    }

    /**
     * `GET /array/full/{path}` as a PNG `Blob`.
     *
     * **Browser only.** `responseType: 'blob'` is an XHR/fetch concept; under Node the axios HTTP
     * adapter ignores it and the result is not a `Blob` (`size` and `type` read `undefined`). Use
     * {@link getArrayAsBuffer} outside a browser. Inherited behaviour, not introduced here.
     */
    async getArrayAsPng(arrayPath: string, options: TiledArrayPngOptions = {}): Promise<Blob> {
        const resolved = this.resolveArrayOptions(options);
        const format = resolved.format ?? 'image/png';
        const slice = await buildArraySliceAsync(
            arrayPath,
            resolved,
            this.makeStructureFetcher(resolved),
        );
        return this.get<Blob>(this.dataPath('array/full', arrayPath, resolved), resolved, {
            params: { format, slice },
            headers: { Accept: format },
            responseType: 'blob',
        });
    }

    /** `GET /array/full/{path}` as raw bytes. */
    async getArrayAsBuffer(
        arrayPath: string,
        options: TiledArrayBufferOptions = {},
    ): Promise<ArrayBuffer> {
        const resolved = this.resolveArrayOptions(options);
        const format = resolved.format ?? 'application/octet-stream';
        const slice = await buildArraySliceAsync(
            arrayPath,
            resolved,
            this.makeStructureFetcher(resolved),
        );
        return this.get<ArrayBuffer>(this.dataPath('array/full', arrayPath, resolved), resolved, {
            params: { format, slice },
            headers: { Accept: format },
            responseType: 'arraybuffer',
        });
    }

    /**
     * A URL for `<img src>`. **Synchronous**, and therefore makes no request.
     *
     * Being synchronous it cannot fetch the array's structure either, so downsampling only happens
     * when `structure` or `arrayItem` is passed. With `apiKeyLocation: 'query'` the key is appended
     * to the URL, which is the only way an `<img>` can authenticate — note that this puts the key in
     * the DOM and in any referrer logging.
     */
    getArrayAsImagePath(arrayPath: string, options: TiledArrayImagePathOptions = {}): string {
        const resolved = this.resolveArrayOptions(options);
        const base = this.resolveBaseUrl(resolved);
        const url = new URL(`${base}${this.dataPath('array/full', arrayPath, resolved)}`);
        url.searchParams.set('format', resolved.format ?? 'image/png');

        const slice = buildArraySlice(resolved);
        if (slice) url.searchParams.set('slice', slice);

        const key = resolved.apiKey !== undefined ? resolved.apiKey : this.apiKey;
        if (key && this.apiKeyLocation === 'query') url.searchParams.set('api_key', key);

        return url.toString();
    }

    /** `GET /array/block/{path}` — one chunk, addressed by its block index. */
    getArrayBlock(
        arrayPath: string,
        params: { block: number[]; slice?: string; expected_shape?: string; format?: string },
        options: TiledRequestOptions = {},
    ): Promise<ArrayBuffer> {
        const format = params.format ?? 'application/octet-stream';
        return this.get<ArrayBuffer>(this.dataPath('array/block', arrayPath, options), options, {
            params: {
                block: formatIndexTuple(params.block),
                format,
                ...(params.slice !== undefined ? { slice: params.slice } : {}),
                ...(params.expected_shape !== undefined
                    ? { expected_shape: params.expected_shape }
                    : {}),
            },
            headers: { Accept: format },
            responseType: 'arraybuffer',
        });
    }

    /**
     * `PUT /array/full/{path}` — write a whole array.
     *
     * Bytes (`ArrayBuffer` / typed array / `Blob`) are sent as `application/octet-stream` in the
     * array's own dtype and C order — the server trusts the declared structure and does not
     * convert. A nested `number[][]` is sent as JSON instead, which is slower but needs no dtype
     * knowledge. No encoding of one into the other happens here; that was a deliberate scope call,
     * because getting it wrong writes plausible-looking garbage.
     */
    putArrayFull(
        arrayPath: string,
        data: TiledBinaryBody | number[][],
        params: { persist?: boolean } = {},
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        const path = this.dataPath('array/full', arrayPath, options);
        if (Array.isArray(data)) return this.put<unknown>(path, data, options, { params });
        return this.sendBinary<unknown>('PUT', path, data, 'application/octet-stream', options, {
            params,
        });
    }

    /** `PUT /array/block/{path}` — write one chunk. */
    putArrayBlock(
        arrayPath: string,
        data: TiledBinaryBody | number[][],
        params: { block: number[]; persist?: boolean },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        const path = this.dataPath('array/block', arrayPath, options);
        const query = { block: formatIndexTuple(params.block), persist: params.persist };
        if (Array.isArray(data)) return this.put<unknown>(path, data, options, { params: query });
        return this.sendBinary<unknown>('PUT', path, data, 'application/octet-stream', options, {
            params: query,
        });
    }

    /**
     * `PATCH /array/full/{path}` — write a sub-region, optionally growing the array.
     *
     * `offset` and `shape` locate the region and are required. `extend: true` lets the write grow a
     * resizable array past its current bounds, which is how a running scan appends.
     */
    patchArrayFull(
        arrayPath: string,
        data: TiledBinaryBody | number[][],
        params: { offset: number[]; shape: number[]; extend?: boolean; persist?: boolean },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        const path = this.dataPath('array/full', arrayPath, options);
        const query = {
            offset: formatIndexTuple(params.offset),
            shape: formatIndexTuple(params.shape),
            extend: params.extend,
            persist: params.persist,
        };
        if (Array.isArray(data)) return this.patch<unknown>(path, data, options, { params: query });
        return this.sendBinary<unknown>('PATCH', path, data, 'application/octet-stream', options, {
            params: query,
        });
    }

    // #endregion

    // #region ragged arrays

    /** `GET /ragged/full/{path}`. */
    getRaggedFull(path: string, options: TiledRaggedRequestOptions = {}): Promise<unknown> {
        const spec = resolveFormat(options.format ?? 'JSON');
        return this.get<unknown>(this.dataPath('ragged/full', path, options), options, {
            params: {
                format: spec.accept,
                ...(options.slice !== undefined ? { slice: options.slice } : {}),
                ...(options.filename !== undefined ? { filename: options.filename } : {}),
            },
            headers: { Accept: spec.accept },
            responseType: spec.responseType,
        });
    }

    /** `PUT /ragged/full/{path}`. */
    putRaggedFull(
        path: string,
        data: TiledBinaryBody | unknown[],
        params: { persist?: boolean } = {},
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        const target = this.dataPath('ragged/full', path, options);
        if (Array.isArray(data)) return this.put<unknown>(target, data, options, { params });
        return this.sendBinary<unknown>('PUT', target, data, 'application/octet-stream', options, {
            params,
        });
    }

    /** `PUT /ragged/block/{path}`. */
    putRaggedBlock(
        path: string,
        data: TiledBinaryBody | unknown[],
        params: { block: number[]; persist?: boolean },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        const target = this.dataPath('ragged/block', path, options);
        const query = { block: formatIndexTuple(params.block), persist: params.persist };
        if (Array.isArray(data)) return this.put<unknown>(target, data, options, { params: query });
        return this.sendBinary<unknown>('PUT', target, data, 'application/octet-stream', options, {
            params: query,
        });
    }

    /** `PATCH /ragged/full/{path}` — write a sub-region of a ragged array. */
    patchRaggedFull(
        path: string,
        data: TiledBinaryBody | unknown[],
        params: { offset: number[]; shape: number[]; extend?: boolean; persist?: boolean },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        const target = this.dataPath('ragged/full', path, options);
        const query = {
            offset: formatIndexTuple(params.offset),
            shape: formatIndexTuple(params.shape),
            extend: params.extend,
            persist: params.persist,
        };
        if (Array.isArray(data))
            return this.patch<unknown>(target, data, options, { params: query });
        return this.sendBinary<unknown>(
            'PATCH',
            target,
            data,
            'application/octet-stream',
            options,
            {
                params: query,
            },
        );
    }

    // #endregion

    // #region tables

    /** Generic table dispatcher. Prefer the typed helpers below. */
    async getTableAs<T extends TiledTableReturnType>(
        tablePath: string,
        type: T = 'JSON' as T,
        endpoint: TiledTableEndpoint = 'partition',
        options: TiledTableOptionsMap[T] = {} as TiledTableOptionsMap[T],
    ): Promise<TiledTableReturnMap[T]> {
        // As in `getArrayAs`: the switch narrows `type` but not the options union alongside it.
        if (endpoint === 'full') {
            switch (type) {
                case 'JSON':
                    return (await this.getTableFullAsJSON(
                        tablePath,
                        options as TiledTableJSONOptions,
                    )) as TiledTableReturnMap[T];
                case 'JSON_SEQ':
                    return (await this.getTableFullAsJSONSequence(
                        tablePath,
                        options as TiledTableJSONSequenceOptions,
                    )) as TiledTableReturnMap[T];
                default:
                    throw new Error(`Unsupported table return type: ${String(type)}`);
            }
        }
        switch (type) {
            case 'JSON':
                return (await this.getTablePartitionAsJSON(
                    tablePath,
                    options as TiledTableJSONOptions,
                )) as TiledTableReturnMap[T];
            case 'JSON_SEQ':
                return (await this.getTablePartitionAsJSONSequence(
                    tablePath,
                    options as TiledTableJSONSequenceOptions,
                )) as TiledTableReturnMap[T];
            default:
                throw new Error(`Unsupported table return type: ${String(type)}`);
        }
    }

    /** `GET /table/partition/{path}` — one partition, column-oriented. */
    getTablePartitionAsJSON(
        tablePath: string,
        options: TiledTableJSONOptions = {},
    ): Promise<TiledTableReturnMap['JSON']> {
        const format = options.format ?? 'application/json';
        return this.get<TiledTableReturnMap['JSON']>(
            this.dataPath('table/partition', tablePath, options),
            options,
            {
                params: {
                    partition: options.partition ?? 0,
                    format,
                    ...(options.column?.length ? { column: options.column } : {}),
                },
                headers: { Accept: format },
            },
        );
    }

    /** `GET /table/partition/{path}` — one partition, row-oriented. */
    async getTablePartitionAsJSONSequence(
        tablePath: string,
        options: TiledTableJSONSequenceOptions = {},
    ): Promise<TiledTableRow[]> {
        const format = options.format ?? 'application/json-seq';
        const body = await this.get<unknown>(
            this.dataPath('table/partition', tablePath, options),
            options,
            {
                params: {
                    partition: options.partition ?? 0,
                    format,
                    ...(options.column?.length ? { column: options.column } : {}),
                },
                headers: { Accept: format },
                responseType: 'text',
            },
        );
        return parseJsonSequence(body) as TiledTableRow[];
    }

    /** `GET /table/full/{path}` — every partition, column-oriented. */
    getTableFullAsJSON(
        tablePath: string,
        options: TiledTableJSONOptions = {},
    ): Promise<TiledTableReturnMap['JSON']> {
        const format = options.format ?? 'application/json';
        return this.get<TiledTableReturnMap['JSON']>(
            this.dataPath('table/full', tablePath, options),
            options,
            {
                params: {
                    format,
                    ...(options.column?.length ? { column: options.column } : {}),
                },
                headers: { Accept: format },
            },
        );
    }

    /** `GET /table/full/{path}` — every partition, row-oriented. */
    async getTableFullAsJSONSequence(
        tablePath: string,
        options: TiledTableJSONSequenceOptions = {},
    ): Promise<TiledTableRow[]> {
        const format = options.format ?? 'application/json-seq';
        const body = await this.get<unknown>(
            this.dataPath('table/full', tablePath, options),
            options,
            {
                params: {
                    format,
                    ...(options.column?.length ? { column: options.column } : {}),
                },
                headers: { Accept: format },
                responseType: 'text',
            },
        );
        return parseJsonSequence(body) as TiledTableRow[];
    }

    /**
     * `GET /table/full/{path}` in any representation — CSV, parquet, arrow, Excel, HDF5.
     *
     * The format decides the return type; see `client/formats.ts`. This is how a download button is
     * built without hand-rolling an `Accept` header and an axios `responseType`.
     */
    getTableFullAs(
        tablePath: string,
        format: TiledFormatName | string,
        options: TiledTableRequestOptions = {},
    ): Promise<unknown> {
        const spec = resolveFormat(format);
        return this.get<unknown>(this.dataPath('table/full', tablePath, options), options, {
            params: {
                format: spec.accept,
                ...(options.column?.length ? { column: options.column } : {}),
            },
            headers: { Accept: spec.accept },
            responseType: spec.responseType,
        });
    }

    /**
     * `POST /table/full/{path}` — the same read, with the column list in the body.
     *
     * A read, despite the verb: the body selects columns rather than changing anything. It exists
     * for selections too long for a query string. The hook for this is a **query**, for the same
     * reason `useQueueGetRunsQuery` is.
     */
    postTableFull(
        tablePath: string,
        columns: string[] | null,
        params: { format?: string; filename?: string } = {},
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        const spec = resolveFormat(params.format ?? 'JSON');
        return this.request<unknown>(
            'POST',
            this.dataPath('table/full', tablePath, options),
            columns,
            options,
            {
                params: { format: spec.accept, filename: params.filename },
                headers: { Accept: spec.accept },
                responseType: spec.responseType,
            },
        );
    }

    /** `POST /table/partition/{path}` — one partition, column list in the body. A read. */
    postTablePartition(
        tablePath: string,
        columns: string[] | null,
        params: { partition: number; format?: string; filename?: string },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        const spec = resolveFormat(params.format ?? 'JSON');
        return this.request<unknown>(
            'POST',
            this.dataPath('table/partition', tablePath, options),
            columns,
            options,
            {
                params: {
                    partition: params.partition,
                    format: spec.accept,
                    filename: params.filename,
                },
                headers: { Accept: spec.accept },
                responseType: spec.responseType,
            },
        );
    }

    /**
     * `PUT /table/partition/{path}` — write one partition.
     *
     * The payload is encoded table bytes and the `mimetype` says which encoding — parquet, CSV or
     * arrow. Required rather than defaulted: the server dispatches its reader on this header, and a
     * wrong guess either fails or silently writes nonsense.
     */
    putTablePartition(
        tablePath: string,
        data: TiledBinaryBody,
        params: { partition: number; mimetype: string },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        return this.sendBinary<unknown>(
            'PUT',
            this.dataPath('table/partition', tablePath, options),
            data,
            params.mimetype,
            options,
            { params: { partition: params.partition } },
        );
    }

    /** `PATCH /table/partition/{path}` — append to one partition. */
    patchTablePartition(
        tablePath: string,
        data: TiledBinaryBody,
        params: { partition: number; mimetype: string },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        return this.sendBinary<unknown>(
            'PATCH',
            this.dataPath('table/partition', tablePath, options),
            data,
            params.mimetype,
            options,
            { params: { partition: params.partition } },
        );
    }

    /** `PUT /table/full/{path}` — write a whole table. Same operation as {@link putNodeFull}. */
    putTableFull(
        tablePath: string,
        data: TiledBinaryBody,
        params: { mimetype: string },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        return this.sendBinary<unknown>(
            'PUT',
            this.dataPath('table/full', tablePath, options),
            data,
            params.mimetype,
            options,
        );
    }

    // #endregion

    // #region containers and nodes

    /** `GET /container/full/{path}` — a container's metadata and data together. */
    getContainerFull(path: string, options: TiledNodeRequestOptions = {}): Promise<unknown> {
        const spec = resolveFormat(options.format ?? 'JSON');
        return this.get<unknown>(this.dataPath('container/full', path, options), options, {
            params: {
                format: spec.accept,
                ...(options.field?.length ? { field: options.field } : {}),
                ...(options.filename !== undefined ? { filename: options.filename } : {}),
            },
            headers: { Accept: spec.accept },
            responseType: spec.responseType,
        });
    }

    /** `POST /container/full/{path}` — the same read, with the field list in the body. */
    postContainerFull(
        path: string,
        fields: string[] | null,
        params: { format?: string; filename?: string } = {},
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        const spec = resolveFormat(params.format ?? 'JSON');
        return this.request<unknown>(
            'POST',
            this.dataPath('container/full', path, options),
            fields,
            options,
            {
                params: { format: spec.accept, filename: params.filename },
                headers: { Accept: spec.accept },
                responseType: spec.responseType,
            },
        );
    }

    /** `GET /node/full/{path}` — whichever of container or table the node turns out to be. */
    getNodeFull(path: string, options: TiledNodeRequestOptions = {}): Promise<unknown> {
        const spec = resolveFormat(options.format ?? 'JSON');
        return this.get<unknown>(this.dataPath('node/full', path, options), options, {
            params: {
                format: spec.accept,
                ...(options.field?.length ? { field: options.field } : {}),
                ...(options.filename !== undefined ? { filename: options.filename } : {}),
            },
            headers: { Accept: spec.accept },
            responseType: spec.responseType,
        });
    }

    /** `PUT /node/full/{path}` — write a whole node. */
    putNodeFull(
        path: string,
        data: TiledBinaryBody,
        params: { mimetype: string },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        return this.sendBinary<unknown>(
            'PUT',
            this.dataPath('node/full', path, options),
            data,
            params.mimetype,
            options,
        );
    }

    // #endregion

    // #region awkward arrays

    /** `GET /awkward/full/{path}` — the whole awkward array. */
    getAwkwardFull(path: string, options: TiledAwkwardRequestOptions = {}): Promise<unknown> {
        const spec = resolveFormat(options.format ?? 'JSON');
        return this.get<unknown>(this.dataPath('awkward/full', path, options), options, {
            params: {
                format: spec.accept,
                ...(options.filename !== undefined ? { filename: options.filename } : {}),
            },
            headers: { Accept: spec.accept },
            responseType: spec.responseType,
        });
    }

    /** `GET /awkward/buffers/{path}` — selected buffers, by form key. */
    getAwkwardBuffers(path: string, options: TiledAwkwardRequestOptions = {}): Promise<unknown> {
        const spec = resolveFormat(options.format ?? 'JSON');
        return this.get<unknown>(this.dataPath('awkward/buffers', path, options), options, {
            params: {
                format: spec.accept,
                ...(options.form_key?.length ? { form_key: options.form_key } : {}),
                ...(options.filename !== undefined ? { filename: options.filename } : {}),
            },
            headers: { Accept: spec.accept },
            responseType: spec.responseType,
        });
    }

    /** `POST /awkward/buffers/{path}` — the same read with the form-key list in the body. */
    postAwkwardBuffers(
        path: string,
        formKeys: string[],
        params: { format?: string; filename?: string } = {},
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        const spec = resolveFormat(params.format ?? 'JSON');
        return this.request<unknown>(
            'POST',
            this.dataPath('awkward/buffers', path, options),
            formKeys,
            options,
            {
                params: { format: spec.accept, filename: params.filename },
                headers: { Accept: spec.accept },
                responseType: spec.responseType,
            },
        );
    }

    /** `PUT /awkward/full/{path}` — write an awkward array as its form plus buffer map. */
    putAwkwardFull(
        path: string,
        body: { form: unknown; length: number; container: Record<string, unknown> },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        return this.put<unknown>(
            this.dataPath('awkward/full', path, options),
            body as unknown as TiledBody,
            options,
        );
    }

    // #endregion

    // #region registration, data sources, revisions, streams

    /**
     * `POST /register/{path}` — register data that already exists on disk.
     *
     * Takes the same body as {@link createNode}, and addresses the **parent** container the same
     * way, but the data sources point at files the server can already see rather than at bytes about
     * to be uploaded.
     */
    postRegister(
        parentPath: string,
        body: PostMetadataRequest,
        options: TiledRequestOptions = {},
    ): Promise<PostMetadataResponse> {
        return this.post<PostMetadataResponse>(
            this.dataPath('register', parentPath, options),
            body,
            options,
        );
    }

    /**
     * `PUT /data_source/{path}` — replace a node's data source.
     *
     * `patch_shape` / `patch_offset` scope the change to a region when the source is being grown.
     */
    putDataSource(
        path: string,
        body: PutDataSourceRequest,
        params: { patch_shape?: string; patch_offset?: string } = {},
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        return this.put<unknown>(
            this.dataPath('data_source', path, options),
            body as unknown as TiledBody,
            options,
            { params },
        );
    }

    /** `GET /revisions/{path}` — the metadata revision history, paginated. */
    getRevisions(
        path: string,
        params: { pageOffset?: number; pageCursor?: number; pageLimit?: number } = {},
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        return this.get<unknown>(this.dataPath('revisions', path, options), options, {
            params: {
                'page[offset]': params.pageOffset,
                'page[cursor]': params.pageCursor,
                'page[limit]': params.pageLimit,
            },
        });
    }

    /** `DELETE /revisions/{path}` — drop one revision by number. Destructive. */
    deleteRevision(
        path: string,
        params: { number: number },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        return this.del<unknown>(this.dataPath('revisions', path, options), options, {
            params: { number: params.number },
        });
    }

    /**
     * `DELETE /stream/close/{path}` — mark an append-only node complete.
     *
     * The one write that is really a streaming operation: it is what emits the `stream-closed`
     * event webhooks subscribe to. Useful on its own today, and the seam the websocket work will
     * build against.
     */
    closeStream(path: string, options: TiledRequestOptions = {}): Promise<unknown> {
        return this.del<unknown>(this.dataPath('stream/close', path, options), options);
    }

    // #endregion

    // #region assets

    /** `GET /asset/bytes/{path}` — the raw bytes of one asset backing a node. */
    getAssetBytes(
        path: string,
        params: { id: number; relative_path?: string },
        options: TiledRequestOptions = {},
    ): Promise<ArrayBuffer> {
        return this.get<ArrayBuffer>(this.dataPath('asset/bytes', path, options), options, {
            params: { id: params.id, relative_path: params.relative_path },
            responseType: 'arraybuffer',
        });
    }

    /** `GET /asset/manifest/{path}` — the file list of a directory-shaped asset. */
    getAssetManifest(
        path: string,
        params: { id: number },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        return this.get<unknown>(this.dataPath('asset/manifest', path, options), options, {
            params: { id: params.id },
        });
    }

    // #endregion

    // #region webhooks

    /** `GET /webhooks/target/{path}` — the webhooks registered on a node. */
    listWebhooks(path: string, options: TiledRequestOptions = {}): Promise<WebhookResponse[]> {
        return this.get<WebhookResponse[]>(
            this.dataPath('webhooks/target', path, options),
            options,
        );
    }

    /** `POST /webhooks/target/{path}` — register a webhook for a node's events. */
    registerWebhook(
        path: string,
        body: WebhookRegistrationRequest,
        options: TiledRequestOptions = {},
    ): Promise<WebhookResponse> {
        return this.post<WebhookResponse>(
            this.dataPath('webhooks/target', path, options),
            body as unknown as TiledBody,
            options,
        );
    }

    /** `DELETE /webhooks/{webhook_id}` — deactivate and remove a webhook. */
    deleteWebhook(webhookId: number, options: TiledRequestOptions = {}): Promise<unknown> {
        return this.del<unknown>(
            buildPath('/webhooks/{webhook_id}', { webhook_id: webhookId }),
            options,
        );
    }

    /** `GET /webhooks/history/{webhook_id}` — recent delivery attempts and their outcomes. */
    getWebhookHistory(
        webhookId: number,
        params: { limit?: number } = {},
        options: TiledRequestOptions = {},
    ): Promise<DeliveryResponse[]> {
        return this.get<DeliveryResponse[]>(
            buildPath('/webhooks/history/{webhook_id}', { webhook_id: webhookId }),
            options,
            { params: { limit: params.limit } },
        );
    }

    // #endregion

    // #region auth
    //
    // None of these routes are in `openapi.json` — the spec is generated without the auth router.
    // What the spec *does* carry is `AboutAuthenticationLinks`, so every URL below is resolved from
    // `GET /api/v1/`'s `authentication.links` rather than hard-coded. A server with authentication
    // disabled reports `links: null`, and these methods say so plainly instead of requesting a URL
    // built from `null`.

    /** The auth URLs this server advertises, or `null` when authentication is disabled. */
    private async resolveAuthLinks(
        options: TiledRequestOptions,
    ): Promise<Record<string, string> | null> {
        const info = await this.getServerInfo(options);
        const links = info?.authentication?.links;
        return links ? (links as unknown as Record<string, string>) : null;
    }

    private async requireAuthLink(
        name: 'whoami' | 'apikey' | 'refresh_session' | 'revoke_session' | 'logout',
        options: TiledRequestOptions,
    ): Promise<string> {
        const links = await this.resolveAuthLinks(options);
        const url = links?.[name];
        if (!url) {
            throw new TiledApiError({
                message:
                    `This Tiled server does not advertise an auth endpoint for '${name}'. ` +
                    'Its `authentication.links` is null, which means authentication is disabled — ' +
                    'use an API key instead.',
                method: 'GET',
                path: `auth:${name}`,
            });
        }
        return url;
    }

    /**
     * Log in with a username and password.
     *
     * Resolves the auth endpoint from the given provider, or from the first password/internal
     * provider the server advertises. On success the tokens are persisted and set as this client's
     * bearer token.
     *
     * **Resolves `null` on a failed login rather than rejecting.** That is upstream's behaviour and
     * callers depend on it — a wrong password is an expected outcome of a login form, not an
     * exception. Check the resolved value, not `isError`.
     */
    async loginWithUsernamePassword(
        username: string,
        password: string,
        url?: string,
        provider?: TiledAuthProvider,
    ): Promise<TiledLoginTokens | null> {
        try {
            let authEndpoint: string;

            if (provider && (provider.mode === 'password' || provider.mode === 'internal')) {
                if (!provider.links?.auth_endpoint) {
                    console.error('Provided authentication provider is missing auth_endpoint');
                    return null;
                }
                authEndpoint = provider.links.auth_endpoint;
            } else {
                const info = await this.getServerInfo(url ? { baseUrl: url } : {});
                const providers = info?.authentication?.providers;
                if (!providers?.length) {
                    console.error('No authentication providers found in server info');
                    return null;
                }
                const match = providers.find(
                    (candidate) => candidate.mode === 'password' || candidate.mode === 'internal',
                );
                if (!match?.links?.auth_endpoint) {
                    console.error('No password authentication provider found');
                    return null;
                }
                authEndpoint = match.links.auth_endpoint;
            }

            const form = new FormData();
            form.append('username', username);
            form.append('password', password);

            const response = await this.client.post<Partial<TiledLoginTokens>>(authEndpoint, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const { access_token, refresh_token } = response.data;
            if (!access_token || !refresh_token) {
                console.error('Login response missing required tokens');
                return null;
            }

            this.tokenStorage.write({ accessToken: access_token, refreshToken: refresh_token });
            this.setBearerToken(access_token);
            return { access_token, refresh_token };
        } catch (error) {
            console.error('Login failed:', error);
            return null;
        }
    }

    /** Who the current credentials identify. */
    async whoami(options: TiledRequestOptions = {}): Promise<unknown> {
        const url = await this.requireAuthLink('whoami', options);
        return this.get<unknown>(url, { ...options, baseUrl: '' });
    }

    /** Mint a new API key for the current principal. */
    async createApiKey(
        body: { expires_in?: number | null; scopes?: string[] | null; note?: string | null },
        options: TiledRequestOptions = {},
    ): Promise<unknown> {
        const url = await this.requireAuthLink('apikey', options);
        return this.post<unknown>(url, body, { ...options, baseUrl: '' });
    }

    /** Revoke an API key by its first eight characters. */
    async revokeApiKey(firstEight: string, options: TiledRequestOptions = {}): Promise<unknown> {
        const url = await this.requireAuthLink('apikey', options);
        return this.del<unknown>(url, {
            ...options,
            baseUrl: '',
            query: { first_eight: firstEight },
        });
    }

    /** Exchange the stored refresh token for a new access token, out of band of the 401 handler. */
    async refreshSession(options: TiledRequestOptions = {}): Promise<unknown> {
        const url = await this.requireAuthLink('refresh_session', options);
        const stored = this.tokenStorage.read();
        if (!stored)
            throw new TiledApiError({
                message: 'No stored refresh token',
                method: 'POST',
                path: url,
            });

        const tokens = await this.post<{ access_token?: string; refresh_token?: string }>(
            url,
            { refresh_token: stored.refreshToken },
            { ...options, baseUrl: '' },
        );
        if (tokens.access_token) {
            this.tokenStorage.write({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token ?? stored.refreshToken,
            });
            this.setBearerToken(tokens.access_token);
        }
        return tokens;
    }

    /** Revoke one session by id. */
    async revokeSession(sessionId: string, options: TiledRequestOptions = {}): Promise<unknown> {
        const url = await this.requireAuthLink('revoke_session', options);
        return this.del<unknown>(`${url}/${encodeURIComponent(sessionId)}`, {
            ...options,
            baseUrl: '',
        });
    }

    /** Log out, then drop every local credential. */
    async logout(options: TiledRequestOptions = {}): Promise<unknown> {
        const url = await this.requireAuthLink('logout', options);
        try {
            return await this.post<unknown>(url, {}, { ...options, baseUrl: '' });
        } finally {
            // Local state is cleared whether or not the server acknowledged — a user who pressed
            // log out should be logged out of this tab regardless.
            this.clearAuth();
        }
    }

    // #endregion

    // #region zarr
    //
    // URL builders only, deliberately. These routes exist to be consumed by zarr.js or xarray,
    // which want a base URL and do their own chunk fetching; a typed fetcher here would invite a
    // consumer that should have used a zarr library. The registry lists them so the surface is
    // discoverable and the coverage test stays satisfied.

    /** The base URL to hand a zarr v2 reader for a node. */
    getZarrV2Url(path: string, options: TiledRequestOptions = {}): string {
        const origin = tiledOriginFromBaseUrl(this.resolveBaseUrl(options));
        return `${origin}/zarr/v2/${this.encodePath(path, options)}`;
    }

    /** The base URL to hand a zarr v3 reader for a node. */
    getZarrV3Url(path: string, options: TiledRequestOptions = {}): string {
        const origin = tiledOriginFromBaseUrl(this.resolveBaseUrl(options));
        return `${origin}/zarr/v3/${this.encodePath(path, options)}`;
    }

    // #endregion
}
