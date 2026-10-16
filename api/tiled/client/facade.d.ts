import { getDefaultTiledApiClient } from './defaultClient';
import { TiledFormatName } from './formats';
import { TiledBinaryBody } from '../types/common';
import { DeliveryResponse, GetDistinctResponse, PatchMetadataRequest, PatchMetadataResponse, PostMetadataRequest, PostMetadataResponse, PutDataSourceRequest, PutMetadataRequest, PutMetadataResponse, StructureFamily, WebhookRegistrationRequest, WebhookResponse } from '../types/generatedAliases';
import { TiledGraphBindEntityInput, TiledGraphCreateEntityInput, TiledGraphCreateLinkInput, TiledGraphEntity, TiledGraphEntityFilters, TiledGraphEntityNodePath, TiledGraphNodeEntityFilters, TiledGraphLink, TiledGraphLinkFilters, TiledGraphNamespace, TiledGraphQLVariables, TiledGraphUpdateEntityInput, TiledGraphUpdateLinkInput } from '../types/graph';
import { TiledAuthProvider, TiledInfoResponse } from '../types/info';
import { TiledSearchItem, TiledSearchResult, TiledTableRow } from '../types/nodes';
import { TiledLoginTokens, TiledRequestOptions } from '../types/requestOptions';
import { TiledDistinctConfig, TiledSearchConfig } from '../types/searchFilters';
import { TiledArrayBufferOptions, TiledArrayImagePathOptions, TiledArrayJSONOptions, TiledArrayOptionsMap, TiledArrayPngOptions, TiledArrayReturnMap, TiledArrayReturnType, TiledAwkwardRequestOptions, TiledNodeRequestOptions, TiledRaggedRequestOptions, TiledTableEndpoint, TiledTableJSONOptions, TiledTableJSONSequenceOptions, TiledTableOptionsMap, TiledTableRequestOptions, TiledTableReturnMap, TiledTableReturnType } from '../types/dataOptions';
import { TiledStructures } from '../types/structures';
/**
 * One free function per operation, issued against the app-wide client.
 *
 * These are the right tool outside a React component — a `useEffect`, an event handler, a plain
 * module function. **Inside a component prefer the hooks**: these are hard-wired to the default
 * client, so they ignore `TiledApiProvider` and take no part in the query cache.
 *
 * The seventeen names `@blueskyproject/tiled` exported are all here with their original signatures,
 * so code moving over from the package keeps working unchanged.
 */
export declare function getTiledServerInfo(options?: TiledRequestOptions): Promise<TiledInfoResponse | null>;
/** Like {@link getTiledServerInfo}, but rejects instead of resolving `null`. */
export declare function getTiledAbout(options?: TiledRequestOptions): Promise<TiledInfoResponse>;
export declare function getTiledHealth(options?: TiledRequestOptions): Promise<unknown>;
export declare function getTiledUiSettings(options?: TiledRequestOptions): Promise<unknown>;
export declare function getTiledMetrics(options?: TiledRequestOptions): Promise<unknown>;
export declare function getTiledSearch(searchPath: string, config?: TiledSearchConfig, options?: TiledRequestOptions): Promise<TiledSearchResult>;
export declare function getTiledDistinct(searchPath: string, config?: TiledDistinctConfig, options?: TiledRequestOptions): Promise<GetDistinctResponse>;
/**
 * The four filter conveniences the package shipped, rebuilt on {@link getTiledSearch}.
 *
 * Each just assembles the filter — there is one search endpoint, and these exist so the common
 * cases read as what they are at the call site.
 */
