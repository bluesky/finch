import { getDefaultTiledApiClient } from './defaultClient';
import type { TiledFormatName } from './formats';
import type { TiledBinaryBody } from '../types/common';
import type {
    DeliveryResponse,
    GetDistinctResponse,
    PatchMetadataRequest,
    PatchMetadataResponse,
    PostMetadataRequest,
    PostMetadataResponse,
    PutDataSourceRequest,
    PutMetadataRequest,
    PutMetadataResponse,
    StructureFamily,
    WebhookRegistrationRequest,
    WebhookResponse,
} from '../types/generatedAliases';
import type { TiledAuthProvider, TiledInfoResponse } from '../types/info';
import type { TiledSearchItem, TiledSearchResult, TiledTableRow } from '../types/nodes';
import type { TiledLoginTokens, TiledRequestOptions } from '../types/requestOptions';
import type { TiledDistinctConfig, TiledSearchConfig } from '../types/searchFilters';
import type {
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
    TiledTableEndpoint,
    TiledTableJSONOptions,
    TiledTableJSONSequenceOptions,
    TiledTableOptionsMap,
    TiledTableRequestOptions,
    TiledTableReturnMap,
    TiledTableReturnType,
} from '../types/dataOptions';
import type { TiledStructures } from '../types/structures';

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

// #region info

export function getTiledServerInfo(
    options?: TiledRequestOptions,
): Promise<TiledInfoResponse | null> {
    return getDefaultTiledApiClient().getServerInfo(options);
}

/** Like {@link getTiledServerInfo}, but rejects instead of resolving `null`. */
export function getTiledAbout(options?: TiledRequestOptions): Promise<TiledInfoResponse> {
    return getDefaultTiledApiClient().getAbout(options);
}

export function getTiledHealth(options?: TiledRequestOptions): Promise<unknown> {
    return getDefaultTiledApiClient().getHealth(options);
}

export function getTiledUiSettings(options?: TiledRequestOptions): Promise<unknown> {
    return getDefaultTiledApiClient().getUiSettings(options);
}

export function getTiledMetrics(options?: TiledRequestOptions): Promise<unknown> {
    return getDefaultTiledApiClient().getMetrics(options);
}

// #endregion

// #region search

export function getTiledSearch(
    searchPath: string,
    config?: TiledSearchConfig,
    options?: TiledRequestOptions,
): Promise<TiledSearchResult> {
    return getDefaultTiledApiClient().getSearch(searchPath, config, options);
}

export function getTiledDistinct(
    searchPath: string,
    config?: TiledDistinctConfig,
    options?: TiledRequestOptions,
): Promise<GetDistinctResponse> {
    return getDefaultTiledApiClient().getDistinct(searchPath, config, options);
}

/**
 * The four filter conveniences the package shipped, rebuilt on {@link getTiledSearch}.
 *
 * Each just assembles the filter — there is one search endpoint, and these exist so the common
 * cases read as what they are at the call site.
 */
export function getTiledSearchBySpecs(
    searchPath: string,
    filter: { include: string[]; exclude: string[] },
    searchOptions?: TiledSearchConfig['searchOptions'],
    options?: TiledRequestOptions,
): Promise<TiledSearchResult> {
    return getTiledSearch(searchPath, { searchFilters: { specs: filter }, searchOptions }, options);
}

export function getTiledSearchByFullText(
    searchPath: string,
    filter: { text: string },
    searchOptions?: TiledSearchConfig['searchOptions'],
    options?: TiledRequestOptions,
): Promise<TiledSearchResult> {
    return getTiledSearch(
        searchPath,
        { searchFilters: { fulltext: filter }, searchOptions },
        options,
    );
}

export function getTiledSearchByMetadataEquals(
    searchPath: string,
    filter: { key: string; value: string | number | boolean | null },
    searchOptions?: TiledSearchConfig['searchOptions'],
    options?: TiledRequestOptions,
): Promise<TiledSearchResult> {
    return getTiledSearch(searchPath, { searchFilters: { eq: filter }, searchOptions }, options);
}

export function getTiledSearchByStructureFamily(
    searchPath: string,
    filter: { value: StructureFamily },
    searchOptions?: TiledSearchConfig['searchOptions'],
    options?: TiledRequestOptions,
): Promise<TiledSearchResult> {
    return getTiledSearch(
        searchPath,
        { searchFilters: { structureFamily: filter }, searchOptions },
        options,
    );
}

