import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { requireArg } from '@/api/shared/errors';
import { graphOperationKinds } from '../graph/operations';
import type { TiledRequestOptions } from '../types/common';
import { TiledApiError } from '../types/errors';
import { TILED_GRAPHQL_PATH } from '../types/paths';
import type {
    TiledGraphBindEntityInput,
    TiledGraphCreateEntityInput,
    TiledGraphCreateLinkInput,
    TiledGraphEntity,
    TiledGraphEntityFilters,
    TiledGraphLink,
    TiledGraphLinkFilters,
    TiledGraphNamespace,
    TiledGraphNodeEntityFilters,
    TiledGraphQLVariables,
    TiledGraphUpdateEntityInput,
    TiledGraphUpdateLinkInput,
} from '../types/graph';
import { useTiledMutation } from './internal/useTiledMutation';
import { useTiledQuery } from './internal/useTiledQuery';
import { TILED_MUTATION_INVALIDATIONS } from './invalidation';
import { tiledQueryKeys, type TiledQueryKeyFor } from './queryKeys';
import type { FinchMutationOptions, FinchQueryOptions, TiledHookError } from './types';
import { useTiledQueryScope } from './useTiledClient';

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

// #region raw GraphQL

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
export function useTiledGraphQLQuery<TResult = Record<string, unknown>, TData = TResult>(
    document: string,
    variables?: TiledGraphQLVariables,
    queryOptions?: FinchQueryOptions<TResult, TData, GraphKey, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);
    const vars = variables ?? {};

    return useTiledQuery({
        queryKey: tiledQueryKeys.graph(scope, { op: 'raw', document, variables: vars }),
        fetch: (client, request) => {
            const query = requireArg(
                document.trim() || undefined,
                'useTiledGraphQLQuery',
                'document',
            );
            // Refused before anything is sent. GraphQL writes travel over the same POST as reads,
            // so a mutation here would execute — and TanStack re-runs a query on remount, refocus,
            // polling and invalidation, repeating the write each time.
            const writes = graphOperationKinds(query).filter((kind) => kind !== 'query');
            if (writes.length > 0) {
                return Promise.reject(
                    new TiledApiError({
                        message:
                            `useTiledGraphQLQuery only runs queries, but this document defines a ` +
                            `${writes[0]}. Use useTiledGraphQLMutation for writes.`,
                        method: 'POST',
                        path: TILED_GRAPHQL_PATH,
                    }),
                );
            }
            return client.graphql<TResult>(query, vars, request);
        },
        requestOptions,
        queryOptions,
        defaultEnabled: document.trim().length > 0,
    });
}

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
export function useTiledGraphQLMutation<TResult = Record<string, unknown>, TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        TResult,
        TiledGraphQLMutationVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<TResult, TiledHookError, TiledGraphQLMutationVariables, TContext> {
    return useTiledMutation({
        perform: (client, { document, variables }, request) =>
            client.graphql<TResult>(document, variables, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledGraphQLMutation,
        invalidateOnError: true,
        requestOptions,
        mutationOptions,
    });
}

// #endregion

// #region entities

/**
 * One entity by id. `data` is `null` when it does not exist **or the caller may not see it** — the
 * server does not distinguish the two. Idles while `id` is empty.
 *
 * @param id The entity id.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export function useTiledGraphEntityQuery<TData = TiledGraphEntity | null>(
    id: string | undefined,
    queryOptions?: FinchQueryOptions<TiledGraphEntity | null, TData, GraphKey, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.graph(scope, { op: 'entity', id: id ?? '' }),
        fetch: (client, request) =>
            client.getGraphEntity(
                requireArg(id || undefined, 'useTiledGraphEntityQuery', 'id'),
                request,
            ),
        requestOptions,
        queryOptions,
        defaultEnabled: !!id,
    });
}

/**
 * One page of entities — by type (`{ entityType: 'project' }`), by bound catalog node
 * (`{ nodePathParts: ['raw', 'S001'] }`), or all of them.
 *
 * @param filters Filters and paging. Omitted means the first 100 of everything.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export function useTiledGraphEntitiesQuery<TData = TiledGraphEntity[]>(
    filters?: TiledGraphEntityFilters,
    queryOptions?: FinchQueryOptions<TiledGraphEntity[], TData, GraphKey, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);
    const resolved = filters ?? {};

    return useTiledQuery({
        queryKey: tiledQueryKeys.graph(scope, { op: 'entities', filters: resolved }),
        fetch: (client, request) => client.getGraphEntities(resolved, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Create an entity. Bind it to a catalog node with `nodePathParts`; a path that names no node fails
 * with `graphqlCode === 'NODE_NOT_FOUND'`. Needs `write:metadata`.
 *
 * On `main` nothing prevents two entities with the same type and name
 */
export function useTiledCreateGraphEntityMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        TiledGraphEntity,
        TiledGraphCreateEntityInput,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<TiledGraphEntity, TiledHookError, TiledGraphCreateEntityInput, TContext> {
    return useTiledMutation({
        perform: (client, input, request) => client.createGraphEntity(input, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledCreateGraphEntityMutation,
        invalidateOnError: true,
        requestOptions,
        mutationOptions,
    });
}

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
export function useTiledUpdateGraphEntityMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        TiledGraphEntity | null,
        TiledUpdateGraphEntityVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<
    TiledGraphEntity | null,
    TiledHookError,
    TiledUpdateGraphEntityVariables,
    TContext
> {
    return useTiledMutation({
        perform: (client, { id, input }, request) => client.updateGraphEntity(id, input, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledUpdateGraphEntityMutation,
        invalidateOnError: true,
        requestOptions,
        mutationOptions,
    });
}

/** Delete an entity **and every link attached to it**. Resolves whether it existed. */
export function useTiledDeleteGraphEntityMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<boolean, { id: string }, TContext, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<boolean, TiledHookError, { id: string }, TContext> {
    return useTiledMutation({
        perform: (client, { id }, request) => client.deleteGraphEntity(id, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledDeleteGraphEntityMutation,
        invalidateOnError: true,
        requestOptions,
        mutationOptions,
    });
}

// #endregion

// #region entities bound to catalog nodes

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
export function useTiledGraphNodeEntitiesQuery<TData = TiledGraphEntity[]>(
    path: string,
    filters?: TiledGraphNodeEntityFilters,
    queryOptions?: FinchQueryOptions<TiledGraphEntity[], TData, GraphKey, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);
    const resolved = filters ?? {};

    return useTiledQuery({
        queryKey: tiledQueryKeys.graph(scope, { op: 'nodeEntities', path, filters: resolved }),
        fetch: (client, request) =>
            client.getGraphNodeEntities(
                requireArg(path || undefined, 'useTiledGraphNodeEntitiesQuery', 'path'),
                resolved,
                request,
            ),
        requestOptions,
        queryOptions,
        defaultEnabled: path.length > 0,
    });
}

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
export function useTiledBindGraphEntityMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        TiledGraphEntity,
        TiledBindGraphEntityVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<TiledGraphEntity, TiledHookError, TiledBindGraphEntityVariables, TContext> {
    return useTiledMutation({
        perform: (client, { path, input }, request) => client.bindGraphEntity(path, input, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledBindGraphEntityMutation,
        invalidateOnError: true,
        requestOptions,
        mutationOptions,
    });
}

// #endregion

// #region links

/**
 * One link by id; `null` when it does not exist or the caller may not see it. Idles while `id` is
 * empty.
 *
 * @param id The link id.
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export function useTiledGraphLinkQuery<TData = TiledGraphLink | null>(
    id: string | undefined,
    queryOptions?: FinchQueryOptions<TiledGraphLink | null, TData, GraphKey, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.graph(scope, { op: 'link', id: id ?? '' }),
        fetch: (client, request) =>
            client.getGraphLink(
                requireArg(id || undefined, 'useTiledGraphLinkQuery', 'id'),
                request,
            ),
        requestOptions,
        queryOptions,
        defaultEnabled: !!id,
    });
}

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
export function useTiledGraphLinksQuery<TData = TiledGraphLink[]>(
    filters?: TiledGraphLinkFilters,
    queryOptions?: FinchQueryOptions<TiledGraphLink[], TData, GraphKey, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);
    const resolved = filters ?? {};

    return useTiledQuery({
        queryKey: tiledQueryKeys.graph(scope, { op: 'links', filters: resolved }),
        fetch: (client, request) => client.getGraphLinks(resolved, request),
        requestOptions,
        queryOptions,
    });
}

/** Create a link `subject —predicate→ object`. Needs `write:metadata`. */
export function useTiledCreateGraphLinkMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        TiledGraphLink,
        TiledGraphCreateLinkInput,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<TiledGraphLink, TiledHookError, TiledGraphCreateLinkInput, TContext> {
    return useTiledMutation({
        perform: (client, input, request) => client.createGraphLink(input, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledCreateGraphLinkMutation,
        invalidateOnError: true,
        requestOptions,
        mutationOptions,
    });
}

/** What `useTiledUpdateGraphLinkMutation().mutate` takes. */
export interface TiledUpdateGraphLinkVariables {
    id: string;
    /** Only the fields to change: omitted is untouched, `null` clears. */
    input: TiledGraphUpdateLinkInput;
}

/** Change a link's predicate or access tags. Resolves `null` when there is no such link. */
export function useTiledUpdateGraphLinkMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        TiledGraphLink | null,
        TiledUpdateGraphLinkVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<
    TiledGraphLink | null,
    TiledHookError,
    TiledUpdateGraphLinkVariables,
    TContext
> {
    return useTiledMutation({
        perform: (client, { id, input }, request) => client.updateGraphLink(id, input, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledUpdateGraphLinkMutation,
        invalidateOnError: true,
        requestOptions,
        mutationOptions,
    });
}

/** Delete one link. Resolves whether it existed. */
export function useTiledDeleteGraphLinkMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<boolean, { id: string }, TContext, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<boolean, TiledHookError, { id: string }, TContext> {
    return useTiledMutation({
        perform: (client, { id }, request) => client.deleteGraphLink(id, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledDeleteGraphLinkMutation,
        invalidateOnError: true,
        requestOptions,
        mutationOptions,
    });
}

// #endregion

// #region namespaces

/**
 * The registered CURIE prefixes.
 *
 * @param queryOptions TanStack options.
 * @param requestOptions Transport overrides.
 */
export function useTiledGraphNamespacesQuery<TData = TiledGraphNamespace[]>(
    queryOptions?: FinchQueryOptions<TiledGraphNamespace[], TData, GraphKey, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.graph(scope, { op: 'namespaces' }),
        fetch: (client, request) => client.getGraphNamespaces(request),
        requestOptions,
        queryOptions,
    });
}

/** What `useTiledUpsertGraphNamespaceMutation().mutate` takes. */
export interface TiledUpsertGraphNamespaceVariables {
    prefix: string;
    uri: string;
}

/**
 * Register or replace a CURIE prefix. Changes how every predicate and property renders, which is
 * why it refreshes every graph read.
 */
export function useTiledUpsertGraphNamespaceMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<
        TiledGraphNamespace,
        TiledUpsertGraphNamespaceVariables,
        TContext,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<
    TiledGraphNamespace,
    TiledHookError,
    TiledUpsertGraphNamespaceVariables,
    TContext
> {
    return useTiledMutation({
        perform: (client, { prefix, uri }, request) =>
            client.upsertGraphNamespace(prefix, uri, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledUpsertGraphNamespaceMutation,
        invalidateOnError: true,
        requestOptions,
        mutationOptions,
    });
}

/** Remove a CURIE prefix. Resolves whether it existed. */
export function useTiledDeleteGraphNamespaceMutation<TContext = unknown>(
    mutationOptions?: FinchMutationOptions<boolean, { prefix: string }, TContext, TiledHookError>,
    requestOptions?: TiledRequestOptions,
): UseMutationResult<boolean, TiledHookError, { prefix: string }, TContext> {
    return useTiledMutation({
        perform: (client, { prefix }, request) => client.deleteGraphNamespace(prefix, request),
        invalidates: TILED_MUTATION_INVALIDATIONS.useTiledDeleteGraphNamespaceMutation,
        invalidateOnError: true,
        requestOptions,
        mutationOptions,
    });
}

// #endregion