export declare function getTiledSearchBySpecs(searchPath: string, filter: {
    include: string[];
    exclude: string[];
}, searchOptions?: TiledSearchConfig['searchOptions'], options?: TiledRequestOptions): Promise<TiledSearchResult>;
export declare function getTiledSearchByFullText(searchPath: string, filter: {
    text: string;
}, searchOptions?: TiledSearchConfig['searchOptions'], options?: TiledRequestOptions): Promise<TiledSearchResult>;
export declare function getTiledSearchByMetadataEquals(searchPath: string, filter: {
    key: string;
    value: string | number | boolean | null;
}, searchOptions?: TiledSearchConfig['searchOptions'], options?: TiledRequestOptions): Promise<TiledSearchResult>;
export declare function getTiledSearchByStructureFamily(searchPath: string, filter: {
    value: StructureFamily;
}, searchOptions?: TiledSearchConfig['searchOptions'], options?: TiledRequestOptions): Promise<TiledSearchResult>;
export declare function getTiledMetadata<S extends TiledStructures = TiledStructures>(path: string, options?: TiledRequestOptions): Promise<TiledSearchItem<S>>;
export declare function createTiledNode(path: string, body: PostMetadataRequest, options?: TiledRequestOptions): Promise<PostMetadataResponse>;
export declare function updateTiledMetadata(path: string, body: PutMetadataRequest, params?: {
    drop_revision?: boolean;
}, options?: TiledRequestOptions): Promise<PutMetadataResponse>;
export declare function patchTiledMetadata(path: string, body: PatchMetadataRequest, params?: {
    drop_revision?: boolean;
}, options?: TiledRequestOptions): Promise<PatchMetadataResponse>;
export declare function patchTiledMetadataMerge(path: string, body: Parameters<ReturnType<typeof getDefaultTiledApiClient>['patchMetadataMerge']>[1], params?: {
    drop_revision?: boolean;
}, options?: TiledRequestOptions): Promise<PatchMetadataResponse>;
export declare function patchTiledMetadataJsonPatch(path: string, body: Parameters<ReturnType<typeof getDefaultTiledApiClient>['patchMetadataJsonPatch']>[1], params?: {
    drop_revision?: boolean;
}, options?: TiledRequestOptions): Promise<PatchMetadataResponse>;
export declare function deleteTiledNode(path: string, params?: {
    recursive?: boolean;
    external_only?: boolean;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function getTiledArrayAs<T extends TiledArrayReturnType>(arrayPath: string, type: T, options?: TiledArrayOptionsMap[T]): Promise<TiledArrayReturnMap[T]>;
export declare function getTiledArrayAsJSON<T = number[][]>(arrayPath: string, options?: TiledArrayJSONOptions): Promise<T>;
export declare function getTiledArrayAsPng(arrayPath: string, options?: TiledArrayPngOptions): Promise<Blob>;
export declare function getTiledArrayAsBuffer(arrayPath: string, options?: TiledArrayBufferOptions): Promise<ArrayBuffer>;
export declare function getTiledArrayAsImagePath(arrayPath: string, options?: TiledArrayImagePathOptions): string;
export declare function getTiledArrayBlock(arrayPath: string, params: {
    block: number[];
    slice?: string;
    expected_shape?: string;
    format?: string;
}, options?: TiledRequestOptions): Promise<ArrayBuffer>;
export declare function putTiledArrayFull(arrayPath: string, data: TiledBinaryBody | number[][], params?: {
    persist?: boolean;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function putTiledArrayBlock(arrayPath: string, data: TiledBinaryBody | number[][], params: {
    block: number[];
    persist?: boolean;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function patchTiledArrayFull(arrayPath: string, data: TiledBinaryBody | number[][], params: {
    offset: number[];
    shape: number[];
    extend?: boolean;
    persist?: boolean;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function getTiledRaggedFull(path: string, options?: TiledRaggedRequestOptions): Promise<unknown>;
export declare function putTiledRaggedFull(path: string, data: TiledBinaryBody | unknown[], params?: {
    persist?: boolean;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function putTiledRaggedBlock(path: string, data: TiledBinaryBody | unknown[], params: {
    block: number[];
    persist?: boolean;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function patchTiledRaggedFull(path: string, data: TiledBinaryBody | unknown[], params: {
    offset: number[];
    shape: number[];
    extend?: boolean;
    persist?: boolean;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function getTiledTableAs<T extends TiledTableReturnType>(tablePath: string, type?: T, endpoint?: TiledTableEndpoint, options?: TiledTableOptionsMap[T]): Promise<TiledTableReturnMap[T]>;
export declare function getTiledTablePartitionAsJSON(tablePath: string, options?: TiledTableJSONOptions): Promise<TiledTableReturnMap['JSON']>;
export declare function getTiledTablePartitionAsJSONSequence(tablePath: string, options?: TiledTableJSONSequenceOptions): Promise<TiledTableRow[]>;
export declare function getTiledTableFullAsJSON(tablePath: string, options?: TiledTableJSONOptions): Promise<TiledTableReturnMap['JSON']>;
export declare function getTiledTableFullAsJSONSequence(tablePath: string, options?: TiledTableJSONSequenceOptions): Promise<TiledTableRow[]>;
export declare function getTiledTableFullAs(tablePath: string, format: TiledFormatName | string, options?: TiledTableRequestOptions): Promise<unknown>;
export declare function postTiledTableFull(tablePath: string, columns: string[] | null, params?: {
    format?: string;
    filename?: string;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function postTiledTablePartition(tablePath: string, columns: string[] | null, params: {
    partition: number;
    format?: string;
    filename?: string;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function putTiledTablePartition(tablePath: string, data: TiledBinaryBody, params: {
    partition: number;
    mimetype: string;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function patchTiledTablePartition(tablePath: string, data: TiledBinaryBody, params: {
    partition: number;
    mimetype: string;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function putTiledTableFull(tablePath: string, data: TiledBinaryBody, params: {
    mimetype: string;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function getTiledContainerFull(path: string, options?: TiledNodeRequestOptions): Promise<unknown>;
export declare function postTiledContainerFull(path: string, fields: string[] | null, params?: {
    format?: string;
    filename?: string;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function getTiledNodeFull(path: string, options?: TiledNodeRequestOptions): Promise<unknown>;
export declare function putTiledNodeFull(path: string, data: TiledBinaryBody, params: {
    mimetype: string;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function getTiledAwkwardFull(path: string, options?: TiledAwkwardRequestOptions): Promise<unknown>;
export declare function getTiledAwkwardBuffers(path: string, options?: TiledAwkwardRequestOptions): Promise<unknown>;
export declare function postTiledAwkwardBuffers(path: string, formKeys: string[], params?: {
    format?: string;
    filename?: string;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function putTiledAwkwardFull(path: string, body: {
    form: unknown;
    length: number;
    container: Record<string, unknown>;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function postTiledRegister(path: string, body: PostMetadataRequest, options?: TiledRequestOptions): Promise<PostMetadataResponse>;
export declare function putTiledDataSource(path: string, body: PutDataSourceRequest, params?: {
    patch_shape?: string;
    patch_offset?: string;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function getTiledRevisions(path: string, params?: {
    pageOffset?: number;
    pageCursor?: number;
    pageLimit?: number;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function deleteTiledRevision(path: string, params: {
    number: number;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function closeTiledStream(path: string, options?: TiledRequestOptions): Promise<unknown>;
export declare function getTiledAssetBytes(path: string, params: {
    id: number;
    relative_path?: string;
}, options?: TiledRequestOptions): Promise<ArrayBuffer>;
export declare function getTiledAssetManifest(path: string, params: {
    id: number;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function listTiledWebhooks(path: string, options?: TiledRequestOptions): Promise<WebhookResponse[]>;
export declare function registerTiledWebhook(path: string, body: WebhookRegistrationRequest, options?: TiledRequestOptions): Promise<WebhookResponse>;
export declare function deleteTiledWebhook(webhookId: number, options?: TiledRequestOptions): Promise<unknown>;
export declare function getTiledWebhookHistory(webhookId: number, params?: {
    limit?: number;
}, options?: TiledRequestOptions): Promise<DeliveryResponse[]>;
/** Log in against the app-wide client. Resolves `null` on a failed login rather than rejecting. */
export declare function loginWithDefaultTiledClient(username: string, password: string, url?: string, provider?: TiledAuthProvider, options?: TiledRequestOptions): Promise<TiledLoginTokens | null>;
export declare function tiledWhoami(options?: TiledRequestOptions): Promise<unknown>;
export declare function createTiledApiKey(body: {
    expires_in?: number | null;
    scopes?: string[] | null;
    note?: string | null;
}, options?: TiledRequestOptions): Promise<unknown>;
export declare function revokeTiledApiKey(firstEight: string, options?: TiledRequestOptions): Promise<unknown>;
export declare function refreshTiledSession(options?: TiledRequestOptions): Promise<unknown>;
export declare function revokeTiledSession(sessionId: string, options?: TiledRequestOptions): Promise<unknown>;
export declare function tiledLogout(options?: TiledRequestOptions): Promise<unknown>;
/** Any GraphQL document against the graph endpoint; see `TiledApiClient.graphql`. */
export declare function tiledGraphQL<T = Record<string, unknown>>(document: string, variables?: TiledGraphQLVariables, options?: TiledRequestOptions): Promise<T>;
export declare function getTiledGraphEntity(id: string, options?: TiledRequestOptions): Promise<TiledGraphEntity | null>;
export declare function getTiledGraphEntities(filters?: TiledGraphEntityFilters, options?: TiledRequestOptions): Promise<TiledGraphEntity[]>;
export declare function getTiledGraphLink(id: string, options?: TiledRequestOptions): Promise<TiledGraphLink | null>;
export declare function getTiledGraphLinks(filters?: TiledGraphLinkFilters, options?: TiledRequestOptions): Promise<TiledGraphLink[]>;
export declare function getTiledGraphNamespaces(options?: TiledRequestOptions): Promise<TiledGraphNamespace[]>;
export declare function createTiledGraphEntity(input: TiledGraphCreateEntityInput, options?: TiledRequestOptions): Promise<TiledGraphEntity>;
export declare function updateTiledGraphEntity(id: string, input: TiledGraphUpdateEntityInput, options?: TiledRequestOptions): Promise<TiledGraphEntity | null>;
export declare function deleteTiledGraphEntity(id: string, options?: TiledRequestOptions): Promise<boolean>;
export declare function createTiledGraphLink(input: TiledGraphCreateLinkInput, options?: TiledRequestOptions): Promise<TiledGraphLink>;
export declare function updateTiledGraphLink(id: string, input: TiledGraphUpdateLinkInput, options?: TiledRequestOptions): Promise<TiledGraphLink | null>;
export declare function deleteTiledGraphLink(id: string, options?: TiledRequestOptions): Promise<boolean>;
export declare function upsertTiledGraphNamespace(prefix: string, uri: string, options?: TiledRequestOptions): Promise<TiledGraphNamespace>;
export declare function deleteTiledGraphNamespace(prefix: string, options?: TiledRequestOptions): Promise<boolean>;
/** Create an entity bound to the node at `path`, with `nodePathParts` and `uri` set together. */
export declare function bindTiledGraphEntity(path: string, input: TiledGraphBindEntityInput, options?: TiledRequestOptions): Promise<TiledGraphEntity>;
/** A page of the entities bound to the node at `path`. */
export declare function getTiledGraphNodeEntities(path: string, filters?: TiledGraphNodeEntityFilters, options?: TiledRequestOptions): Promise<TiledGraphEntity[]>;
/** The catalog node an entity's `uri` points at, from the server root; `null` when it has none. */
export declare function tiledGraphEntityNodePath(entity: Pick<TiledGraphEntity, 'uri'>, options?: TiledRequestOptions): TiledGraphEntityNodePath | null;
/** The canonical `uri` for the node at `path`, e.g. to backfill an entity bound without one. */
export declare function getTiledGraphNodeUri(path: string, options?: TiledRequestOptions): string;
export declare function getTiledZarrV2Url(path: string, options?: TiledRequestOptions): string;
export declare function getTiledZarrV3Url(path: string, options?: TiledRequestOptions): string;
//# sourceMappingURL=facade.d.ts.map