// #endregion

// #region metadata

export function getTiledMetadata<S extends TiledStructures = TiledStructures>(
    path: string,
    options?: TiledRequestOptions,
): Promise<TiledSearchItem<S>> {
    return getDefaultTiledApiClient().getMetadata<S>(path, options);
}

export function createTiledNode(
    path: string,
    body: PostMetadataRequest,
    options?: TiledRequestOptions,
): Promise<PostMetadataResponse> {
    return getDefaultTiledApiClient().createNode(path, body, options);
}

export function updateTiledMetadata(
    path: string,
    body: PutMetadataRequest,
    params?: { drop_revision?: boolean },
    options?: TiledRequestOptions,
): Promise<PutMetadataResponse> {
    return getDefaultTiledApiClient().updateMetadata(path, body, params, options);
}

export function patchTiledMetadata(
    path: string,
    body: PatchMetadataRequest,
    params?: { drop_revision?: boolean },
    options?: TiledRequestOptions,
): Promise<PatchMetadataResponse> {
    return getDefaultTiledApiClient().patchMetadata(path, body, params, options);
}

export function patchTiledMetadataMerge(
    path: string,
    body: Parameters<ReturnType<typeof getDefaultTiledApiClient>['patchMetadataMerge']>[1],
    params?: { drop_revision?: boolean },
    options?: TiledRequestOptions,
): Promise<PatchMetadataResponse> {
    return getDefaultTiledApiClient().patchMetadataMerge(path, body, params, options);
}

export function patchTiledMetadataJsonPatch(
    path: string,
    body: Parameters<ReturnType<typeof getDefaultTiledApiClient>['patchMetadataJsonPatch']>[1],
    params?: { drop_revision?: boolean },
    options?: TiledRequestOptions,
): Promise<PatchMetadataResponse> {
    return getDefaultTiledApiClient().patchMetadataJsonPatch(path, body, params, options);
}

export function deleteTiledNode(
    path: string,
    params?: { recursive?: boolean; external_only?: boolean },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().deleteNode(path, params, options);
}

// #endregion

// #region arrays

export function getTiledArrayAs<T extends TiledArrayReturnType>(
    arrayPath: string,
    type: T,
    options?: TiledArrayOptionsMap[T],
): Promise<TiledArrayReturnMap[T]> {
    return getDefaultTiledApiClient().getArrayAs(arrayPath, type, options);
}

export function getTiledArrayAsJSON<T = number[][]>(
    arrayPath: string,
    options?: TiledArrayJSONOptions,
): Promise<T> {
    return getDefaultTiledApiClient().getArrayAsJSON<T>(arrayPath, options);
}

export function getTiledArrayAsPng(
    arrayPath: string,
    options?: TiledArrayPngOptions,
): Promise<Blob> {
    return getDefaultTiledApiClient().getArrayAsPng(arrayPath, options);
}

export function getTiledArrayAsBuffer(
    arrayPath: string,
    options?: TiledArrayBufferOptions,
): Promise<ArrayBuffer> {
    return getDefaultTiledApiClient().getArrayAsBuffer(arrayPath, options);
}

export function getTiledArrayAsImagePath(
    arrayPath: string,
    options?: TiledArrayImagePathOptions,
): string {
    return getDefaultTiledApiClient().getArrayAsImagePath(arrayPath, options);
}

export function getTiledArrayBlock(
    arrayPath: string,
    params: { block: number[]; slice?: string; expected_shape?: string; format?: string },
    options?: TiledRequestOptions,
): Promise<ArrayBuffer> {
    return getDefaultTiledApiClient().getArrayBlock(arrayPath, params, options);
}

export function putTiledArrayFull(
    arrayPath: string,
    data: TiledBinaryBody | number[][],
    params?: { persist?: boolean },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().putArrayFull(arrayPath, data, params, options);
}

export function putTiledArrayBlock(
    arrayPath: string,
    data: TiledBinaryBody | number[][],
    params: { block: number[]; persist?: boolean },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().putArrayBlock(arrayPath, data, params, options);
}

