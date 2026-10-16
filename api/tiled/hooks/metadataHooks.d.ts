import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { TiledRequestOptions, TiledSearchItem, TiledStructures } from '../types/common';
import { PatchMetadataRequest, PatchMetadataResponse, PostMetadataRequest, PostMetadataResponse, PutMetadataRequest, PutMetadataResponse } from '../types/generatedAliases';
import { TiledQueryKeyFor } from './queryKeys';
import { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
/** Metadata hooks for `/api/v1/metadata/{path}` — one query and four mutations. */
/**
 * One Tiled item's metadata, specs, links and structure.
 *
 * Resolves the `TiledSearchItem` itself, not a `{ data, error }` envelope — read the item's path from
 * `item.id` and its structure from `item.attributes.structure`. Narrow the structure with the exported
 * `isArrayStructure` / `isTableStructure` / `isContainerStructure` guards, or pass the structure type
 * explicitly:
 *
 * ```ts
 * const item = useTiledMetadataQuery<ArrayStructure>('scans/run1/detector');
 * item.data?.attributes.structure.shape; // number[]
 * ```
 *
 * @param path **Required.** Tiled path to the item. Part of the query key; the query stays idle while
 * it is empty, so `useTiledMetadataQuery(selectedPath ?? '')` makes no request until something is
 * selected. Override with `queryOptions.enabled`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides: `baseUrl`, `apiKey`, `initialPath`, `pathMode`, `signal`.
 */
export declare function useTiledMetadataQuery<S extends TiledStructures = TiledStructures, TData = TiledSearchItem<S>>(path: string, queryOptions?: FinchQueryOptions<TiledSearchItem<S>, TData, TiledQueryKeyFor<'metadata'>, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * Metadata writes: `POST`, `PUT`, `PATCH` and `DELETE` on `/api/v1/metadata/{path}`.
 *
 * Each takes its arguments through `mutate`, so one hook instance performs many writes — the path is
 * part of the variables, not of the hook.
 */
/** What `useTiledCreateNodeMutation().mutate` takes. */
export interface TiledCreateNodeVariables {
    /**
     * The container to create **inside** — not the path the new node will have.
     *
     * `''` is the root. The new node's own key goes in `body.id`.
     */
    parentPath: string;
    body: PostMetadataRequest;
}
/**
 * Create a node — `POST /api/v1/metadata/{path}`.
 *
 * **The path addresses the parent container**, and `body.id` names the child; omit `id` and the
 * server assigns a uuid. Addressing the path you want the node to have answers 404 `No such entry`.
 *
 * ```ts
 * const create = useTiledCreateNodeMutation();
 * await create.mutateAsync({
 *     parentPath: '',
 *     body: {
 *         id: 'processed',
 *         structure_family: 'container',
 *         metadata: {},
 *         data_sources: [],
 *         specs: [],
 *         access_blob: {},
 *     },
 * });
 * ```
 *
 * Invalidates the `structure` bundle: a new node changes what searches return and what the parent
 * container contains, not just its own metadata entry.
 */
export declare function useTiledCreateNodeMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<PostMetadataResponse, TiledCreateNodeVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<PostMetadataResponse, TiledHookError, TiledCreateNodeVariables, TContext>;
/** What `useTiledUpdateMetadataMutation().mutate` takes. */
export interface TiledUpdateMetadataVariables {
    path: string;
    body: PutMetadataRequest;
    /** Skip recording this change in the node's revision history. */
    drop_revision?: boolean;
}
/**
 * Replace a node's metadata, specs and access blob — `PUT /api/v1/metadata/{path}`.
 *
 * A **whole-document replace**: fields absent from `body` are cleared, not left alone. Use
 * `useTiledPatchMetadataMutation` to change part of a document.
 */
export declare function useTiledUpdateMetadataMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<PutMetadataResponse, TiledUpdateMetadataVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<PutMetadataResponse, TiledHookError, TiledUpdateMetadataVariables, TContext>;
/**
 * What `useTiledPatchMetadataMutation().mutate` takes.
 *
 * `mode` selects how the server reads `metadata`, and it is the thing to get right:
 *
 * - `'merge'` (default) — `metadata` is an object merged into what is there. The common case.
 * - `'json-patch'` — `metadata` is a list of RFC 6902 operations (`{ op, path, value }`). Use it to
 *   remove a key, or to edit one element of an array without resending the whole thing.
 */
export interface TiledPatchMetadataVariables {
    path: string;
    mode?: 'merge' | 'json-patch';
    metadata?: PatchMetadataRequest['metadata'];
    specs?: PatchMetadataRequest['specs'];
    access_blob?: PatchMetadataRequest['access_blob'];
    drop_revision?: boolean;
}
/**
 * Partially update a node's metadata — `PATCH /api/v1/metadata/{path}`.
 *
 * ```ts
 * const patch = useTiledPatchMetadataMutation();
 *
 * // merge: set or overwrite one key, leave the rest alone
 * patch.mutate({ path: 'scan/1', metadata: { comment: 'calibration run' } });
 *
 * // json-patch: remove a key
 * patch.mutate({
 *     path: 'scan/1',
 *     mode: 'json-patch',
 *     metadata: [{ op: 'remove', path: '/comment' }],
 * });
 * ```
 */
export declare function useTiledPatchMetadataMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<PatchMetadataResponse, TiledPatchMetadataVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<PatchMetadataResponse, TiledHookError, TiledPatchMetadataVariables, TContext>;
/** What `useTiledDeleteNodeMutation().mutate` takes. */
export interface TiledDeleteNodeVariables {
    path: string;
    /** Delete children too. Without it, a non-empty container is refused. */
    recursive?: boolean;
    /**
     * Defaults to **true** server-side, which refuses with a 409 when any of the tree is internally
     * managed — deleting those records would delete the underlying data files. Pass `false` to mean
     * it.
     */
    external_only?: boolean;
}
/**
 * Delete a node — `DELETE /api/v1/metadata/{path}`.
 *
 * **Destructive and not undoable.** `recursive: true` takes the whole subtree with it, and
 * `external_only: false` lets it delete the underlying data files. The endpoint registry flags this,
 * and the manual test harness asks for confirmation before running it.
 */
export declare function useTiledDeleteNodeMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<unknown, TiledDeleteNodeVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<unknown, TiledHookError, TiledDeleteNodeVariables, TContext>;
//# sourceMappingURL=metadataHooks.d.ts.map