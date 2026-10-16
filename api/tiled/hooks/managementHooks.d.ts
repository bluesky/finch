import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { TiledRequestOptions } from '../types/common';
import { DeliveryResponse, PostMetadataRequest, PostMetadataResponse, PutDataSourceRequest, WebhookRegistrationRequest, WebhookResponse } from '../types/generatedAliases';
import { TiledQueryKeyFor } from './queryKeys';
import { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
/**
 * The management surface: registration, data sources, revisions, assets, webhooks and streams.
 *
 * These are the endpoints that administer a Tiled node rather than read or write its data. All of
 * them are new — the package exposed none of this.
 */
/** What `useTiledRegisterMutation().mutate` takes. */
export interface TiledRegisterVariables {
    /** The container to register **inside**. The new node's key goes in `body.id`. */
    parentPath: string;
    body: PostMetadataRequest;
}
/**
 * Register data that already exists on disk — `POST /api/v1/register/{path}`.
 *
 * The body is the same shape as a node creation, but the data sources point at files the server can
 * already see rather than at bytes about to be uploaded. This is how a beamline makes an acquisition
 * visible in Tiled without copying it.
 */
export declare function useTiledRegisterMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<PostMetadataResponse, TiledRegisterVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<PostMetadataResponse, TiledHookError, TiledRegisterVariables, TContext>;
/** What `useTiledPutDataSourceMutation().mutate` takes. */
export interface TiledPutDataSourceVariables {
    path: string;
    body: PutDataSourceRequest;
    /** Scope the change to a region, when the source is being grown rather than replaced. */
    patch_shape?: string;
    patch_offset?: string;
}
/** Replace a node's data source — `PUT /api/v1/data_source/{path}`. */
export declare function useTiledPutDataSourceMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, TiledPutDataSourceVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, TiledPutDataSourceVariables, TContext>;
/** Pagination for the revision history. Offset and cursor are alternatives, not a pair. */
export interface TiledRevisionsParams {
    pageOffset?: number;
    pageCursor?: number;
    pageLimit?: number;
}
/**
 * A node's metadata revision history — `GET /api/v1/revisions/{path}`.
 *
 * Tiled records a revision on every metadata write unless `drop_revision` said otherwise, so this is
 * the audit trail behind `useTiledUpdateMetadataMutation` and friends.
 *
 * @param path **Required.** Idle while empty.
 * @param params Pagination.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export declare function useTiledRevisionsQuery<TData = unknown>(path: string, params?: TiledRevisionsParams, queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'revisions'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/** What `useTiledDeleteRevisionMutation().mutate` takes. */
export interface TiledDeleteRevisionVariables {
    path: string;
    /** The revision number to drop. */
    number: number;
}
/** Drop one revision — `DELETE /api/v1/revisions/{path}`. Destructive and not undoable. */
export declare function useTiledDeleteRevisionMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, TiledDeleteRevisionVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, TiledDeleteRevisionVariables, TContext>;
/** Which asset to read, and optionally which file within a directory-shaped one. */
export interface TiledAssetParams {
    /** The asset's numeric id, from the node's `data_sources[].assets[].id`. */
    id: number;
    /** A file inside a directory asset. Omit for a single-file asset. */
    relative_path?: string;
}
/**
 * The raw bytes of one asset backing a node — `GET /api/v1/asset/bytes/{path}`.
 *
 * Reads the file as stored, bypassing Tiled's structure layer entirely. Use it to download an
 * original TIFF or HDF5 rather than a re-encoded view of it.
 *
 * @param path **Required.** The node the asset belongs to. Idle while empty.
 * @param params **Required.** `id` identifies the asset. Idle while undefined.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export declare function useTiledAssetBytesQuery<TData = ArrayBuffer>(path: string, params: TiledAssetParams | undefined, queryOptions?: FinchQueryOptions<ArrayBuffer, TData, TiledQueryKeyFor<'asset'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/** The file list of a directory-shaped asset — `GET /api/v1/asset/manifest/{path}`. */
export declare function useTiledAssetManifestQuery<TData = unknown>(path: string, params: {
    id: number;
} | undefined, queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'asset'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * The webhooks registered on a node — `GET /api/v1/webhooks/target/{path}`.
 *
 * Webhooks are Tiled's push mechanism today, and the events they carry —
 * `container-child-created`, `container-child-metadata-updated`, `stream-closed` — are the same
 * vocabulary the websocket transport will use when it lands.
 */
export declare function useTiledWebhooksQuery<TData = WebhookResponse[]>(path: string, queryOptions?: FinchQueryOptions<WebhookResponse[], TData, TiledQueryKeyFor<'webhooks'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * Recent delivery attempts for one webhook — `GET /api/v1/webhooks/history/{webhook_id}`.
 *
 * @param webhookId **Required.** Idle while undefined.
 * @param params `limit` caps how many attempts come back.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export declare function useTiledWebhookHistoryQuery<TData = DeliveryResponse[]>(webhookId: number | undefined, params?: {
    limit?: number;
}, queryOptions?: FinchQueryOptions<DeliveryResponse[], TData, TiledQueryKeyFor<'webhooks'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/** What `useTiledRegisterWebhookMutation().mutate` takes. */
export interface TiledRegisterWebhookVariables {
    /** The node to watch. */
    path: string;
    body: WebhookRegistrationRequest;
}
/**
 * Register a webhook on a node — `POST /api/v1/webhooks/target/{path}`.
 *
 * ```ts
 * register.mutate({
 *     path: 'scans',
 *     body: { url: 'https://example.org/hook', events: ['container-child-created'] },
 * });
 * ```
 */
export declare function useTiledRegisterWebhookMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<WebhookResponse, TiledRegisterWebhookVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<WebhookResponse, TiledHookError, TiledRegisterWebhookVariables, TContext>;
/** Deactivate and remove a webhook — `DELETE /api/v1/webhooks/{webhook_id}`. */
export declare function useTiledDeleteWebhookMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, {
    webhookId: number;
}, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, {
    webhookId: number;
}, TContext>;
/**
 * Mark an append-only node complete — `DELETE /api/v1/stream/close/{path}`.
 *
 * The one write that is really a streaming operation: closing a stream is what emits the
 * `stream-closed` event that webhooks — and, later, websocket subscribers — are waiting for. Useful
 * on its own today, and the seam the streaming work will build against.
 */
export declare function useTiledCloseStreamMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, {
    path: string;
}, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, {
    path: string;
}, TContext>;
//# sourceMappingURL=managementHooks.d.ts.map