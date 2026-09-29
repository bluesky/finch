import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios';
import type {
    ApiKeyLocation,
    ApiKeyScheme,
    QServerSuccessResponse,
    GetBodyStrategy,
    GetWithBodyOptions,
    InterceptorHandle,
    QServerAuthErrorCallback,
    QServerErrorInterceptor,
    QServerBody,
    QServerPayload,
    QServerRequestInterceptor,
    QServerRequestOptions,
    QServerResponseInterceptor,
} from '../types/common';
import { QServerApiError, QServerGetBodyUnsupportedError } from '../types/errors';
import type { QServerHttpMethod } from '../types/errors';
import type { AccessAndRefreshTokens, APIKeyRequestParams } from '../types/generatedAliases';
import { buildPath, QSERVER_PATHS } from '../types/paths';
import type {
    AdminResponse,
    KernelInterruptBody,
    ManagerStopBody,
    TestServerSleepBody,
} from '../types/admin';
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
import type { QServerEndpoints } from '../types/clientSurface';
import type {
    ConsoleOutputBody,
    ConsoleOutputUpdateBody,
    GetConsoleOutputResponse,
    GetConsoleOutputUidResponse,
    GetConsoleOutputUpdateResponse,
} from '../types/console';
import type {
    EnvironmentResponse,
    EnvironmentUpdateBody,
    EnvironmentUpdateResponse,
} from '../types/environment';
import type {
    ExecuteFunctionBody,
    ExecuteFunctionResponse,
    UploadScriptBody,
    UploadScriptResponse,
} from '../types/functionsScripts';
import type { ClearHistoryResponse, GetHistoryResponse } from '../types/history';
import type { GetLockInfoResponse, LockBody, LockResponse, UnlockBody } from '../types/lock';
import type {
    GetPermissionsResponse,
    PermissionsResponse,
    ReloadPermissionsBody,
    SetPermissionsBody,
} from '../types/permissions';
import type {
    GetDevicesAllowedResponse,
    GetDevicesExistingResponse,
    GetPlansAllowedResponse,
    GetPlansExistingResponse,
    PlansDevicesBody,
} from '../types/plansDevices';
import type {
    AddQueueItemBatchBody,
    AddQueueItemBody,
    ExecuteQueueItemBody,
    GetQueueItemBody,
    GetQueueItemResponse,
    GetQueueResponse,
    MoveQueueItemBatchBody,
    MoveQueueItemBody,
    PostItemAddResponse,
    PostItemBatchResponse,
    PostItemExecuteResponse,
    PostItemRemoveResponse,
    PostItemUpdateResponse,
    QueueAutostartBody,
    QueueClearResponse,
    QueueModeSetBody,
    QueueStartResponse,
    RemoveQueueItemBatchBody,
    RemoveQueueItemBody,
    UpdateQueueItemBody,
    UploadSpreadsheetInput,
    UploadSpreadsheetResponse,
} from '../types/queue';
import type {
    GetReMetadataResponse,
    GetRunsBody,
    GetRunsResponse,
    ReControlResponse,
    RePauseBody,
    ReResumeBody,
} from '../types/runEngine';
import type { GetConfigResponse, GetStatusResponse, PingResponse } from '../types/status';
import type { GetTaskResultResponse, GetTaskStatusResponse, TaskBody } from '../types/tasks';
import {
    getConsoleOutputUpdateViaPoll,
    getLockInfoViaStatus,
    getQueueItemViaQueueScan,
} from './fallbacks';
import {
    canSendGetBody,
    hasPayload,
    isBodyRequired,
    NO_BROWSER_PATH_ENDPOINT_IDS,
    warnGetBodyOnce,
} from './getBodySupport';
import { InterceptorRegistry } from './interceptorRegistry';
import { defaultQServerBaseUrl, normalizeQServerBaseUrl } from './urlUtils';

/** Reported when a payload-GET was served by a browser fallback instead of the real call. */
export interface QServerFallbackInfo {
    endpointId: string;
    path: string;
    reason: 'browser-cannot-send-get-body';
}

