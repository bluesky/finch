import { AxiosInstance } from 'axios';
import { ApiKeyLocation, ApiKeyScheme, QServerSuccessResponse, GetBodyStrategy, GetWithBodyOptions, InterceptorHandle, QServerAuthErrorCallback, QServerErrorInterceptor, QServerBody, QServerPayload, QServerRequestInterceptor, QServerRequestOptions, QServerResponseInterceptor } from '../types/common';
import { QServerHttpMethod } from '../types/errors';
import { APIKeyRequestParams } from '../types/generatedAliases';
import { AdminResponse, KernelInterruptBody, ManagerStopBody, TestServerSleepBody } from '../types/admin';
import { LogoutResponse, PrincipalListResponse, ScopesResponse, SessionRefreshBody } from '../types/auth';
import { QServerEndpoints } from '../types/clientSurface';
import { ConsoleOutputBody, ConsoleOutputUpdateBody, GetConsoleOutputResponse, GetConsoleOutputUidResponse, GetConsoleOutputUpdateResponse } from '../types/console';
import { EnvironmentUpdateBody, EnvironmentUpdateResponse } from '../types/environment';
import { ExecuteFunctionBody, UploadScriptBody } from '../types/functionsScripts';
import { ClearHistoryResponse, GetHistoryResponse } from '../types/history';
import { GetLockInfoResponse, LockBody, LockResponse, UnlockBody } from '../types/lock';
import { GetPermissionsResponse, ReloadPermissionsBody, SetPermissionsBody } from '../types/permissions';
import { GetDevicesAllowedResponse, GetDevicesExistingResponse, GetPlansAllowedResponse, GetPlansExistingResponse, PlansDevicesBody } from '../types/plansDevices';
import { AddQueueItemBatchBody, AddQueueItemBody, ExecuteQueueItemBody, GetQueueItemBody, GetQueueItemResponse, GetQueueResponse, MoveQueueItemBatchBody, MoveQueueItemBody, PostItemAddResponse, PostItemBatchResponse, QueueAutostartBody, QueueClearResponse, QueueModeSetBody, QueueStartResponse, RemoveQueueItemBatchBody, RemoveQueueItemBody, UpdateQueueItemBody, UploadSpreadsheetInput, UploadSpreadsheetResponse } from '../types/queue';
import { GetReMetadataResponse, GetRunsBody, GetRunsResponse, RePauseBody, ReResumeBody } from '../types/runEngine';
import { GetConfigResponse, GetStatusResponse, PingResponse } from '../types/status';
import { GetTaskResultResponse, GetTaskStatusResponse, TaskBody } from '../types/tasks';
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
export declare class QServerApiClient implements QServerEndpoints {
    private client;
    private baseUrl;
    private apiKey;
    private bearerToken;
    private refreshToken;
    private apiKeyLocation;
    private apiKeyScheme;
    private signal;
    private timeout;
    private refreshOn401;
    private authErrorCallback;
    private getBodyStrategy;
    private silenceGetBodyWarnings;
    private fallbackCallback;
    private interceptors;
    private refreshPromise;
    constructor(config?: QServerClientConfig);
    getBaseUrl(): string;
    /** Set the server origin. A trailing `/api` is stripped, since spec paths include it. */
    setBaseUrl(baseUrl: string): void;
    getApiKey(): string | null;
    /** Swap the API key. Read at request time, so in-flight clients need no rebuild. */
    setApiKey(apiKey: string | null): void;
    getApiKeyLocation(): ApiKeyLocation;
    setApiKeyLocation(location: ApiKeyLocation): void;
    getApiKeyScheme(): ApiKeyScheme;
    setApiKeyScheme(scheme: ApiKeyScheme): void;
    getBearerToken(): string | null;
    setBearerToken(token: string | null): void;
    getRefreshToken(): string | null;
    setRefreshToken(token: string | null): void;
    /** Drop the API key and both tokens. */
    clearAuth(): void;
    /** The underlying axios instance, for low-level configuration. */
    getAxiosClient(): AxiosInstance;
    /**
     * Replace the axios instance. Built-in and caller-registered interceptors are
     * re-installed onto the replacement, built-ins first.
     */
    setAxiosClient(client: AxiosInstance): void;
    getSignal(): AbortSignal | undefined;
    setSignal(signal: AbortSignal | undefined): void;
    setAuthErrorCallback(callback: QServerAuthErrorCallback | undefined): void;
    getGetBodyStrategy(): GetBodyStrategy;
    setGetBodyStrategy(strategy: GetBodyStrategy): void;
    setFallbackCallback(callback: ((info: QServerFallbackInfo) => void) | undefined): void;
    setTimeout(timeout: number): void;
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
    };
    /**
     * Register a request interceptor.
     *
     * Axios runs request interceptors last-registered-first, and the built-in auth
     * interceptor is registered in the constructor — so a caller's interceptor observes the
     * config *before* the `Authorization` header is attached.
     */
    addRequestInterceptor(onFulfilled: QServerRequestInterceptor, onRejected?: QServerErrorInterceptor): InterceptorHandle;
    addResponseInterceptor(onFulfilled: QServerResponseInterceptor, onRejected?: QServerErrorInterceptor): InterceptorHandle;
    /** Remove one interceptor. Built-in handles are ignored. */
    ejectInterceptor(handle: InterceptorHandle): boolean;
    /** Remove every caller-registered interceptor. Built-in auth and refresh survive. */
    clearInterceptors(kind?: 'request' | 'response'): void;
    listInterceptors(): readonly InterceptorHandle[];
    /** Raw axios interceptor managers, for anything the wrappers above do not cover. */
    getInterceptorManagers(): {
        request: AxiosInstance['interceptors']['request'];
        response: AxiosInstance['interceptors']['response'];
    };
    private installBuiltinInterceptors;
    /**
     * Attach credentials, unless the call already carries its own (a per-request override
     * set by `buildConfig`, or a header supplied by the caller).
     */
    private applyAuth;
    /** Single-flight 401 refresh, then one retry of the original request. */
    private handleResponseError;
    /** Exchange the refresh token for a new access token. Bypasses interceptors. */
    private doTokenRefresh;
    protected resolveClient(options?: QServerRequestOptions): AxiosInstance;
    private buildConfig;
    /**
     * The origin this call should go to.
     *
     * A per-request `baseUrl` wins over the client's, and is normalized the same way `setBaseUrl`
     * normalizes: spec paths already carry `/api/`, so a caller who passes `.../api` gets the same
     * forgiveness they would from the setter.
     */
    protected resolveBaseUrl(options?: QServerRequestOptions): string;
    /** Issue a request and unwrap `response.data`, normalizing failures. */
    protected request<T>(method: QServerHttpMethod, path: string, data?: unknown, options?: QServerRequestOptions): Promise<T>;
    /** Untyped escape hatch for endpoints whose shape a caller wants to declare itself. */
    requestRaw<T = unknown>(method: QServerHttpMethod, path: string, data?: unknown, options?: QServerRequestOptions): Promise<T>;
    protected get<T>(path: string, options?: QServerRequestOptions): Promise<T>;
    protected post<T>(path: string, body?: QServerBody, options?: QServerRequestOptions): Promise<T>;
    protected del<T>(path: string, options?: QServerRequestOptions): Promise<T>;
    protected postMultipart<T>(path: string, form: FormData, options?: QServerRequestOptions): Promise<T>;
    /**
     * Issue a `GET` whose arguments travel in a JSON body.
     *
     * An empty payload is sent as a plain bodiless GET, which works everywhere because the
     * server defaults `payload` to `{}`. A non-empty payload is only deliverable outside a
     * browser; what happens otherwise is governed by the {@link GetBodyStrategy}.
     */
    protected getWithBody<T>(endpointId: string, path: string, payload?: QServerBody, options?: GetWithBodyOptions<T>): Promise<T>;
    private runFallback;
    ping(payload?: QServerPayload, options?: GetWithBodyOptions<PingResponse>): Promise<GetStatusResponse>;
    getRoot(payload?: QServerPayload, options?: GetWithBodyOptions<PingResponse>): Promise<GetStatusResponse>;
    getStatus(payload?: QServerPayload, options?: GetWithBodyOptions<GetStatusResponse>): Promise<GetStatusResponse>;
    getConfig(payload?: QServerPayload, options?: GetWithBodyOptions<GetConfigResponse>): Promise<GetConfigResponse>;
    getQueue(payload?: QServerPayload, options?: GetWithBodyOptions<GetQueueResponse>): Promise<GetQueueResponse>;
    getQueueItem(body?: GetQueueItemBody, options?: GetWithBodyOptions<GetQueueItemResponse>): Promise<GetQueueItemResponse>;
    addQueueItem(body: AddQueueItemBody, options?: QServerRequestOptions): Promise<PostItemAddResponse>;
    addQueueItemBatch(body: AddQueueItemBatchBody, options?: QServerRequestOptions): Promise<PostItemBatchResponse>;
    executeQueueItem(body: ExecuteQueueItemBody, options?: QServerRequestOptions): Promise<PostItemAddResponse>;
    updateQueueItem(body: UpdateQueueItemBody, options?: QServerRequestOptions): Promise<PostItemAddResponse>;
    removeQueueItem(body?: RemoveQueueItemBody, options?: QServerRequestOptions): Promise<PostItemAddResponse>;
    removeQueueItemBatch(body: RemoveQueueItemBatchBody, options?: QServerRequestOptions): Promise<PostItemBatchResponse>;
    moveQueueItem(body: MoveQueueItemBody, options?: QServerRequestOptions): Promise<PostItemAddResponse>;
    moveQueueItemBatch(body: MoveQueueItemBatchBody, options?: QServerRequestOptions): Promise<PostItemBatchResponse>;
    uploadQueueSpreadsheet(input: UploadSpreadsheetInput, options?: QServerRequestOptions): Promise<UploadSpreadsheetResponse>;
    startQueue(options?: QServerRequestOptions): Promise<QueueStartResponse>;
    stopQueue(options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    cancelQueueStop(options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    clearQueue(options?: QServerRequestOptions): Promise<QueueClearResponse>;
    setQueueMode(body: QueueModeSetBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    setQueueAutostart(body: QueueAutostartBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    getQueueHistory(payload?: QServerPayload, options?: GetWithBodyOptions<GetHistoryResponse>): Promise<GetHistoryResponse>;
    clearHistory(options?: QServerRequestOptions): Promise<ClearHistoryResponse>;
    openEnvironment(options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    closeEnvironment(options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    destroyEnvironment(options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    updateEnvironment(body?: EnvironmentUpdateBody, options?: QServerRequestOptions): Promise<EnvironmentUpdateResponse>;
    pauseRE(body?: RePauseBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    resumeRE(body?: ReResumeBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    stopRE(body?: ReResumeBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    abortRE(body?: ReResumeBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    haltRE(body?: ReResumeBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    getRuns(body?: GetRunsBody, options?: QServerRequestOptions): Promise<GetRunsResponse>;
    getRunsActive(options?: QServerRequestOptions): Promise<GetRunsResponse>;
    getRunsOpen(options?: QServerRequestOptions): Promise<GetRunsResponse>;
    getRunsClosed(options?: QServerRequestOptions): Promise<GetRunsResponse>;
    getREMetadata(payload?: QServerPayload, options?: GetWithBodyOptions<GetReMetadataResponse>): Promise<GetReMetadataResponse>;
    getPlansAllowed(payload?: PlansDevicesBody, options?: GetWithBodyOptions<GetPlansAllowedResponse>): Promise<GetPlansAllowedResponse>;
    getDevicesAllowed(payload?: PlansDevicesBody, options?: GetWithBodyOptions<GetDevicesAllowedResponse>): Promise<GetDevicesAllowedResponse>;
    getPlansExisting(payload?: PlansDevicesBody, options?: GetWithBodyOptions<GetPlansExistingResponse>): Promise<GetPlansExistingResponse>;
    getDevicesExisting(payload?: PlansDevicesBody, options?: GetWithBodyOptions<GetDevicesExistingResponse>): Promise<GetDevicesExistingResponse>;
    getPermissions(options?: QServerRequestOptions): Promise<GetPermissionsResponse>;
    setPermissions(body: SetPermissionsBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    reloadPermissions(body?: ReloadPermissionsBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    executeFunction(body: ExecuteFunctionBody, options?: QServerRequestOptions): Promise<import('../types/functionsScripts').TaskStartedResponse>;
    uploadScript(body: UploadScriptBody, options?: QServerRequestOptions): Promise<import('../types/functionsScripts').TaskStartedResponse>;
    getTaskStatus(body: TaskBody, options?: GetWithBodyOptions<GetTaskStatusResponse>): Promise<GetTaskStatusResponse>;
    getTaskResult(body: TaskBody, options?: GetWithBodyOptions<GetTaskResultResponse>): Promise<GetTaskResultResponse>;
    lock(body: LockBody, options?: QServerRequestOptions): Promise<LockResponse>;
    unlock(body: UnlockBody, options?: QServerRequestOptions): Promise<LockResponse>;
    getLockInfo(payload?: QServerPayload, options?: GetWithBodyOptions<GetLockInfoResponse>): Promise<LockResponse>;
    getConsoleOutput(payload?: ConsoleOutputBody, options?: GetWithBodyOptions<GetConsoleOutputResponse>): Promise<GetConsoleOutputResponse>;
    getConsoleOutputUID(options?: QServerRequestOptions): Promise<GetConsoleOutputUidResponse>;
    getConsoleOutputUpdate(payload?: ConsoleOutputUpdateBody, options?: GetWithBodyOptions<GetConsoleOutputUpdateResponse>): Promise<GetConsoleOutputUpdateResponse>;
    /**
     * Resolves only once the server closes the stream, which it never does on its own —
     * pass `options.signal` or an `axiosConfig.timeout`. For live output use
     * `useQServerConsoleSocket` instead.
     */
    streamConsoleOutput(options?: QServerRequestOptions): Promise<string>;
    interruptKernel(body?: KernelInterruptBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    stopManager(body?: ManagerStopBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    testKillManager(options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
    testServerSleep(payload?: TestServerSleepBody, options?: GetWithBodyOptions<AdminResponse>): Promise<QServerSuccessResponse>;
    whoami(options?: QServerRequestOptions): Promise<{
        uuid: string;
        type: import('../generated/schema').components["schemas"]["PrincipalType"];
        identities: import('../generated/schema').components["schemas"]["Identity"][];
        api_keys: import('../generated/schema').components["schemas"]["APIKey"][];
        sessions: import('../generated/schema').components["schemas"]["Session"][];
        latest_activity?: string | null;
        roles: string[] | null;
        scopes: string[] | null;
        api_key_scopes?: string[] | null;
        access_token?: string | null;
    }>;
    getScopes(options?: QServerRequestOptions): Promise<ScopesResponse>;
    listPrincipals(options?: QServerRequestOptions): Promise<PrincipalListResponse>;
    getPrincipal(uuid: string, options?: QServerRequestOptions): Promise<{
        uuid: string;
        type: import('../generated/schema').components["schemas"]["PrincipalType"];
        identities: import('../generated/schema').components["schemas"]["Identity"][];
        api_keys: import('../generated/schema').components["schemas"]["APIKey"][];
        sessions: import('../generated/schema').components["schemas"]["Session"][];
        latest_activity?: string | null;
        roles: string[] | null;
        scopes: string[] | null;
        api_key_scopes?: string[] | null;
        access_token?: string | null;
    }>;
    createApiKeyForPrincipal(uuid: string, body: APIKeyRequestParams, options?: QServerRequestOptions): Promise<{
        first_eight: string;
        expiration_time?: string | null;
        note?: string | null;
        scopes: string[];
        latest_activity?: string | null;
        secret: string;
    }>;
    createApiKey(body: APIKeyRequestParams, options?: QServerRequestOptions): Promise<{
        first_eight: string;
        expiration_time?: string | null;
        note?: string | null;
        scopes: string[];
        latest_activity?: string | null;
        secret: string;
    }>;
    getCurrentApiKeyInfo(options?: QServerRequestOptions): Promise<{
        first_eight: string;
        expiration_time?: string | null;
        note?: string | null;
        scopes: string[];
        latest_activity?: string | null;
    }>;
    revokeApiKey(firstEight: string, options?: QServerRequestOptions): Promise<unknown>;
    refreshSession(body: SessionRefreshBody, options?: QServerRequestOptions): Promise<{
        access_token: string;
        expires_in: number;
        refresh_token: string;
        refresh_token_expires_in: number;
        token_type: string;
    }>;
    revokeSession(sessionId: string, options?: QServerRequestOptions): Promise<unknown>;
    logout(options?: QServerRequestOptions): Promise<LogoutResponse>;
}
//# sourceMappingURL=QServerApiClient.d.ts.map