import { TILED_ENDPOINT_GROUPS } from '@/api/tiled';
import type { TiledEndpointGroup } from '@/api/tiled';
import type { QueryDescriptor } from '../types';
import { arrayQueryDescriptors } from './arrayQueries';
import { infoQueryDescriptors } from './infoQueries';
import { managementQueryDescriptors } from './managementQueries';
import { nodeQueryDescriptors } from './nodeQueries';
import { searchQueryDescriptors } from './searchQueries';
import { tableQueryDescriptors } from './tableQueries';

/**
 * Every `useTiled…Query` hook, as data.
 *
 * `TiledQueryCatalog.test.ts` diffs this against the hooks `@/api/tiled` actually exports, so a new
 * hook fails CI until it has a descriptor — the same arrangement that keeps the endpoint registry
 * from rotting.
 */
export const TILED_QUERY_CATALOG: readonly QueryDescriptor[] = [
    ...infoQueryDescriptors,
    ...searchQueryDescriptors,
    ...arrayQueryDescriptors,
    ...tableQueryDescriptors,
    ...nodeQueryDescriptors,
    ...managementQueryDescriptors,
];

export function getQueryById(id: string): QueryDescriptor | undefined {
    return TILED_QUERY_CATALOG.find((descriptor) => descriptor.id === id);
}

/** Descriptors grouped for display, in the endpoint registry's group order. */
export function groupedQueries(): { group: TiledEndpointGroup; queries: QueryDescriptor[] }[] {
    return TILED_ENDPOINT_GROUPS.map((group) => ({
        group,
        queries: TILED_QUERY_CATALOG.filter((descriptor) => descriptor.group === group),
    })).filter((entry) => entry.queries.length > 0);
}