export interface QServerClientConfig {
    /** Adopt a pre-built axios instance. Built-in interceptors are installed onto it. */
    client?: AxiosInstance;
    /** Server **origin**, e.g. `http://localhost:60610`. A trailing `/api` is stripped. */
    baseUrl?: string;
    apiKey?: string | null;
    /** Sent as `Authorization: Bearer …`; takes precedence over `apiKey`. */
    bearerToken?: string | null;
    /** Enables the built-in 401 refresh. */
    refreshToken?: string | null;
    /** `'header'` (default) or `'query'` (`?api_key=`). */
    apiKeyLocation?: ApiKeyLocation;
    /** `Authorization` scheme casing. Default `'Apikey'`, as documented by the spec. */
    apiKeyScheme?: ApiKeyScheme;
    /** Default abort signal for every request. */
    signal?: AbortSignal;
    /** Request timeout in ms. Default 30000. */
    timeout?: number;
    /** Attempt a token refresh on 401. Default true; needs a `refreshToken`. */
    refreshOn401?: boolean;
    onAuthError?: QServerAuthErrorCallback;
    /** How to treat payload-bearing GETs in a browser. Default `'auto'`. */
    getBodyStrategy?: GetBodyStrategy;
    /** Suppress the one-time console warning for browser payload-GETs. */
    silenceGetBodyWarnings?: boolean;
    /** Notified whenever a browser fallback stood in for a payload-GET. */
    onFallback?: (info: QServerFallbackInfo) => void;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
    __qsRetried?: boolean;
}

/** Marks a request that opted out of auth via `options.apiKey === null`. */
interface AuthAwareConfig extends InternalAxiosRequestConfig {
    __qsNoAuth?: boolean;
}

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Transport for the Bluesky queue server (bluesky-httpserver).
 *
 * Modelled on the Tiled API client: one axios instance, auth injected by an interceptor
 * that reads current state at request time (so `setApiKey` takes effect immediately with
 * no rebuild), a single-flight 401 refresh, per-request client overrides, and one thin
 * method per endpoint layered on a small set of request funnels.
 *
 * ```ts
 * const client = new QServerApiClient({ baseUrl: 'http://localhost:60610', apiKey: 'test' });
 * const status = await client.getStatus();
 * client.setApiKey('another-key'); // affects the next request
 * ```
 *
 * The endpoint methods are grouped into `#region` blocks further down, one region per
 * domain, and their signatures are declared by the interfaces in `../endpoints/`.
 */
export class QServerApiClient implements QServerEndpoints {
    private client: AxiosInstance;
    private baseUrl: string;
    private apiKey: string | null;
    private bearerToken: string | null;
    private refreshToken: string | null;
    private apiKeyLocation: ApiKeyLocation;
    private apiKeyScheme: ApiKeyScheme;
    private signal: AbortSignal | undefined;
    private timeout: number;
    private refreshOn401: boolean;
    private authErrorCallback: QServerAuthErrorCallback | undefined;
    private getBodyStrategy: GetBodyStrategy;
    private silenceGetBodyWarnings: boolean;
    private fallbackCallback: ((info: QServerFallbackInfo) => void) | undefined;

    private interceptors = new InterceptorRegistry();
    private refreshPromise: Promise<string> | null = null;

    constructor(config: QServerClientConfig = {}) {
        this.baseUrl = normalizeQServerBaseUrl(config.baseUrl ?? defaultQServerBaseUrl());
        this.apiKey = config.apiKey ?? null;
        this.bearerToken = config.bearerToken ?? null;
        this.refreshToken = config.refreshToken ?? null;
        this.apiKeyLocation = config.apiKeyLocation ?? 'header';
        this.apiKeyScheme = config.apiKeyScheme ?? 'Apikey';
        this.signal = config.signal;
        this.timeout = config.timeout ?? DEFAULT_TIMEOUT_MS;
        this.refreshOn401 = config.refreshOn401 ?? true;
        this.authErrorCallback = config.onAuthError;
        this.getBodyStrategy = config.getBodyStrategy ?? 'auto';
        this.silenceGetBodyWarnings = config.silenceGetBodyWarnings ?? false;
        this.fallbackCallback = config.onFallback;

        this.client =
            config.client ??
            axios.create({
                baseURL: this.baseUrl,
                timeout: this.timeout,
                withCredentials: false,
            });

        this.installBuiltinInterceptors();
    }

    // #region configuration

    getBaseUrl(): string {
        return this.baseUrl;
    }

    /** Set the server origin. A trailing `/api` is stripped, since spec paths include it. */
    setBaseUrl(baseUrl: string): void {
        this.baseUrl = normalizeQServerBaseUrl(baseUrl);
        this.client.defaults.baseURL = this.baseUrl;
    }

    getApiKey(): string | null {
        return this.apiKey;
    }

    /** Swap the API key. Read at request time, so in-flight clients need no rebuild. */
    setApiKey(apiKey: string | null): void {
        this.apiKey = apiKey;
    }

    getApiKeyLocation(): ApiKeyLocation {
        return this.apiKeyLocation;
    }

    setApiKeyLocation(location: ApiKeyLocation): void {
        this.apiKeyLocation = location;
    }

    getApiKeyScheme(): ApiKeyScheme {
        return this.apiKeyScheme;
    }

    setApiKeyScheme(scheme: ApiKeyScheme): void {
        this.apiKeyScheme = scheme;
    }

