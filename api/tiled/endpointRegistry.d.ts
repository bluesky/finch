import { TiledEndpointDescriptor, TiledEndpointGroup, TiledGraphOperationDescriptor } from './types/registry';
/**
 * Every operation the client implements, described as data.
 *
 * Ordered by domain so a UI can render it top to bottom, with each group's reads before its writes.
 * `TiledRegistry.test.ts` diffs this against `openapi.json`, so a spec change surfaces as a failing
 * test rather than as a silently missing endpoint — which is what makes "comprehensive" a checked
 * claim rather than a README assertion.
 */
export declare const TILED_ENDPOINTS: readonly TiledEndpointDescriptor[];
/** Domain order used for display. */
export declare const TILED_ENDPOINT_GROUPS: readonly TiledEndpointGroup[];
/** Human-readable group labels. */
export declare const TILED_GROUP_LABELS: Record<TiledEndpointGroup, string>;
/**
 * Every graph-of-links operation, described as data.
 *
 * Kept apart from {@link TILED_ENDPOINTS}, which is diffed against `openapi.json`: the graph is a
 * GraphQL endpoint that spec does not contain. `TiledGraph.test.tsx` diffs this against
 * `graph/schema.graphql` instead. Its group, `'graph'`, is listed in {@link TILED_ENDPOINT_GROUPS}
 * so harnesses that group by it show the graph hooks too.
 */
export declare const TILED_GRAPH_ENDPOINTS: readonly TiledGraphOperationDescriptor[];
export declare function getGraphEndpointById(id: string): TiledGraphOperationDescriptor | undefined;
export declare function getEndpointById(id: string): TiledEndpointDescriptor | undefined;
export declare function getEndpointsByGroup(group: TiledEndpointGroup): TiledEndpointDescriptor[];
/**
 * Endpoints safe to fire in bulk against a live server: reads that change nothing and need no
 * argument beyond a node path.
 *
 * Excludes anything destructive, anything needing a required query parameter the caller would have
 * to invent, and the auth routes — which are not destructive but do fail loudly on a server with
 * authentication disabled, and would be pure noise in a sweep.
 */
export declare function getReadOnlyEndpoints(): TiledEndpointDescriptor[];
/** Every operation that changes server state — excluding the POSTs that are really reads. */
export declare function getWriteEndpoints(): TiledEndpointDescriptor[];
//# sourceMappingURL=endpointRegistry.d.ts.map