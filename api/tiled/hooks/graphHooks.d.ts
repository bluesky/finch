import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { TiledRequestOptions } from '../types/common';
import { TiledGraphBindEntityInput, TiledGraphCreateEntityInput, TiledGraphCreateLinkInput, TiledGraphEntity, TiledGraphEntityFilters, TiledGraphLink, TiledGraphLinkFilters, TiledGraphNamespace, TiledGraphNodeEntityFilters, TiledGraphQLVariables, TiledGraphUpdateEntityInput, TiledGraphUpdateLinkInput } from '../types/graph';
import { TiledQueryKeyFor } from './queryKeys';
import { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
/**
 * Tiled's experimental entity/link graph — `{origin}/api/graphql`.
 *
 * Every read keys under the one `graph` root and every write refreshes all of it; see
 * `TiledGraphKeyArgs` for why. Deleting a catalog node refreshes it too, because the server deletes
 * the entities bound to that node.
 *
 * Two things to know before using these:
 *
 * - **Reads never answer 401.** The server filters what the caller may see instead: behind an
 *   access policy an unauthenticated read is empty lists, and on a server with no policy it is
 *   everything. If everything is empty, check the API key first.
 * - **Lists are single pages with no count.** The server pages at 100; a page shorter than `limit`
 *   is the only end-of-list signal. Page with `offset`.
 */
type GraphKey = TiledQueryKeyFor<'graph'>;
/**
 * Any GraphQL document against the graph endpoint — for selections the typed hooks do not make,
 * chiefly nested traversal:
 *
 * ```tsx
 * const PROJECT_SAMPLES = `query ($id: ID!) {
 *     entity(id: $id) {
 *         name
 *         incomingLinks(predicate: "schema:isPartOf") { subject { id name } }
 *     }
 * }`;
 * const project = useTiledGraphQLQuery<{ entity: … }>(PROJECT_SAMPLES, { id: projectId });
 * ```
 *
 * **The result type is yours to declare; nothing checks it.** Pass parameters as `variables`, not by
 * interpolating them into the document. Idles while `document` is blank.
 *
 * **Queries only.** A document defining a `mutation` or `subscription` is rejected before it is
 * sent: a write run as a query would execute, then repeat on every refetch. Use
 * `useTiledGraphQLMutation` for writes.
 *
 * Define the document at module scope or memoise it: it is part of the cache key, so a string
 * rebuilt every render with different whitespace is a different entry.
 *
 * @param document A GraphQL query.
 * @param variables Its variables.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export declare function useTiledGraphQLQuery<TResult = Record<string, unknown>, TData = TResult>(document: string, variables?: TiledGraphQLVariables, queryOptions?: FinchQueryOptions<TResult, TData, GraphKey, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/** What `useTiledGraphQLMutation().mutate` takes. */
export interface TiledGraphQLMutationVariables {
    /** A GraphQL mutation document. */
    document: string;
    variables?: TiledGraphQLVariables;
}
/**
 * Any GraphQL mutation against the graph endpoint — e.g. several aliased `createLink`s in one
 * request.
 *
 * Refreshes every graph read on success **and on failure**, before `mutateAsync` settles.
 *
 * **A failure can follow a partial write.** `createEntity` and `createLink` are declared non-null,
 * so when one aliased field fails, GraphQL nulls the whole `data` — but the fields before it have
 * already been committed, and the server does not roll them back. That is why a failure refreshes
 * the cache too; the rejection still carries the server's error. Prefer one write per request
 * unless you are prepared to reconcile.
 */
export declare function useTiledGraphQLMutation<TResult = Record<string, unknown>, TContext = unknown>(mutationOptions?: FinchMutationOptions<TResult, TiledGraphQLMutationVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<TResult, TiledHookError, TiledGraphQLMutationVariables, TContext>;
/**
 * One entity by id. `data` is `null` when it does not exist **or the caller may not see it** — the
 * server does not distinguish the two. Idles while `id` is empty.
 *
 * @param id The entity id.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export declare function useTiledGraphEntityQuery<TData = TiledGraphEntity | null>(id: string | undefined, queryOptions?: FinchQueryOptions<TiledGraphEntity | null, TData, GraphKey, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * One page of entities — by type (`{ entityType: 'project' }`), by bound catalog node
 * (`{ nodePathParts: ['raw', 'S001'] }`), or all of them.
 *
 * @param filters Filters and paging. Omitted means the first 100 of everything.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export declare function useTiledGraphEntitiesQuery<TData = TiledGraphEntity[]>(filters?: TiledGraphEntityFilters, queryOptions?: FinchQueryOptions<TiledGraphEntity[], TData, GraphKey, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * Create an entity. Bind it to a catalog node with `nodePathParts`; a path that names no node fails
 * with `graphqlCode === 'NODE_NOT_FOUND'`. Needs `write:metadata`.
 *
 * On `main` nothing prevents two entities with the same type and name
 */
export declare function useTiledCreateGraphEntityMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<TiledGraphEntity, TiledGraphCreateEntityInput, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<TiledGraphEntity, TiledHookError, TiledGraphCreateEntityInput, TContext>;
/** What `useTiledUpdateGraphEntityMutation().mutate` takes. */
export interface TiledUpdateGraphEntityVariables {
    id: string;
    /** Only the fields to change: omitted is untouched, `null` clears. */
    input: TiledGraphUpdateEntityInput;
}
/**
 * Change an entity. **Omitted fields are untouched; `null` clears them** — so
 * `{ input: { nodePathParts: null } }` detaches the entity from its node and changes nothing else.
 * Resolves `null` when there is no such entity.
 */
export declare function useTiledUpdateGraphEntityMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<TiledGraphEntity | null, TiledUpdateGraphEntityVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<TiledGraphEntity | null, TiledHookError, TiledUpdateGraphEntityVariables, TContext>;
/** Delete an entity **and every link attached to it**. Resolves whether it existed. */
export declare function useTiledDeleteGraphEntityMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<boolean, {
    id: string;
}, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<boolean, TiledHookError, {
    id: string;
}, TContext>;
/**
 * The entities bound to one catalog node — "what does the graph say about this run?".
 *
 * `path` is a Finch path like every other hook's: relative to the client's `initialPath` unless
 * `requestOptions.pathMode` is `'absolute'`. Idles while `path` is empty (the root cannot be bound).
 *
 * @param path The node's path.
 * @param filters Type and paging. Omitted means the first 100.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export declare function useTiledGraphNodeEntitiesQuery<TData = TiledGraphEntity[]>(path: string, filters?: TiledGraphNodeEntityFilters, queryOptions?: FinchQueryOptions<TiledGraphEntity[], TData, GraphKey, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/** What `useTiledBindGraphEntityMutation().mutate` takes. */
export interface TiledBindGraphEntityVariables {
    /** The catalog node to bind, as a Finch path (relative to `initialPath`). */
    path: string;
    input: TiledGraphBindEntityInput;
}
/**
 * Create an entity bound to a catalog node, recording the node in `uri` so it can be found again.
 *
 * The server never says which node an entity is bound to, so this sets `nodePathParts` (resolved
 * against `initialPath`) and the node's metadata URL as `uri` together, as upstream's Python
 * `bind_entity` does. Read the path back with `client.graphEntityNodePath(entity)` or
 * `tiledGraphEntityNodePath(entity)`. `name` defaults to the node's key.
 */
export declare function useTiledBindGraphEntityMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<TiledGraphEntity, TiledBindGraphEntityVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<TiledGraphEntity, TiledHookError, TiledBindGraphEntityVariables, TContext>;
/**
 * One link by id; `null` when it does not exist or the caller may not see it. Idles while `id` is
 * empty.
 *
 * @param id The link id.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export declare function useTiledGraphLinkQuery<TData = TiledGraphLink | null>(id: string | undefined, queryOptions?: FinchQueryOptions<TiledGraphLink | null, TData, GraphKey, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/**
 * One page of links. `{ objectId, predicate }` is what points *at* an entity — a project's samples,
 * with `predicate: 'schema:isPartOf'`; `{ subjectId }` is what it points at.
 *
 * Returns ids for each end, not the entities; nest `subject { … }` through `useTiledGraphQLQuery`
 * to get both in one request.
 *
 * @param filters Filters and paging. Omitted means the first 100 links.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export declare function useTiledGraphLinksQuery<TData = TiledGraphLink[]>(filters?: TiledGraphLinkFilters, queryOptions?: FinchQueryOptions<TiledGraphLink[], TData, GraphKey, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/** Create a link `subject —predicate→ object`. Needs `write:metadata`. */
export declare function useTiledCreateGraphLinkMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<TiledGraphLink, TiledGraphCreateLinkInput, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<TiledGraphLink, TiledHookError, TiledGraphCreateLinkInput, TContext>;
/** What `useTiledUpdateGraphLinkMutation().mutate` takes. */
export interface TiledUpdateGraphLinkVariables {
    id: string;
    /** Only the fields to change: omitted is untouched, `null` clears. */
    input: TiledGraphUpdateLinkInput;
}
/** Change a link's predicate or access tags. Resolves `null` when there is no such link. */
export declare function useTiledUpdateGraphLinkMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<TiledGraphLink | null, TiledUpdateGraphLinkVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<TiledGraphLink | null, TiledHookError, TiledUpdateGraphLinkVariables, TContext>;
/** Delete one link. Resolves whether it existed. */
export declare function useTiledDeleteGraphLinkMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<boolean, {
    id: string;
}, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<boolean, TiledHookError, {
    id: string;
}, TContext>;
/**
 * The registered CURIE prefixes.
 *
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export declare function useTiledGraphNamespacesQuery<TData = TiledGraphNamespace[]>(queryOptions?: FinchQueryOptions<TiledGraphNamespace[], TData, GraphKey, TiledHookError>, requestOptions?: TiledRequestOptions): UseQueryResult<TData, TiledHookError>;
/** What `useTiledUpsertGraphNamespaceMutation().mutate` takes. */
export interface TiledUpsertGraphNamespaceVariables {
    prefix: string;
    uri: string;
}
/**
 * Register or replace a CURIE prefix. Changes how every predicate and property renders, which is
 * why it refreshes every graph read.
 */
export declare function useTiledUpsertGraphNamespaceMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<TiledGraphNamespace, TiledUpsertGraphNamespaceVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<TiledGraphNamespace, TiledHookError, TiledUpsertGraphNamespaceVariables, TContext>;
/** Remove a CURIE prefix. Resolves whether it existed. */
export declare function useTiledDeleteGraphNamespaceMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<boolean, {
    prefix: string;
}, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<boolean, TiledHookError, {
    prefix: string;
}, TContext>;
export {};
//# sourceMappingURL=graphHooks.d.ts.map