    getBearerToken(): string | null {
        return this.bearerToken;
    }

    setBearerToken(token: string | null): void {
        this.bearerToken = token;
    }

    getRefreshToken(): string | null {
        return this.refreshToken;
    }

    setRefreshToken(token: string | null): void {
        this.refreshToken = token;
    }

    /** Drop the API key and both tokens. */
    clearAuth(): void {
        this.apiKey = null;
        this.bearerToken = null;
        this.refreshToken = null;
    }

    /** The underlying axios instance, for low-level configuration. */
    getAxiosClient(): AxiosInstance {
        return this.client;
    }

    /**
     * Replace the axios instance. Built-in and caller-registered interceptors are
     * re-installed onto the replacement, built-ins first.
     */
    setAxiosClient(client: AxiosInstance): void {
        this.client = client;
        this.client.defaults.baseURL = this.baseUrl;
        this.interceptors.reinstallOn(this.client);
    }

    getSignal(): AbortSignal | undefined {
        return this.signal;
    }

    setSignal(signal: AbortSignal | undefined): void {
        this.signal = signal;
    }

    setAuthErrorCallback(callback: QServerAuthErrorCallback | undefined): void {
        this.authErrorCallback = callback;
    }

    getGetBodyStrategy(): GetBodyStrategy {
        return this.getBodyStrategy;
    }

    setGetBodyStrategy(strategy: GetBodyStrategy): void {
        this.getBodyStrategy = strategy;
    }

    setFallbackCallback(callback: ((info: QServerFallbackInfo) => void) | undefined): void {
        this.fallbackCallback = callback;
    }

    setTimeout(timeout: number): void {
        this.timeout = timeout;
        this.client.defaults.timeout = timeout;
    }

    /** Snapshot of the current configuration, for display in debug UIs. */
    getConfigSnapshot(): {
        baseUrl: string;
        apiKey: string | null;
        bearerToken: string | null;
        hasRefreshToken: boolean;
        apiKeyLocation: ApiKeyLocation;
        apiKeyScheme: ApiKeyScheme;
        timeout: number;
        refreshOn401: boolean;
        getBodyStrategy: GetBodyStrategy;
    } {
        return {
            baseUrl: this.baseUrl,
            apiKey: this.apiKey,
            bearerToken: this.bearerToken,
            hasRefreshToken: !!this.refreshToken,
            apiKeyLocation: this.apiKeyLocation,
            apiKeyScheme: this.apiKeyScheme,
            timeout: this.timeout,
            refreshOn401: this.refreshOn401,
            getBodyStrategy: this.getBodyStrategy,
        };
    }

    // #endregion

    // #region interceptors

    /**
     * Register a request interceptor.
     *
     * Axios runs request interceptors last-registered-first, and the built-in auth
     * interceptor is registered in the constructor — so a caller's interceptor observes the
     * config *before* the `Authorization` header is attached.
     */
    addRequestInterceptor(
        onFulfilled: QServerRequestInterceptor,
        onRejected?: QServerErrorInterceptor,
    ): InterceptorHandle {
        return this.interceptors.registerUser(this.client, (client) => ({
            kind: 'request',
            id: client.interceptors.request.use(onFulfilled, onRejected),
        }));
    }

    addResponseInterceptor(
        onFulfilled: QServerResponseInterceptor,
        onRejected?: QServerErrorInterceptor,
    ): InterceptorHandle {
        return this.interceptors.registerUser(this.client, (client) => ({
            kind: 'response',
            id: client.interceptors.response.use(onFulfilled, onRejected),
        }));
    }

    /** Remove one interceptor. Built-in handles are ignored. */
    ejectInterceptor(handle: InterceptorHandle): boolean {
        return this.interceptors.ejectUser(this.client, handle);
    }

    /** Remove every caller-registered interceptor. Built-in auth and refresh survive. */
    clearInterceptors(kind?: 'request' | 'response'): void {
        this.interceptors.clearUsers(this.client, kind);
    }

    listInterceptors(): readonly InterceptorHandle[] {
        return this.interceptors.listUsers();
    }