export function patchTiledArrayFull(
    arrayPath: string,
    data: TiledBinaryBody | number[][],
    params: { offset: number[]; shape: number[]; extend?: boolean; persist?: boolean },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().patchArrayFull(arrayPath, data, params, options);
}

// #endregion

// #region ragged

export function getTiledRaggedFull(
    path: string,
    options?: TiledRaggedRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().getRaggedFull(path, options);
}

export function putTiledRaggedFull(
    path: string,
    data: TiledBinaryBody | unknown[],
    params?: { persist?: boolean },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().putRaggedFull(path, data, params, options);
}

export function putTiledRaggedBlock(
    path: string,
    data: TiledBinaryBody | unknown[],
    params: { block: number[]; persist?: boolean },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().putRaggedBlock(path, data, params, options);
}

export function patchTiledRaggedFull(
    path: string,
    data: TiledBinaryBody | unknown[],
    params: { offset: number[]; shape: number[]; extend?: boolean; persist?: boolean },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().patchRaggedFull(path, data, params, options);
}

// #endregion

// #region tables

export function getTiledTableAs<T extends TiledTableReturnType>(
    tablePath: string,
    type?: T,
    endpoint?: TiledTableEndpoint,
    options?: TiledTableOptionsMap[T],
): Promise<TiledTableReturnMap[T]> {
    return getDefaultTiledApiClient().getTableAs(tablePath, type, endpoint, options);
}

export function getTiledTablePartitionAsJSON(
    tablePath: string,
    options?: TiledTableJSONOptions,
): Promise<TiledTableReturnMap['JSON']> {
    return getDefaultTiledApiClient().getTablePartitionAsJSON(tablePath, options);
}

export function getTiledTablePartitionAsJSONSequence(
    tablePath: string,
    options?: TiledTableJSONSequenceOptions,
): Promise<TiledTableRow[]> {
    return getDefaultTiledApiClient().getTablePartitionAsJSONSequence(tablePath, options);
}

export function getTiledTableFullAsJSON(
    tablePath: string,
    options?: TiledTableJSONOptions,
): Promise<TiledTableReturnMap['JSON']> {
    return getDefaultTiledApiClient().getTableFullAsJSON(tablePath, options);
}

export function getTiledTableFullAsJSONSequence(
    tablePath: string,
    options?: TiledTableJSONSequenceOptions,
): Promise<TiledTableRow[]> {
    return getDefaultTiledApiClient().getTableFullAsJSONSequence(tablePath, options);
}

export function getTiledTableFullAs(
    tablePath: string,
    format: TiledFormatName | string,
    options?: TiledTableRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().getTableFullAs(tablePath, format, options);
}

export function postTiledTableFull(
    tablePath: string,
    columns: string[] | null,
    params?: { format?: string; filename?: string },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().postTableFull(tablePath, columns, params, options);
}

export function postTiledTablePartition(
    tablePath: string,
    columns: string[] | null,
    params: { partition: number; format?: string; filename?: string },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().postTablePartition(tablePath, columns, params, options);
}

export function putTiledTablePartition(
    tablePath: string,
    data: TiledBinaryBody,
    params: { partition: number; mimetype: string },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().putTablePartition(tablePath, data, params, options);
}

export function patchTiledTablePartition(
    tablePath: string,
    data: TiledBinaryBody,
    params: { partition: number; mimetype: string },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().patchTablePartition(tablePath, data, params, options);
}

export function putTiledTableFull(
    tablePath: string,
    data: TiledBinaryBody,
    params: { mimetype: string },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().putTableFull(tablePath, data, params, options);
}

// #endregion

// #region containers, nodes, awkward

export function getTiledContainerFull(
    path: string,
    options?: TiledNodeRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().getContainerFull(path, options);
}

export function postTiledContainerFull(
    path: string,
    fields: string[] | null,
    params?: { format?: string; filename?: string },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().postContainerFull(path, fields, params, options);
}

export function getTiledNodeFull(
    path: string,
    options?: TiledNodeRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().getNodeFull(path, options);
}

export function putTiledNodeFull(
    path: string,
    data: TiledBinaryBody,
    params: { mimetype: string },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().putNodeFull(path, data, params, options);
}

export function getTiledAwkwardFull(
    path: string,
    options?: TiledAwkwardRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().getAwkwardFull(path, options);
}

