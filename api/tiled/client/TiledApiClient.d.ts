import { AxiosInstance, ResponseType } from 'axios';
import { InterceptorHandle, TiledBinaryBody, TiledErrorInterceptor, TiledRequestInterceptor, TiledResponseInterceptor } from '../types/common';
import { TiledHttpMethod } from '../types/errors';
import { TiledGraphBindEntityInput, TiledGraphCreateEntityInput, TiledGraphCreateLinkInput, TiledGraphEntity, TiledGraphEntityFilters, TiledGraphEntityNodePath, TiledGraphNodeEntityFilters, TiledGraphLink, TiledGraphLinkFilters, TiledGraphNamespace, TiledGraphQLVariables, TiledGraphUpdateEntityInput, TiledGraphUpdateLinkInput } from '../types/graph';
import { GetDistinctResponse, DeliveryResponse, PatchMetadataRequest, PatchMetadataResponse, PostMetadataRequest, PostMetadataResponse, PutDataSourceRequest, PutMetadataRequest, PutMetadataResponse, WebhookRegistrationRequest, WebhookResponse } from '../types/generatedAliases';
import { TiledAuthProvider, TiledInfoResponse } from '../types/info';
import { TiledSearchItem, TiledSearchResult, TiledTableRow } from '../types/nodes';
import { TiledApiKeyLocation, TiledApiKeyScheme, TiledAuthErrorCallback, TiledLoginTokens, TiledRequestOptions } from '../types/requestOptions';
import { TiledArrayBufferOptions, TiledArrayImagePathOptions, TiledArrayJSONOptions, TiledArrayOptionsMap, TiledArrayPngOptions, TiledArrayReturnMap, TiledArrayReturnType, TiledAwkwardRequestOptions, TiledNodeRequestOptions, TiledRaggedRequestOptions, TiledTableJSONOptions, TiledTableJSONSequenceOptions, TiledTableOptionsMap, TiledTableRequestOptions, TiledTableReturnMap, TiledTableReturnType, TiledTableEndpoint } from '../types/dataOptions';
import { TiledStructures } from '../types/structures';
import { TiledDistinctConfig, TiledSearchConfig } from '../types/searchFilters';
import { TiledFormatName } from './formats';
import { TiledQueryParams } from './searchParams';
import { TiledTokenStorage, TiledStoredTokens } from './tokenStorage';
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
export declare class TiledApiClient {
    private client;
    private baseUrl;
    private initialPath;
    private apiKey;
    private bearerToken;
    private signal;
    private timeout;
    private maxArrayBytes;
    private apiKeyScheme;
    private apiKeyLocation;
    private authErrorCallback;
    private tokenStorage;
    private interceptors;
    private refreshPromise;
    constructor(config?: TiledApiClientConfig);
    /** The base URL, **including** the `/api/v1` segment. */
    getBaseUrl(): string;
    setBaseUrl(baseUrl: string): void;
    getInitialPath(): string;
    setInitialPath(initialPath: string): void;
    getApiKey(): string | null;
    /** Takes effect on the next request — the auth interceptor reads the key at request time. */
    setApiKey(apiKey: string | null): void;
    getApiKeyScheme(): TiledApiKeyScheme;
    setApiKeyScheme(scheme: TiledApiKeyScheme): void;
    getApiKeyLocation(): TiledApiKeyLocation;
    setApiKeyLocation(location: TiledApiKeyLocation): void;
    getBearerToken(): string | null;
    setBearerToken(token: string | null): void;
    /** Drop every credential this client holds, including anything in token storage. */
    clearAuth(): void;
    getStoredTokens(): TiledStoredTokens | null;
    /**
     * Seed or clear the session: the bearer token *and* the stored refresh token together.
     *
     * The counterpart to {@link getStoredTokens}, which could read a session the client had no way
     * to write. `setBearerToken` sets only the in-memory half, and the refresh token lived in a
     * `TiledTokenStorage` a caller could replace wholesale but not update — so handing the client a
     * session you already held (from another tab, a test fixture, or a UI that asks for one) meant
     * constructing a storage object yourself.
     *
     * `null` clears both, equivalent to {@link clearAuth} minus the API key.
     *
     * **Mind which storage is installed.** The default browser storage shares its keys with the
     * `<Tiled>` viewer component, so writing an experimental token here changes the session for
     * anything else reading those keys. Install a memory storage first when that is not what you
     * want — see `createMemoryTokenStorage`.
     */
    setSession(tokens: TiledStoredTokens | null): void;
    setTokenStorage(storage: TiledTokenStorage): void;
    getAxiosClient(): AxiosInstance;
    /** Adopt a different axios instance, re-installing every interceptor onto it. */
    setAxiosClient(client: AxiosInstance): void;
    getSignal(): AbortSignal | undefined;
    setSignal(signal: AbortSignal | undefined): void;
    getMaxArrayBytes(): number | undefined;
    setMaxArrayBytes(maxArrayBytes: number | undefined): void;
    setTimeout(timeout: number): void;
    setAuthErrorCallback(callback: TiledAuthErrorCallback | undefined): void;
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
    };
    addRequestInterceptor(onFulfilled: TiledRequestInterceptor, onRejected?: TiledErrorInterceptor): InterceptorHandle;
    addResponseInterceptor(onFulfilled: TiledResponseInterceptor, onRejected?: TiledErrorInterceptor): InterceptorHandle;
    ejectInterceptor(handle: InterceptorHandle): boolean;
    /** Remove caller-registered interceptors; the built-in auth handlers are untouched. */
    clearInterceptors(kind?: 'request' | 'response'): void;
    listInterceptors(): readonly InterceptorHandle[];
    private installBuiltinInterceptors;
    /**
     * Attach credentials, unless the call already carries its own.
     *
     * Reading the key here rather than baking it into a header at construction is what makes
     * `setApiKey` effective immediately, with nothing to rebuild.
     */
    private applyAuth;
    /**
     * Single-flight 401 refresh, then one retry of the original request.
     *
     * Two conditions beyond "it was a 401" decide whether a refresh is even attempted, and both
     * exist to stop the client overriding a decision the caller made:
     *
     * - **The caller did not choose this call's credentials.** A request sent with
     *   `apiKey: null`, a one-off key, or an explicit `Authorization` header said what identity to
     *   use. Refreshing and retrying with the stored session's bearer token would substitute
     *   credentials the caller deliberately did not send — turning an intentionally anonymous probe
     *   into an authenticated one, and silently.
     * - **The request went to this client's own server.** The stored refresh token was issued by
     *   the configured server. A per-call `baseUrl` points somewhere else, and sending that token
     *   there would hand a credential to a third party that never had it. Related:
     *   {@link doTokenRefresh} now always talks to the configured server rather than to whichever
     *   host the failed request used.
     */
    private handleResponseError;
    /**
     * Whether a request went to this client's own server.
     *
     * `baseURL` is absent only on a request built outside `buildConfig`, which means it inherited
     * the axios instance's default — this client's own. A per-call override is compared after
     * normalisation, and the derived origin counts as the same server because the origin-scoped
     * routes (`/healthz`, `/tiled-ui-settings`, zarr) are legitimately issued against it.
     */
    private isOwnServer;
    /**
     * Exchange the refresh token for a new access token.
     *
     * Issued through a bare `axios`, not `this.client`, so a failure cannot re-enter this handler
     * and recurse. Two endpoints are tried because Tiled moved the route: `/auth/session/refresh`
     * is current, `/auth/refresh` is what older servers answer, and a 404 on the first is the
     * documented signal to try the second. Upstream does the same.
     *
     * **The target is always this client's configured server**, never the host of the request that
     * 401'd. Deriving it from the failed request meant a per-call `baseUrl` override could send the
     * stored refresh token to an unrelated server. `QServerApiClient.doTokenRefresh` has always
     * worked this way; this now matches it.
     */
    private doTokenRefresh;
    private resolveClient;
    /** The base URL this call should go to: the API base, or the bare origin for `origin` routes. */
    private resolveBaseUrl;
    /** Resolve a Tiled node path against the initial path, honouring `pathMode`. */
    private encodePath;
    private buildConfig;
    /** Issue a request and unwrap `response.data`, normalizing failures. */
    protected request<T>(method: TiledHttpMethod, path: string, data: unknown, options?: TiledRequestOptions, extras?: RequestExtras): Promise<T>;
    /** Untyped escape hatch for callers who want to declare a shape themselves. */
    requestRaw<T = unknown>(method: TiledHttpMethod, path: string, data?: unknown, options?: TiledRequestOptions, extras?: {
        params?: TiledQueryParams;
        headers?: Record<string, string>;
        responseType?: ResponseType;
    }): Promise<T>;
    private get;
    private post;
    private put;
    private patch;
    private del;
    /**
     * Send a binary payload.
     *
     * The content type is explicit rather than inferred. axios would otherwise guess from the body
     * — `application/json` for a plain array, nothing at all for an `ArrayBuffer` — and Tiled
     * dispatches its writers on exactly this header, so a wrong guess is a 415 or, worse, a
     * successful write of the wrong thing.
     */
    private sendBinary;
    /**
     * A structure fetcher bound to these request options, for the downsampling helpers.
     *
     * The node may not be an array — a caller can point an array read at a table by mistake — so
     * what comes back is whatever structure the node has. `resolveArrayStructure` validates it and
     * treats a non-array structure as absent, so the request still goes out and the *server*
     * reports the mismatch, rather than the downsampling maths throwing first.
     */
    private makeStructureFetcher;
    /** Apply the client's array byte budget unless the call set its own. */
    private resolveArrayOptions;
    private searchPath;
    private distinctPath;
    private metadataPath;
    private dataPath;
    /**
     * The `/api/v1/` root document: versions, supported formats, auth providers.
     *
     * **Resolves `null` rather than rejecting** when the server is unreachable or answers something
     * that is not an About document. Upstream's behaviour, preserved deliberately — the login flow
     * probes servers it knows nothing about and needs a value back. Every other read on this client
     * rejects with a {@link TiledApiError}.
     */
    getServerInfo(options?: TiledRequestOptions): Promise<TiledInfoResponse | null>;
    /** The same document, but rejecting on failure. For callers that want the error. */
    getAbout(options?: TiledRequestOptions): Promise<TiledInfoResponse>;
    /** `GET /healthz` — liveness. Outside `/api/v1`, so issued against the origin. */
    getHealth(options?: TiledRequestOptions): Promise<unknown>;
    /** `GET /tiled-ui-settings` — the server's hints for its own web UI. */
    getUiSettings(options?: TiledRequestOptions): Promise<unknown>;
    /** `GET /api/v1/metrics` — Prometheus-style server metrics. */
    getMetrics(options?: TiledRequestOptions): Promise<unknown>;
    /**
     * `GET /search/{path}` — list and filter the children of a container.
     *
     * `searchPath: ''` is the root container, and legal.
     */
    getSearch(searchPath: string, config?: TiledSearchConfig, options?: TiledRequestOptions): Promise<TiledSearchResult>;
    /**
     * `GET /distinct/{path}` — the distinct values of metadata keys, specs and structure families
     * across a container, optionally with counts.
     *
     * New: the package never exposed this, so building a facet UI meant paginating the whole
     * container client-side.
     */
    getDistinct(searchPath: string, config?: TiledDistinctConfig, options?: TiledRequestOptions): Promise<GetDistinctResponse>;
    /** `GET /metadata/{path}` — one node's metadata, specs, structure and links. */
    getMetadata<S extends TiledStructures = TiledStructures>(path: string, options?: TiledRequestOptions): Promise<TiledSearchItem<S>>;
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
    createNode(parentPath: string, body: PostMetadataRequest, options?: TiledRequestOptions): Promise<PostMetadataResponse>;
    /** `PUT /metadata/{path}` — replace a node's metadata, specs and access blob wholesale. */
    updateMetadata(path: string, body: PutMetadataRequest, params?: {
        drop_revision?: boolean;
    }, options?: TiledRequestOptions): Promise<PutMetadataResponse>;
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
    patchMetadata(path: string, body: PatchMetadataRequest, params?: {
        drop_revision?: boolean;
    }, options?: TiledRequestOptions): Promise<PatchMetadataResponse>;
    /** {@link patchMetadata} in merge mode: the given fields are merged into what is there. */
    patchMetadataMerge(path: string, body: {
        metadata?: Record<string, unknown>;
        specs?: PatchMetadataRequest['specs'];
        access_blob?: Record<string, unknown>;
    }, params?: {
        drop_revision?: boolean;
    }, options?: TiledRequestOptions): Promise<PatchMetadataResponse>;
    /** {@link patchMetadata} in JSON Patch mode: `metadata` is a list of RFC 6902 operations. */
    patchMetadataJsonPatch(path: string, body: {
        metadata?: PatchMetadataRequest['metadata'];
        specs?: PatchMetadataRequest['specs'];
        access_blob?: PatchMetadataRequest['access_blob'];
    }, params?: {
        drop_revision?: boolean;
    }, options?: TiledRequestOptions): Promise<PatchMetadataResponse>;
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
    deleteNode(path: string, params?: {
        recursive?: boolean;
        external_only?: boolean;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** Generic array dispatcher. Prefer the typed helpers below. */
    getArrayAs<T extends TiledArrayReturnType>(arrayPath: string, type: T, options?: TiledArrayOptionsMap[T]): Promise<TiledArrayReturnMap[T]>;
    /** `GET /array/full/{path}` as JSON. Defaults to `number[][]`; override the shape if you know it. */
    getArrayAsJSON<T = number[][]>(arrayPath: string, options?: TiledArrayJSONOptions): Promise<T>;
    /**
     * `GET /array/full/{path}` as a PNG `Blob`.
     *
     * **Browser only.** `responseType: 'blob'` is an XHR/fetch concept; under Node the axios HTTP
     * adapter ignores it and the result is not a `Blob` (`size` and `type` read `undefined`). Use
     * {@link getArrayAsBuffer} outside a browser. Inherited behaviour, not introduced here.
     */
    getArrayAsPng(arrayPath: string, options?: TiledArrayPngOptions): Promise<Blob>;
    /** `GET /array/full/{path}` as raw bytes. */
    getArrayAsBuffer(arrayPath: string, options?: TiledArrayBufferOptions): Promise<ArrayBuffer>;
    /**
     * A URL for `<img src>`. **Synchronous**, and therefore makes no request.
     *
     * Being synchronous it cannot fetch the array's structure either, so downsampling only happens
     * when `structure` or `arrayItem` is passed. With `apiKeyLocation: 'query'` the key is appended
     * to the URL, which is the only way an `<img>` can authenticate — note that this puts the key in
     * the DOM and in any referrer logging.
     */
    getArrayAsImagePath(arrayPath: string, options?: TiledArrayImagePathOptions): string;
    /** `GET /array/block/{path}` — one chunk, addressed by its block index. */
    getArrayBlock(arrayPath: string, params: {
        block: number[];
        slice?: string;
        expected_shape?: string;
        format?: string;
    }, options?: TiledRequestOptions): Promise<ArrayBuffer>;
    /**
     * `PUT /array/full/{path}` — write a whole array.
     *
     * Bytes (`ArrayBuffer` / typed array / `Blob`) are sent as `application/octet-stream` in the
     * array's own dtype and C order — the server trusts the declared structure and does not
     * convert. A nested `number[][]` is sent as JSON instead, which is slower but needs no dtype
     * knowledge. No encoding of one into the other happens here; that was a deliberate scope call,
     * because getting it wrong writes plausible-looking garbage.
     */
    putArrayFull(arrayPath: string, data: TiledBinaryBody | number[][], params?: {
        persist?: boolean;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `PUT /array/block/{path}` — write one chunk. */
    putArrayBlock(arrayPath: string, data: TiledBinaryBody | number[][], params: {
        block: number[];
        persist?: boolean;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /**
     * `PATCH /array/full/{path}` — write a sub-region, optionally growing the array.
     *
     * `offset` and `shape` locate the region and are required. `extend: true` lets the write grow a
     * resizable array past its current bounds, which is how a running scan appends.
     */
    patchArrayFull(arrayPath: string, data: TiledBinaryBody | number[][], params: {
        offset: number[];
        shape: number[];
        extend?: boolean;
        persist?: boolean;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `GET /ragged/full/{path}`. */
    getRaggedFull(path: string, options?: TiledRaggedRequestOptions): Promise<unknown>;
    /** `PUT /ragged/full/{path}`. */
    putRaggedFull(path: string, data: TiledBinaryBody | unknown[], params?: {
        persist?: boolean;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `PUT /ragged/block/{path}`. */
    putRaggedBlock(path: string, data: TiledBinaryBody | unknown[], params: {
        block: number[];
        persist?: boolean;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `PATCH /ragged/full/{path}` — write a sub-region of a ragged array. */
    patchRaggedFull(path: string, data: TiledBinaryBody | unknown[], params: {
        offset: number[];
        shape: number[];
        extend?: boolean;
        persist?: boolean;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** Generic table dispatcher. Prefer the typed helpers below. */
    getTableAs<T extends TiledTableReturnType>(tablePath: string, type?: T, endpoint?: TiledTableEndpoint, options?: TiledTableOptionsMap[T]): Promise<TiledTableReturnMap[T]>;
    /** `GET /table/partition/{path}` — one partition, column-oriented. */
    getTablePartitionAsJSON(tablePath: string, options?: TiledTableJSONOptions): Promise<TiledTableReturnMap['JSON']>;
    /** `GET /table/partition/{path}` — one partition, row-oriented. */
    getTablePartitionAsJSONSequence(tablePath: string, options?: TiledTableJSONSequenceOptions): Promise<TiledTableRow[]>;
    /** `GET /table/full/{path}` — every partition, column-oriented. */
    getTableFullAsJSON(tablePath: string, options?: TiledTableJSONOptions): Promise<TiledTableReturnMap['JSON']>;
    /** `GET /table/full/{path}` — every partition, row-oriented. */
    getTableFullAsJSONSequence(tablePath: string, options?: TiledTableJSONSequenceOptions): Promise<TiledTableRow[]>;
    /**
     * `GET /table/full/{path}` in any representation — CSV, parquet, arrow, Excel, HDF5.
     *
     * The format decides the return type; see `client/formats.ts`. This is how a download button is
     * built without hand-rolling an `Accept` header and an axios `responseType`.
     */
    getTableFullAs(tablePath: string, format: TiledFormatName | string, options?: TiledTableRequestOptions): Promise<unknown>;
    /**
     * `POST /table/full/{path}` — the same read, with the column list in the body.
     *
     * A read, despite the verb: the body selects columns rather than changing anything. It exists
     * for selections too long for a query string. The hook for this is a **query**, for the same
     * reason `useQueueGetRunsQuery` is.
     */
    postTableFull(tablePath: string, columns: string[] | null, params?: {
        format?: string;
        filename?: string;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `POST /table/partition/{path}` — one partition, column list in the body. A read. */
    postTablePartition(tablePath: string, columns: string[] | null, params: {
        partition: number;
        format?: string;
        filename?: string;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /**
     * `PUT /table/partition/{path}` — write one partition.
     *
     * The payload is encoded table bytes and the `mimetype` says which encoding — parquet, CSV or
     * arrow. Required rather than defaulted: the server dispatches its reader on this header, and a
     * wrong guess either fails or silently writes nonsense.
     */
    putTablePartition(tablePath: string, data: TiledBinaryBody, params: {
        partition: number;
        mimetype: string;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `PATCH /table/partition/{path}` — append to one partition. */
    patchTablePartition(tablePath: string, data: TiledBinaryBody, params: {
        partition: number;
        mimetype: string;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `PUT /table/full/{path}` — write a whole table. Same operation as {@link putNodeFull}. */
    putTableFull(tablePath: string, data: TiledBinaryBody, params: {
        mimetype: string;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `GET /container/full/{path}` — a container's metadata and data together. */
    getContainerFull(path: string, options?: TiledNodeRequestOptions): Promise<unknown>;
    /** `POST /container/full/{path}` — the same read, with the field list in the body. */
    postContainerFull(path: string, fields: string[] | null, params?: {
        format?: string;
        filename?: string;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `GET /node/full/{path}` — whichever of container or table the node turns out to be. */
    getNodeFull(path: string, options?: TiledNodeRequestOptions): Promise<unknown>;
    /** `PUT /node/full/{path}` — write a whole node. */
    putNodeFull(path: string, data: TiledBinaryBody, params: {
        mimetype: string;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `GET /awkward/full/{path}` — the whole awkward array. */
    getAwkwardFull(path: string, options?: TiledAwkwardRequestOptions): Promise<unknown>;
    /** `GET /awkward/buffers/{path}` — selected buffers, by form key. */
    getAwkwardBuffers(path: string, options?: TiledAwkwardRequestOptions): Promise<unknown>;
    /** `POST /awkward/buffers/{path}` — the same read with the form-key list in the body. */
    postAwkwardBuffers(path: string, formKeys: string[], params?: {
        format?: string;
        filename?: string;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `PUT /awkward/full/{path}` — write an awkward array as its form plus buffer map. */
    putAwkwardFull(path: string, body: {
        form: unknown;
        length: number;
        container: Record<string, unknown>;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /**
     * `POST /register/{path}` — register data that already exists on disk.
     *
     * Takes the same body as {@link createNode}, and addresses the **parent** container the same
     * way, but the data sources point at files the server can already see rather than at bytes about
     * to be uploaded.
     */
    postRegister(parentPath: string, body: PostMetadataRequest, options?: TiledRequestOptions): Promise<PostMetadataResponse>;
    /**
     * `PUT /data_source/{path}` — replace a node's data source.
     *
     * `patch_shape` / `patch_offset` scope the change to a region when the source is being grown.
     */
    putDataSource(path: string, body: PutDataSourceRequest, params?: {
        patch_shape?: string;
        patch_offset?: string;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `GET /revisions/{path}` — the metadata revision history, paginated. */
    getRevisions(path: string, params?: {
        pageOffset?: number;
        pageCursor?: number;
        pageLimit?: number;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `DELETE /revisions/{path}` — drop one revision by number. Destructive. */
    deleteRevision(path: string, params: {
        number: number;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /**
     * `DELETE /stream/close/{path}` — mark an append-only node complete.
     *
     * The one write that is really a streaming operation: it is what emits the `stream-closed`
     * event webhooks subscribe to. Useful on its own today, and the seam the websocket work will
     * build against.
     */
    closeStream(path: string, options?: TiledRequestOptions): Promise<unknown>;
    /** `GET /asset/bytes/{path}` — the raw bytes of one asset backing a node. */
    getAssetBytes(path: string, params: {
        id: number;
        relative_path?: string;
    }, options?: TiledRequestOptions): Promise<ArrayBuffer>;
    /** `GET /asset/manifest/{path}` — the file list of a directory-shaped asset. */
    getAssetManifest(path: string, params: {
        id: number;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** `GET /webhooks/target/{path}` — the webhooks registered on a node. */
    listWebhooks(path: string, options?: TiledRequestOptions): Promise<WebhookResponse[]>;
    /** `POST /webhooks/target/{path}` — register a webhook for a node's events. */
    registerWebhook(path: string, body: WebhookRegistrationRequest, options?: TiledRequestOptions): Promise<WebhookResponse>;
    /** `DELETE /webhooks/{webhook_id}` — deactivate and remove a webhook. */
    deleteWebhook(webhookId: number, options?: TiledRequestOptions): Promise<unknown>;
    /** `GET /webhooks/history/{webhook_id}` — recent delivery attempts and their outcomes. */
    getWebhookHistory(webhookId: number, params?: {
        limit?: number;
    }, options?: TiledRequestOptions): Promise<DeliveryResponse[]>;
    /** The auth URLs this server advertises, or `null` when authentication is disabled. */
    private resolveAuthLinks;
    private requireAuthLink;
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
     *
     * @param url Server override. Kept as a positional parameter for compatibility; equivalent to
     * `options.baseUrl`, and wins over it when both are given.
     * @param options Transport, like every other method: a substitute client and an abort signal
     * apply to both the server-info probe and the login request itself.
     */
    loginWithUsernamePassword(username: string, password: string, url?: string, provider?: TiledAuthProvider, options?: TiledRequestOptions): Promise<TiledLoginTokens | null>;
    /** Who the current credentials identify. */
    whoami(options?: TiledRequestOptions): Promise<unknown>;
    /** Mint a new API key for the current principal. */
    createApiKey(body: {
        expires_in?: number | null;
        scopes?: string[] | null;
        note?: string | null;
    }, options?: TiledRequestOptions): Promise<unknown>;
    /** Revoke an API key by its first eight characters. */
    revokeApiKey(firstEight: string, options?: TiledRequestOptions): Promise<unknown>;
    /** Exchange the stored refresh token for a new access token, out of band of the 401 handler. */
    refreshSession(options?: TiledRequestOptions): Promise<unknown>;
    /** Revoke one session by id. */
    revokeSession(sessionId: string, options?: TiledRequestOptions): Promise<unknown>;
    /**
     * Log out, then drop every local credential.
     *
     * **Local state is always cleared**, including when the server cannot be reached or does not
     * advertise a logout endpoint at all. Someone who pressed log out is logged out of this tab
     * regardless of whether the server agreed, which is the only behaviour that is safe on a shared
     * machine.
     *
     * The `finally` therefore wraps the endpoint *discovery* as well as the request. It did not
     * originally, which meant the common failure — an unreachable server, or one with
     * authentication disabled, where `requireAuthLink` throws — left the bearer token and the
     * stored session exactly where they were while appearing to fail at logging out.
     *
     * The call still rejects on failure; it clears first. A caller who wants "log out locally and
     * do not tell me if the server was unreachable" should catch, and can rely on the credentials
     * being gone.
     */
    logout(options?: TiledRequestOptions): Promise<unknown>;
    /**
     * Send any GraphQL document to the graph endpoint and return its `data`.
     *
     * The escape hatch for selections the typed methods do not make — chiefly nested traversal,
     * e.g. a project's samples in one request:
     *
     * ```ts
     * const { entity } = await client.graphql<{ entity: { incomingLinks: { subject: { name: string } }[] } }>(
     *     `query ($id: ID!) { entity(id: $id) { incomingLinks(predicate: "schema:isPartOf") { subject { name } } } }`,
     *     { id: projectId },
     * );
     * ```
     *
     * The caller owns the result type; nothing checks it. Pass parameters as `variables` rather than
     * interpolating them into the document. The server limits nesting to depth 10.
     *
     * **Rejects whenever the response carries `errors`**, even alongside partial `data` — GraphQL
     * reports resolver failures with HTTP 200, so the status alone says nothing. The
     * {@link TiledApiError} carries `graphqlErrors`, `graphqlCode`, and the whole envelope as
     * `responseBody`. A server with no graph router answers 404, reported as such.
     *
     * An unauthenticated read does **not** fail. The server filters rather than refuses: behind an
     * access policy the caller sees empty lists, and on a server with no policy (single-user
     * `--api-key`) it sees everything, although REST would answer the same caller 401.
     */
    graphql<T = Record<string, unknown>>(document: string, variables?: TiledGraphQLVariables, options?: TiledRequestOptions): Promise<T>;
    /** One entity by id, or `null` when it does not exist or the caller may not see it. */
    getGraphEntity(id: string, options?: TiledRequestOptions): Promise<TiledGraphEntity | null>;
    /** One page of entities, filtered by type and/or bound node. The server pages at 100. */
    getGraphEntities(filters?: TiledGraphEntityFilters, options?: TiledRequestOptions): Promise<TiledGraphEntity[]>;
    /** One link by id, or `null` when it does not exist or the caller may not see it. */
    getGraphLink(id: string, options?: TiledRequestOptions): Promise<TiledGraphLink | null>;
    /**
     * One page of links, filtered by subject, predicate and/or object.
     *
     * `{ objectId }` is an entity's incoming links (a project's members); `{ subjectId }` its
     * outgoing ones.
     */
    getGraphLinks(filters?: TiledGraphLinkFilters, options?: TiledRequestOptions): Promise<TiledGraphLink[]>;
    /** The registered CURIE prefixes. */
    getGraphNamespaces(options?: TiledRequestOptions): Promise<TiledGraphNamespace[]>;
    /** Create an entity. Needs `write:metadata`. A `nodePathParts` naming no node is `NODE_NOT_FOUND`. */
    createGraphEntity(input: TiledGraphCreateEntityInput, options?: TiledRequestOptions): Promise<TiledGraphEntity>;
    /**
     * Change an entity. Omitted fields are left alone, `null` clears — see
     * {@link TiledGraphUpdateEntityInput}. Resolves `null` when there is no such entity.
     */
    updateGraphEntity(id: string, input: TiledGraphUpdateEntityInput, options?: TiledRequestOptions): Promise<TiledGraphEntity | null>;
    /** Delete an entity **and every link attached to it**. Resolves whether it existed. */
    deleteGraphEntity(id: string, options?: TiledRequestOptions): Promise<boolean>;
    /** Create a link `subject —predicate→ object`. Needs `write:metadata`. */
    createGraphLink(input: TiledGraphCreateLinkInput, options?: TiledRequestOptions): Promise<TiledGraphLink>;
    /** Change a link's predicate or access tags. Resolves `null` when there is no such link. */
    updateGraphLink(id: string, input: TiledGraphUpdateLinkInput, options?: TiledRequestOptions): Promise<TiledGraphLink | null>;
    /** Delete one link. Resolves whether it existed. */
    deleteGraphLink(id: string, options?: TiledRequestOptions): Promise<boolean>;
    /** Register or replace a CURIE prefix. Changes how every predicate and property is rendered. */
    upsertGraphNamespace(prefix: string, uri: string, options?: TiledRequestOptions): Promise<TiledGraphNamespace>;
    /** Remove a CURIE prefix. Resolves whether it existed. */
    deleteGraphNamespace(prefix: string, options?: TiledRequestOptions): Promise<boolean>;
    /** A node's path from the server root, as `nodePathParts` wants it: `['bl531', 'raw', 'x']`. */
    getGraphNodePathParts(path: string, options?: TiledRequestOptions): string[];
    /**
     * The node's canonical `uri`: its metadata URL on this server,
     * `http://host:8000/api/v1/metadata/bl531/raw/x`. What `bindGraphEntity` stores, and what to
     * pass to `updateGraphEntity(id, { uri })` to backfill an entity bound without one.
     */
    getGraphNodeUri(path: string, options?: TiledRequestOptions): string;
    /**
     * Create an entity bound to the catalog node at `path`, with `nodePathParts` and `uri` set
     * together so the node can be found again later (see {@link graphEntityNodePath}). `name`
     * defaults to the node's key. Fails with `NODE_NOT_FOUND` when no node is at `path`.
     */
    bindGraphEntity(path: string, input: TiledGraphBindEntityInput, options?: TiledRequestOptions): Promise<TiledGraphEntity>;
    /** One page of the entities bound to the catalog node at `path`. */
    getGraphNodeEntities(path: string, filters?: TiledGraphNodeEntityFilters, options?: TiledRequestOptions): Promise<TiledGraphEntity[]>;
    /**
     * The catalog node an entity's `uri` points at, or `null` when it has no `uri` or it is not a
     * Tiled metadata URL. The path is from the server root, so read it with `pathMode: 'absolute'`:
     *
     * ```ts
     * const located = client.graphEntityNodePath(entity);
     * if (located) await client.getMetadata(located.path, { pathMode: 'absolute' });
     * ```
     *
     * `sameServer` compares the URL with this client's base URL. A mismatch usually means the
     * server moved host since the entity was written; the path after `/api/v1/metadata/` is then
     * still the right one to try.
     */
    graphEntityNodePath(entity: Pick<TiledGraphEntity, 'uri'>, options?: TiledRequestOptions): TiledGraphEntityNodePath | null;
    /** The base URL to hand a zarr v2 reader for a node. */
    getZarrV2Url(path: string, options?: TiledRequestOptions): string;
    /** The base URL to hand a zarr v3 reader for a node. */
    getZarrV3Url(path: string, options?: TiledRequestOptions): string;
}
export {};
//# sourceMappingURL=TiledApiClient.d.ts.map