    /** Raw axios interceptor managers, for anything the wrappers above do not cover. */
    getInterceptorManagers(): {
        request: AxiosInstance['interceptors']['request'];
        response: AxiosInstance['interceptors']['response'];
    } {
        return {
            request: this.client.interceptors.request,
            response: this.client.interceptors.response,
        };
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
     * Attach credentials, unless the call already carries its own (a per-request override
     * set by `buildConfig`, or a header supplied by the caller).
     */
    private applyAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
        // `options.apiKey: null` opted this call out of auth entirely.
        if ((config as AuthAwareConfig).__qsNoAuth) return config;

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
            this.refreshOn401 &&
            !!this.refreshToken &&
            !!originalRequest &&
            !originalRequest.__qsRetried;

        if (!canRetry) throw error;

        originalRequest.__qsRetried = true;
        if (!this.refreshPromise) {
            this.refreshPromise = this.doTokenRefresh().finally(() => {
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

    /** Exchange the refresh token for a new access token. Bypasses interceptors. */
    private async doTokenRefresh(): Promise<string> {
        try {
            const response = await axios.post<AccessAndRefreshTokens>(
                `${this.baseUrl}${QSERVER_PATHS.authSessionRefresh}`,
                { refresh_token: this.refreshToken },
                { timeout: this.timeout },
            );
            const tokens = response.data;
            if (!tokens?.access_token)
                throw new Error('Refresh response contained no access token');
            this.setBearerToken(tokens.access_token);
            if (tokens.refresh_token) this.setRefreshToken(tokens.refresh_token);
            return tokens.access_token;
        } catch (refreshError) {
            this.clearAuth();
            this.authErrorCallback?.(refreshError);
            throw refreshError;
        }
    }

    // #endregion

    // #region request funnels

    protected resolveClient(options?: QServerRequestOptions): AxiosInstance {
        return options?.client ?? this.client;
    }

    private buildConfig(
        path: string,
        options: QServerRequestOptions | undefined,
    ): AxiosRequestConfig {
        const headers: Record<string, string> = { ...options?.headers };
        const params: Record<string, string | number | boolean> = {};

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
            baseURL: this.resolveBaseUrl(options),
            url: path,
            signal: options?.signal ?? this.signal,
            headers,
            params,
            // An explicit `null` means "no credentials for this call" — distinct from `undefined`,
            // which inherits the client's. Flagged here so the auth interceptor can tell them apart.
            ...(options?.apiKey === null ? { __qsNoAuth: true } : {}),
        } as AxiosRequestConfig;
    }

    /**
     * The origin this call should go to.
     *
     * A per-request `baseUrl` wins over the client's, and is normalized the same way `setBaseUrl`
     * normalizes: spec paths already carry `/api/`, so a caller who passes `.../api` gets the same
     * forgiveness they would from the setter.
     */
    protected resolveBaseUrl(options?: QServerRequestOptions): string {
        return options?.baseUrl !== undefined
            ? normalizeQServerBaseUrl(options.baseUrl)
            : this.baseUrl;
    }

    /** Issue a request and unwrap `response.data`, normalizing failures. */
    protected async request<T>(
        method: QServerHttpMethod,
        path: string,
        data?: unknown,
        options?: QServerRequestOptions,
    ): Promise<T> {
        const client = this.resolveClient(options);
        const config: AxiosRequestConfig = {
            ...this.buildConfig(path, options),
            method,
            ...(data !== undefined ? { data } : {}),
        };

        try {
            const response = await client.request<T>(config);
            return response.data;
        } catch (error) {
            throw toQServerApiError(error, method, path);
        }
    }

    /** Untyped escape hatch for endpoints whose shape a caller wants to declare itself. */
    requestRaw<T = unknown>(
        method: QServerHttpMethod,
        path: string,
        data?: unknown,
        options?: QServerRequestOptions,
    ): Promise<T> {
        return this.request<T>(method, path, data, options);
    }

    protected get<T>(path: string, options?: QServerRequestOptions): Promise<T> {
        return this.request<T>('GET', path, undefined, options);
    }

    protected post<T>(
        path: string,
        body?: QServerBody,
        options?: QServerRequestOptions,
    ): Promise<T> {
        return this.request<T>('POST', path, body ?? {}, options);
    }

    protected del<T>(path: string, options?: QServerRequestOptions): Promise<T> {
        return this.request<T>('DELETE', path, undefined, options);
    }

    protected postMultipart<T>(
        path: string,
        form: FormData,
        options?: QServerRequestOptions,
    ): Promise<T> {
        return this.request<T>('POST', path, form, options);
    }

    /**
     * Issue a `GET` whose arguments travel in a JSON body.
     *
     * An empty payload is sent as a plain bodiless GET, which works everywhere because the
     * server defaults `payload` to `{}`. A non-empty payload is only deliverable outside a
     * browser; what happens otherwise is governed by the {@link GetBodyStrategy}.
     */
    protected async getWithBody<T>(
        endpointId: string,
        path: string,
        payload?: QServerBody,
        options?: GetWithBodyOptions<T>,
    ): Promise<T> {
        // A handful of endpoints reject a bodiless GET with 422 even when they need no
        // arguments, so an empty payload still has to travel as `{}` for those.
        const bodyRequired = isBodyRequired(endpointId);
        if (!hasPayload(payload) && !bodyRequired) {
            return this.request<T>('GET', path, undefined, options);
        }
        if (canSendGetBody()) return this.request<T>('GET', path, payload ?? {}, options);

        const strategy = options?.strategy ?? this.getBodyStrategy;
        const fallback = options?.fallback;

        if (strategy === 'throw') {
            throw new QServerGetBodyUnsupportedError(
                endpointId,
                path,
                describeAlternative(endpointId),
            );
        }

        if (strategy === 'fallback') {
            if (!fallback) {
                throw new QServerGetBodyUnsupportedError(
                    endpointId,
                    path,
                    'No fallback is available for this endpoint.',
                );
            }
            return this.runFallback(endpointId, path, fallback);
        }

        if (strategy === 'auto' && fallback) {
            return this.runFallback(endpointId, path, fallback);
        }

        if (!this.silenceGetBodyWarnings) {
            warnGetBodyOnce(
                endpointId,
                `GET ${path} needs a request body, which this environment cannot send. ` +
                    `The server will see an empty payload. ${describeAlternative(endpointId)}`,
            );
        }
        return this.request<T>('GET', path, payload, options);
    }

    private async runFallback<T>(
        endpointId: string,
        path: string,
        fallback: () => Promise<T>,
    ): Promise<T> {
        this.fallbackCallback?.({ endpointId, path, reason: 'browser-cannot-send-get-body' });
        if (!this.silenceGetBodyWarnings) {
            warnGetBodyOnce(
                endpointId,
                `GET ${path} needs a request body, which this environment cannot send; ` +
                    'using the browser fallback instead.',
            );
        }
        return fallback();
    }

    // #endregion

    // #region endpoints: status

    ping(payload?: QServerPayload, options?: GetWithBodyOptions<PingResponse>) {
        return this.getWithBody<PingResponse>('status.ping', QSERVER_PATHS.ping, payload, options);
    }

    getRoot(payload?: QServerPayload, options?: GetWithBodyOptions<PingResponse>) {
        return this.getWithBody<PingResponse>('status.root', QSERVER_PATHS.root, payload, options);
    }

    getStatus(payload?: QServerPayload, options?: GetWithBodyOptions<GetStatusResponse>) {
        return this.getWithBody<GetStatusResponse>(
            'status.status',
            QSERVER_PATHS.status,
            payload,
            options,
        );
    }

    getConfig(payload?: QServerPayload, options?: GetWithBodyOptions<GetConfigResponse>) {
        return this.getWithBody<GetConfigResponse>(
            'status.config',
            QSERVER_PATHS.configGet,
            payload,
            options,
        );
    }

    // #endregion

    // #region endpoints: queue

    getQueue(payload?: QServerPayload, options?: GetWithBodyOptions<GetQueueResponse>) {
        return this.getWithBody<GetQueueResponse>(
            'queue.get',
            QSERVER_PATHS.queueGet,
            payload,
            options,
        );
    }

    getQueueItem(body?: GetQueueItemBody, options?: GetWithBodyOptions<GetQueueItemResponse>) {
        return this.getWithBody<GetQueueItemResponse>(
            'queue.itemGet',
            QSERVER_PATHS.queueItemGet,
            body,
            { fallback: () => getQueueItemViaQueueScan(this, body), ...options },
        );
    }

    addQueueItem(body: AddQueueItemBody, options?: QServerRequestOptions) {
        return this.post<PostItemAddResponse>(QSERVER_PATHS.queueItemAdd, body, options);
    }

    addQueueItemBatch(body: AddQueueItemBatchBody, options?: QServerRequestOptions) {
        return this.post<PostItemBatchResponse>(QSERVER_PATHS.queueItemAddBatch, body, options);
    }

    executeQueueItem(body: ExecuteQueueItemBody, options?: QServerRequestOptions) {
        return this.post<PostItemExecuteResponse>(QSERVER_PATHS.queueItemExecute, body, options);
    }

    updateQueueItem(body: UpdateQueueItemBody, options?: QServerRequestOptions) {
        return this.post<PostItemUpdateResponse>(QSERVER_PATHS.queueItemUpdate, body, options);
    }

    removeQueueItem(body?: RemoveQueueItemBody, options?: QServerRequestOptions) {
        return this.post<PostItemRemoveResponse>(QSERVER_PATHS.queueItemRemove, body, options);
    }

    removeQueueItemBatch(body: RemoveQueueItemBatchBody, options?: QServerRequestOptions) {
        return this.post<PostItemBatchResponse>(QSERVER_PATHS.queueItemRemoveBatch, body, options);
    }

    moveQueueItem(body: MoveQueueItemBody, options?: QServerRequestOptions) {
        return this.post<PostItemAddResponse>(QSERVER_PATHS.queueItemMove, body, options);
    }

    moveQueueItemBatch(body: MoveQueueItemBatchBody, options?: QServerRequestOptions) {
        return this.post<PostItemBatchResponse>(QSERVER_PATHS.queueItemMoveBatch, body, options);
    }

    uploadQueueSpreadsheet(input: UploadSpreadsheetInput, options?: QServerRequestOptions) {
        const form = new FormData();
        form.append('spreadsheet', input.spreadsheet, input.fileName ?? 'spreadsheet.xlsx');
        if (input.dataType) form.append('data_type', input.dataType);
        return this.postMultipart<UploadSpreadsheetResponse>(
            QSERVER_PATHS.queueUploadSpreadsheet,
            form,
            options,
        );
    }

    startQueue(options?: QServerRequestOptions) {
        return this.post<QueueStartResponse>(QSERVER_PATHS.queueStart, {}, options);
    }

    stopQueue(options?: QServerRequestOptions) {
        return this.post<QServerSuccessResponse>(QSERVER_PATHS.queueStop, {}, options);
    }

    cancelQueueStop(options?: QServerRequestOptions) {
        return this.post<QServerSuccessResponse>(QSERVER_PATHS.queueStopCancel, {}, options);
    }

    clearQueue(options?: QServerRequestOptions) {
        return this.post<QueueClearResponse>(QSERVER_PATHS.queueClear, {}, options);
    }

    setQueueMode(body: QueueModeSetBody, options?: QServerRequestOptions) {
        return this.post<QServerSuccessResponse>(QSERVER_PATHS.queueModeSet, body, options);
    }

    setQueueAutostart(body: QueueAutostartBody, options?: QServerRequestOptions) {
        return this.post<QServerSuccessResponse>(QSERVER_PATHS.queueAutostart, body, options);
    }

    // #endregion

    // #region endpoints: history

    getQueueHistory(payload?: QServerPayload, options?: GetWithBodyOptions<GetHistoryResponse>) {
        return this.getWithBody<GetHistoryResponse>(
            'history.get',
            QSERVER_PATHS.historyGet,
            payload,
            options,
        );
    }

    clearHistory(options?: QServerRequestOptions) {
        return this.post<ClearHistoryResponse>(QSERVER_PATHS.historyClear, {}, options);
    }

    // #endregion

    // #region endpoints: environment

    openEnvironment(options?: QServerRequestOptions) {
        return this.post<EnvironmentResponse>(QSERVER_PATHS.environmentOpen, {}, options);
    }

    closeEnvironment(options?: QServerRequestOptions) {
        return this.post<EnvironmentResponse>(QSERVER_PATHS.environmentClose, {}, options);
    }

    destroyEnvironment(options?: QServerRequestOptions) {
        return this.post<EnvironmentResponse>(QSERVER_PATHS.environmentDestroy, {}, options);
    }

    updateEnvironment(body?: EnvironmentUpdateBody, options?: QServerRequestOptions) {
        return this.post<EnvironmentUpdateResponse>(QSERVER_PATHS.environmentUpdate, body, options);
    }

    // #endregion

    // #region endpoints: run engine

    pauseRE(body?: RePauseBody, options?: QServerRequestOptions) {
        return this.post<ReControlResponse>(QSERVER_PATHS.rePause, body, options);
    }

    resumeRE(body?: ReResumeBody, options?: QServerRequestOptions) {
        return this.post<ReControlResponse>(QSERVER_PATHS.reResume, body, options);
    }

    stopRE(body?: ReResumeBody, options?: QServerRequestOptions) {
        return this.post<ReControlResponse>(QSERVER_PATHS.reStop, body, options);
    }

    abortRE(body?: ReResumeBody, options?: QServerRequestOptions) {
        return this.post<ReControlResponse>(QSERVER_PATHS.reAbort, body, options);
    }

    haltRE(body?: ReResumeBody, options?: QServerRequestOptions) {
        return this.post<ReControlResponse>(QSERVER_PATHS.reHalt, body, options);
    }

    getRuns(body?: GetRunsBody, options?: QServerRequestOptions) {
        return this.post<GetRunsResponse>(QSERVER_PATHS.reRuns, body, options);
    }

    getRunsActive(options?: QServerRequestOptions) {
        return this.get<GetRunsResponse>(QSERVER_PATHS.reRunsActive, options);
    }

    getRunsOpen(options?: QServerRequestOptions) {
        return this.get<GetRunsResponse>(QSERVER_PATHS.reRunsOpen, options);
    }

    getRunsClosed(options?: QServerRequestOptions) {
        return this.get<GetRunsResponse>(QSERVER_PATHS.reRunsClosed, options);
    }

    getREMetadata(payload?: QServerPayload, options?: GetWithBodyOptions<GetReMetadataResponse>) {
        return this.getWithBody<GetReMetadataResponse>(
            're.metadata',
            QSERVER_PATHS.reMetadata,
            payload,
            options,
        );
    }

    // #endregion

    // #region endpoints: plans and devices

    getPlansAllowed(
        payload?: PlansDevicesBody,
        options?: GetWithBodyOptions<GetPlansAllowedResponse>,
    ) {
        return this.getWithBody<GetPlansAllowedResponse>(
            'plansDevices.plansAllowed',
            QSERVER_PATHS.plansAllowed,
            payload,
            options,
        );
    }

    getDevicesAllowed(
        payload?: PlansDevicesBody,
        options?: GetWithBodyOptions<GetDevicesAllowedResponse>,
    ) {
        return this.getWithBody<GetDevicesAllowedResponse>(
            'plansDevices.devicesAllowed',
            QSERVER_PATHS.devicesAllowed,
            payload,
            options,
        );
    }

    getPlansExisting(
        payload?: PlansDevicesBody,
        options?: GetWithBodyOptions<GetPlansExistingResponse>,
    ) {
        return this.getWithBody<GetPlansExistingResponse>(
            'plansDevices.plansExisting',
            QSERVER_PATHS.plansExisting,
            payload,
            options,
        );
    }

    getDevicesExisting(
        payload?: PlansDevicesBody,
        options?: GetWithBodyOptions<GetDevicesExistingResponse>,
    ) {
        return this.getWithBody<GetDevicesExistingResponse>(
            'plansDevices.devicesExisting',
            QSERVER_PATHS.devicesExisting,
            payload,
            options,
        );
    }

    // #endregion

    // #region endpoints: permissions

    getPermissions(options?: QServerRequestOptions) {
        return this.get<GetPermissionsResponse>(QSERVER_PATHS.permissionsGet, options);
    }

    setPermissions(body: SetPermissionsBody, options?: QServerRequestOptions) {
        return this.post<PermissionsResponse>(QSERVER_PATHS.permissionsSet, body, options);
    }

    reloadPermissions(body?: ReloadPermissionsBody, options?: QServerRequestOptions) {
        return this.post<PermissionsResponse>(QSERVER_PATHS.permissionsReload, body, options);
    }

    // #endregion

    // #region endpoints: functions and scripts

    executeFunction(body: ExecuteFunctionBody, options?: QServerRequestOptions) {
        return this.post<ExecuteFunctionResponse>(QSERVER_PATHS.functionExecute, body, options);
    }

    uploadScript(body: UploadScriptBody, options?: QServerRequestOptions) {
        return this.post<UploadScriptResponse>(QSERVER_PATHS.scriptUpload, body, options);
    }

    // #endregion

    // #region endpoints: tasks

    getTaskStatus(body: TaskBody, options?: GetWithBodyOptions<GetTaskStatusResponse>) {
        return this.getWithBody<GetTaskStatusResponse>(
            'tasks.status',
            QSERVER_PATHS.taskStatus,
            body,
            options,
        );
    }

    getTaskResult(body: TaskBody, options?: GetWithBodyOptions<GetTaskResultResponse>) {
        return this.getWithBody<GetTaskResultResponse>(
            'tasks.result',
            QSERVER_PATHS.taskResult,
            body,
            options,
        );
    }

    // #endregion

    // #region endpoints: lock

    lock(body: LockBody, options?: QServerRequestOptions) {
        return this.post<LockResponse>(QSERVER_PATHS.lock, body, options);
    }

    unlock(body: UnlockBody, options?: QServerRequestOptions) {
        return this.post<LockResponse>(QSERVER_PATHS.unlock, body, options);
    }

    getLockInfo(payload?: QServerPayload, options?: GetWithBodyOptions<GetLockInfoResponse>) {
        return this.getWithBody<GetLockInfoResponse>('lock.info', QSERVER_PATHS.lockInfo, payload, {
            fallback: () => getLockInfoViaStatus(this),
            ...options,
        });
    }

    // #endregion

    // #region endpoints: console

    getConsoleOutput(
        payload?: ConsoleOutputBody,
        options?: GetWithBodyOptions<GetConsoleOutputResponse>,
    ) {
        return this.getWithBody<GetConsoleOutputResponse>(
            'console.output',
            QSERVER_PATHS.consoleOutput,
            payload,
            options,
        );
    }

    getConsoleOutputUID(options?: QServerRequestOptions) {
        return this.get<GetConsoleOutputUidResponse>(QSERVER_PATHS.consoleOutputUid, options);
    }

    getConsoleOutputUpdate(
        payload?: ConsoleOutputUpdateBody,
        options?: GetWithBodyOptions<GetConsoleOutputUpdateResponse>,
    ) {
        return this.getWithBody<GetConsoleOutputUpdateResponse>(
            'console.outputUpdate',
            QSERVER_PATHS.consoleOutputUpdate,
            payload,
            { fallback: () => getConsoleOutputUpdateViaPoll(this, payload), ...options },
        );
    }

    /**
     * Resolves only once the server closes the stream, which it never does on its own —
     * pass `options.signal` or an `axiosConfig.timeout`. For live output use
     * `useQServerConsoleSocket` instead.
     */
    streamConsoleOutput(options?: QServerRequestOptions) {
        return this.get<string>(QSERVER_PATHS.streamConsoleOutput, {
            ...options,
            axiosConfig: { responseType: 'text', ...options?.axiosConfig },
        });
    }

    // #endregion

    // #region endpoints: admin

    interruptKernel(body?: KernelInterruptBody, options?: QServerRequestOptions) {
        return this.post<AdminResponse>(QSERVER_PATHS.kernelInterrupt, body, options);
    }

    stopManager(body?: ManagerStopBody, options?: QServerRequestOptions) {
        return this.post<AdminResponse>(QSERVER_PATHS.managerStop, body, options);
    }

    testKillManager(options?: QServerRequestOptions) {
        return this.post<AdminResponse>(QSERVER_PATHS.testManagerKill, {}, options);
    }

    testServerSleep(payload?: TestServerSleepBody, options?: GetWithBodyOptions<AdminResponse>) {
        return this.getWithBody<AdminResponse>(
            'admin.testServerSleep',
            QSERVER_PATHS.testServerSleep,
            payload,
            options,
        );
    }

    // #endregion

    // #region endpoints: auth

    whoami(options?: QServerRequestOptions) {
        return this.get<WhoamiResponse>(QSERVER_PATHS.authWhoami, options);
    }

    getScopes(options?: QServerRequestOptions) {
        return this.get<ScopesResponse>(QSERVER_PATHS.authScopes, options);
    }

    listPrincipals(options?: QServerRequestOptions) {
        return this.get<PrincipalListResponse>(QSERVER_PATHS.authPrincipal, options);
    }

    getPrincipal(uuid: string, options?: QServerRequestOptions) {
        return this.get<PrincipalResponse>(
            buildPath(QSERVER_PATHS.authPrincipalByUuid, { uuid }),
            options,
        );
    }

    createApiKeyForPrincipal(
        uuid: string,
        body: APIKeyRequestParams,
        options?: QServerRequestOptions,
    ) {
        return this.post<NewApiKeyResponse>(
            buildPath(QSERVER_PATHS.authPrincipalByUuidApikey, { uuid }),
            body,
            options,
        );
    }

    createApiKey(body: APIKeyRequestParams, options?: QServerRequestOptions) {
        return this.post<NewApiKeyResponse>(QSERVER_PATHS.authApikey, body, options);
    }

    getCurrentApiKeyInfo(options?: QServerRequestOptions) {
        return this.get<CurrentApiKeyInfoResponse>(QSERVER_PATHS.authApikey, options);
    }

    revokeApiKey(firstEight: string, options?: QServerRequestOptions) {
        return this.del<unknown>(QSERVER_PATHS.authApikey, {
            ...options,
            query: { ...options?.query, first_eight: firstEight },
        });
    }

    refreshSession(body: SessionRefreshBody, options?: QServerRequestOptions) {
        return this.post<AccessAndRefreshTokens>(QSERVER_PATHS.authSessionRefresh, body, options);
    }

    revokeSession(sessionId: string, options?: QServerRequestOptions) {
        return this.del<unknown>(
            buildPath(QSERVER_PATHS.authSessionRevokeBySessionId, { session_id: sessionId }),
            options,
        );
    }

    logout(options?: QServerRequestOptions) {
        return this.post<LogoutResponse>(QSERVER_PATHS.authLogout, {}, options);
    }

    // #endregion
}

function describeAlternative(endpointId: string): string {
    if (NO_BROWSER_PATH_ENDPOINT_IDS.includes(endpointId)) {
        return 'This endpoint has no browser-viable alternative on this server version.';
    }
    return 'Call it from Node, or through a proxy that can forward a GET body.';
}

function toQServerApiError(error: unknown, method: QServerHttpMethod, path: string): unknown {
    if (error instanceof QServerApiError) return error;
    if (!axios.isAxiosError(error)) return error;

    const status = error.response?.status;
    const responseBody = error.response?.data;
    const detail =
        typeof responseBody === 'object' && responseBody !== null && 'msg' in responseBody
            ? String((responseBody as { msg: unknown }).msg)
            : error.message;

    return new QServerApiError({
        message: `${method} ${path} failed${status ? ` with ${status}` : ''}: ${detail}`,
        method,
        path,
        status,
        responseBody,
        cause: error,
    });
}
