import { TILED_ENDPOINT_GROUPS } from '@/api/tiled';
import type { TiledEndpointGroup } from '@/api/tiled';
import type { MutationDescriptor, PlaygroundDescriptor, QueryDescriptor } from '../types';
import { arrayQueryDescriptors } from './arrayQueries';
import { dataMutationDescriptors } from './dataMutations';
import { infoQueryDescriptors } from './infoQueries';
import { managementMutationDescriptors } from './managementMutations';
import { managementQueryDescriptors } from './managementQueries';
import { metadataMutationDescriptors } from './metadataMutations';
import { nodeQueryDescriptors } from './nodeQueries';
import { searchQueryDescriptors } from './searchQueries';
import { tableQueryDescriptors } from './tableQueries';

/**
 * Every Tiled hook, as data — 41 queries and 27 mutations.
 *
 * `TiledQueryCatalog.test.ts` diffs this against what `@/api/tiled` actually exports, so a new hook
 * fails CI until it has a descriptor — the same arrangement that keeps the endpoint registry from
 * rotting.
 */
export const TILED_QUERY_CATALOG: readonly QueryDescriptor[] = [
    ...infoQueryDescriptors,
    ...searchQueryDescriptors,
    ...arrayQueryDescriptors,
    ...tableQueryDescriptors,
    ...nodeQueryDescriptors,
    ...managementQueryDescriptors,
];

export const TILED_MUTATION_CATALOG: readonly MutationDescriptor[] = [
    ...metadataMutationDescriptors,
    ...dataMutationDescriptors,
    ...managementMutationDescriptors,
];

/** Reads and writes together, which is what the sidebar lists. */
export const TILED_PLAYGROUND_CATALOG: readonly PlaygroundDescriptor[] = [
    ...TILED_QUERY_CATALOG,
    ...TILED_MUTATION_CATALOG,
];

export function getQueryById(id: string): PlaygroundDescriptor | undefined {
    return TILED_PLAYGROUND_CATALOG.find((descriptor) => descriptor.id === id);
}

/** Which half of the catalog to show. */
export type CatalogFilter = 'all' | 'queries' | 'mutations';

/**
 * Descriptors grouped for display, in the endpoint registry's group order.
 *
 * Queries come before mutations within a group, so a group reads "how to look at this, then how to
 * change it" rather than interleaving the two.
 */
export function groupedQueries(
    filter: CatalogFilter = 'all',
): { group: TiledEndpointGroup; queries: PlaygroundDescriptor[] }[] {
    const source =
        filter === 'queries'
            ? TILED_QUERY_CATALOG
            : filter === 'mutations'
              ? TILED_MUTATION_CATALOG
              : TILED_PLAYGROUND_CATALOG;

    return TILED_ENDPOINT_GROUPS.map((group) => ({
        group,
        queries: source.filter((descriptor) => descriptor.group === group),
    })).filter((entry) => entry.queries.length > 0);
}