export function getTiledAwkwardBuffers(
    path: string,
    options?: TiledAwkwardRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().getAwkwardBuffers(path, options);
}

export function postTiledAwkwardBuffers(
    path: string,
    formKeys: string[],
    params?: { format?: string; filename?: string },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().postAwkwardBuffers(path, formKeys, params, options);
}

export function putTiledAwkwardFull(
    path: string,
    body: { form: unknown; length: number; container: Record<string, unknown> },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().putAwkwardFull(path, body, options);
}

// #endregion

// #region registration, data sources, revisions, streams, assets

export function postTiledRegister(
    path: string,
    body: PostMetadataRequest,
    options?: TiledRequestOptions,
): Promise<PostMetadataResponse> {
    return getDefaultTiledApiClient().postRegister(path, body, options);
}

export function putTiledDataSource(
    path: string,
    body: PutDataSourceRequest,
    params?: { patch_shape?: string; patch_offset?: string },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().putDataSource(path, body, params, options);
}

export function getTiledRevisions(
    path: string,
    params?: { pageOffset?: number; pageCursor?: number; pageLimit?: number },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().getRevisions(path, params, options);
}

export function deleteTiledRevision(
    path: string,
    params: { number: number },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().deleteRevision(path, params, options);
}

export function closeTiledStream(path: string, options?: TiledRequestOptions): Promise<unknown> {
    return getDefaultTiledApiClient().closeStream(path, options);
}

export function getTiledAssetBytes(
    path: string,
    params: { id: number; relative_path?: string },
    options?: TiledRequestOptions,
): Promise<ArrayBuffer> {
    return getDefaultTiledApiClient().getAssetBytes(path, params, options);
}

export function getTiledAssetManifest(
    path: string,
    params: { id: number },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().getAssetManifest(path, params, options);
}

// #endregion

// #region webhooks

export function listTiledWebhooks(
    path: string,
    options?: TiledRequestOptions,
): Promise<WebhookResponse[]> {
    return getDefaultTiledApiClient().listWebhooks(path, options);
}

export function registerTiledWebhook(
    path: string,
    body: WebhookRegistrationRequest,
    options?: TiledRequestOptions,
): Promise<WebhookResponse> {
    return getDefaultTiledApiClient().registerWebhook(path, body, options);
}

export function deleteTiledWebhook(
    webhookId: number,
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().deleteWebhook(webhookId, options);
}

export function getTiledWebhookHistory(
    webhookId: number,
    params?: { limit?: number },
    options?: TiledRequestOptions,
): Promise<DeliveryResponse[]> {
    return getDefaultTiledApiClient().getWebhookHistory(webhookId, params, options);
}

// #endregion

// #region auth

/** Log in against the app-wide client. Resolves `null` on a failed login rather than rejecting. */
export function loginWithDefaultTiledClient(
    username: string,
    password: string,
    url?: string,
    provider?: TiledAuthProvider,
): Promise<TiledLoginTokens | null> {
    return getDefaultTiledApiClient().loginWithUsernamePassword(username, password, url, provider);
}

export function tiledWhoami(options?: TiledRequestOptions): Promise<unknown> {
    return getDefaultTiledApiClient().whoami(options);
}

export function createTiledApiKey(
    body: { expires_in?: number | null; scopes?: string[] | null; note?: string | null },
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().createApiKey(body, options);
}

export function revokeTiledApiKey(
    firstEight: string,
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().revokeApiKey(firstEight, options);
}

export function refreshTiledSession(options?: TiledRequestOptions): Promise<unknown> {
    return getDefaultTiledApiClient().refreshSession(options);
}

export function revokeTiledSession(
    sessionId: string,
    options?: TiledRequestOptions,
): Promise<unknown> {
    return getDefaultTiledApiClient().revokeSession(sessionId, options);
}

export function tiledLogout(options?: TiledRequestOptions): Promise<unknown> {
    return getDefaultTiledApiClient().logout(options);
}

// #endregion

// #region zarr

export function getTiledZarrV2Url(path: string, options?: TiledRequestOptions): string {
    return getDefaultTiledApiClient().getZarrV2Url(path, options);
}

export function getTiledZarrV3Url(path: string, options?: TiledRequestOptions): string {
    return getDefaultTiledApiClient().getZarrV3Url(path, options);
}

// #endregion
