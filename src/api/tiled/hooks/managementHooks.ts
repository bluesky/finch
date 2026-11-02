import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { requireArg } from '@/api/shared/errors';
import type { TiledRequestOptions } from '../types/common';
import type {
    DeliveryResponse,
    PostMetadataRequest,
    PostMetadataResponse,
    PutDataSourceRequest,
    WebhookRegistrationRequest,
    WebhookResponse,
} from '../types/generatedAliases';
import { useTiledMutation } from './internal/useTiledMutation';
import { useTiledQuery } from './internal/useTiledQuery';
import { TILED_MUTATION_INVALIDATIONS } from './invalidation';
import { tiledQueryKeys, type TiledQueryKeyFor } from './queryKeys';
import type { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
import { useTiledQueryScope } from './useTiledClient';

/**
 * The management surface: registration, data sources, revisions, assets, webhooks and streams.
 *
 * These are the endpoints that administer a Tiled node rather than read or write its data. All of
 * them are new — the package exposed none of this.
 */

// #region registration and data sources

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
export function useTiledRegisterMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        PostMetadataResponse,
        TiledRegisterVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<PostMetadataResponse, TiledHookError, TiledRegisterVariables, TContext> {
    return useTiledMutation({
        perform: (client, { parentPath, body }, request) =>
            client.postRegister(parentPath, body, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledRegisterMutation,
        requestOptions,
        mutationOptions,
    });
}

/** What `useTiledPutDataSourceMutation().mutate` takes. */
export interface TiledPutDataSourceVariables {
    path: string;
    body: PutDataSourceRequest;
    /** Scope the change to a region, when the source is being grown rather than replaced. */
    patch_shape?: string;
    patch_offset?: string;
}

/** Replace a node's data source — `PUT /api/v1/data_source/{path}`. */
export function useTiledPutDataSourceMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledPutDataSourceVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledPutDataSourceVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, body, patch_shape, patch_offset }, request) =>
            client.putDataSource(path, body, { patch_shape, patch_offset }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledPutDataSourceMutation,
        requestOptions,
        mutationOptions,
    });
}

// #endregion

// #region revisions

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
export function useTiledRevisionsQuery<TData = unknown>(
    path: string,
    params?: TiledRevisionsParams,
    queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'revisions'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.revisions(scope, {
            path,
            pageOffset: params?.pageOffset ?? null,
            pageCursor: params?.pageCursor ?? null,
            pageLimit: params?.pageLimit ?? null,
        }),
        fetch: (client, request) => client.getRevisions(path, params, request),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0,
    });
}

/** What `useTiledDeleteRevisionMutation().mutate` takes. */
export interface TiledDeleteRevisionVariables {
    path: string;
    /** The revision number to drop. */
    number: number;
}

/** Drop one revision — `DELETE /api/v1/revisions/{path}`. Destructive and not undoable. */
export function useTiledDeleteRevisionMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        TiledDeleteRevisionVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, TiledDeleteRevisionVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, number }, request) =>
            client.deleteRevision(path, { number }, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledDeleteRevisionMutation,
        requestOptions,
        mutationOptions,
    });
}

// #endregion

// #region assets

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
export function useTiledAssetBytesQuery<TData = ArrayBuffer>(
    path: string,
    params: TiledAssetParams | undefined,
    queryOptions?: FinchQueryOptions<ArrayBuffer, TData, TiledQueryKeyFor<'asset'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.asset(scope, {
            path,
            id: params?.id ?? -1,
            kind: 'bytes',
            relativePath: params?.relative_path ?? null,
        }),
        fetch: (client, request) =>
            client.getAssetBytes(
                path,
                requireArg(params, 'useTiledAssetBytesQuery', 'params'),
                request,
            ),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0 && params !== undefined,
    });
}

/** The file list of a directory-shaped asset — `GET /api/v1/asset/manifest/{path}`. */
export function useTiledAssetManifestQuery<TData = unknown>(
    path: string,
    params: { id: number } | undefined,
    queryOptions?: FinchQueryOptions<unknown, TData, TiledQueryKeyFor<'asset'>, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.asset(scope, {
            path,
            id: params?.id ?? -1,
            kind: 'manifest',
            relativePath: null,
        }),
        fetch: (client, request) =>
            client.getAssetManifest(
                path,
                requireArg(params, 'useTiledAssetManifestQuery', 'params'),
                request,
            ),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0 && params !== undefined,
    });
}

// #endregion

// #region webhooks

/**
 * The webhooks registered on a node — `GET /api/v1/webhooks/target/{path}`.
 *
 * Webhooks are Tiled's push mechanism today, and the events they carry —
 * `container-child-created`, `container-child-metadata-updated`, `stream-closed` — are the same
 * vocabulary the websocket transport will use when it lands.
 */
export function useTiledWebhooksQuery<TData = WebhookResponse[]>(
    path: string,
    queryOptions?: FinchQueryOptions<
        WebhookResponse[],
        TData,
        TiledQueryKeyFor<'webhooks'>,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.webhooks(scope, { kind: 'list', path }),
        fetch: (client, request) => client.listWebhooks(path, request),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0,
    });
}

/**
 * Recent delivery attempts for one webhook — `GET /api/v1/webhooks/history/{webhook_id}`.
 *
 * @param webhookId **Required.** Idle while undefined.
 * @param params `limit` caps how many attempts come back.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export function useTiledWebhookHistoryQuery<TData = DeliveryResponse[]>(
    webhookId: number | undefined,
    params?: { limit?: number },
    queryOptions?: FinchQueryOptions<
        DeliveryResponse[],
        TData,
        TiledQueryKeyFor<'webhooks'>,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.webhooks(scope, {
            kind: 'history',
            webhookId: webhookId ?? -1,
            limit: params?.limit ?? null,
        }),
        fetch: (client, request) =>
            client.getWebhookHistory(
                requireArg(webhookId, 'useTiledWebhookHistoryQuery', 'webhookId'),
                params,
                request,
            ),
        requestOptions,
        queryOptions,
        defaultEnabled: webhookId !== undefined,
    });
}

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
export function useTiledRegisterWebhookMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        WebhookResponse,
        TiledRegisterWebhookVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<WebhookResponse, TiledHookError, TiledRegisterWebhookVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, body }, request) => client.registerWebhook(path, body, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledRegisterWebhookMutation,
        requestOptions,
        mutationOptions,
    });
}

/** Deactivate and remove a webhook — `DELETE /api/v1/webhooks/{webhook_id}`. */
export function useTiledDeleteWebhookMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        unknown,
        { webhookId: number },
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, { webhookId: number }, TContext> {
    return useTiledMutation({
        perform: (client, { webhookId }, request) => client.deleteWebhook(webhookId, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledDeleteWebhookMutation,
        requestOptions,
        mutationOptions,
    });
}

// #endregion

// #region streams

/**
 * Mark an append-only node complete — `DELETE /api/v1/stream/close/{path}`.
 *
 * The one write that is really a streaming operation: closing a stream is what emits the
 * `stream-closed` event that webhooks — and, later, websocket subscribers — are waiting for. Useful
 * on its own today, and the seam the streaming work will build against.
 */
export function useTiledCloseStreamMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<unknown, { path: string }, TContext, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<unknown, TiledHookError, { path: string }, TContext> {
    return useTiledMutation({
        perform: (client, { path }, request) => client.closeStream(path, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledCloseStreamMutation,
        requestOptions,
        mutationOptions,
    });
}

// #endregion
