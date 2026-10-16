import { TiledEndpointGroup } from '../../../api/tiled';
import { MutationDescriptor, PlaygroundDescriptor, QueryDescriptor } from '../types';
/**
 * Every Tiled hook, as data — 48 queries and 37 mutations.
 *
 * `TiledQueryCatalog.test.ts` diffs this against what `@/api/tiled` actually exports, so a new hook
 * fails CI until it has a descriptor — the same arrangement that keeps the endpoint registry from
 * rotting.
 */
export declare const TILED_QUERY_CATALOG: readonly QueryDescriptor[];
export declare const TILED_MUTATION_CATALOG: readonly MutationDescriptor[];
/** Reads and writes together, which is what the sidebar lists. */
export declare const TILED_PLAYGROUND_CATALOG: readonly PlaygroundDescriptor[];
export declare function getQueryById(id: string): PlaygroundDescriptor | undefined;
/** Which half of the catalog to show. */
export type CatalogFilter = 'all' | 'queries' | 'mutations';
/**
 * Descriptors grouped for display, in the endpoint registry's group order.
 *
 * Queries come before mutations within a group, so a group reads "how to look at this, then how to
 * change it" rather than interleaving the two.
 */
export declare function groupedQueries(filter?: CatalogFilter): {
    group: TiledEndpointGroup;
    queries: PlaygroundDescriptor[];
}[];
//# sourceMappingURL=index.d.ts.map