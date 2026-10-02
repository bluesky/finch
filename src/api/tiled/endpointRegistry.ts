import {
    arrayReadEndpointDescriptors,
    assetEndpointDescriptors,
    awkwardReadEndpointDescriptors,
    containerReadEndpointDescriptors,
    infoEndpointDescriptors,
    metadataReadEndpointDescriptors,
    nodeReadEndpointDescriptors,
    raggedReadEndpointDescriptors,
    revisionReadEndpointDescriptors,
    searchEndpointDescriptors,
    tableReadEndpointDescriptors,
    webhookReadEndpointDescriptors,
} from './endpoints/readEndpoints';
import {
    arrayWriteEndpointDescriptors,
    authEndpointDescriptors,
    awkwardWriteEndpointDescriptors,
    managementWriteEndpointDescriptors,
    metadataWriteEndpointDescriptors,
    nodeWriteEndpointDescriptors,
    raggedWriteEndpointDescriptors,
    tableWriteEndpointDescriptors,
    webhookWriteEndpointDescriptors,
    zarrEndpointDescriptors,
} from './endpoints/writeEndpoints';
import type { TiledEndpointDescriptor, TiledEndpointGroup } from './types/registry';

/**
 * Every operation the client implements, described as data.
 *
 * Ordered by domain so a UI can render it top to bottom, with each group's reads before its writes.
 * `TiledRegistry.test.ts` diffs this against `openapi.json`, so a spec change surfaces as a failing
 * test rather than as a silently missing endpoint — which is what makes "comprehensive" a checked
 * claim rather than a README assertion.
 */
export const TILED_ENDPOINTS: readonly TiledEndpointDescriptor[] = [
    ...infoEndpointDescriptors,
    ...searchEndpointDescriptors,
    ...metadataReadEndpointDescriptors,
    ...metadataWriteEndpointDescriptors,
    ...arrayReadEndpointDescriptors,
    ...arrayWriteEndpointDescriptors,
    ...raggedReadEndpointDescriptors,
    ...raggedWriteEndpointDescriptors,
    ...tableReadEndpointDescriptors,
    ...tableWriteEndpointDescriptors,
    ...containerReadEndpointDescriptors,
    ...nodeReadEndpointDescriptors,
    ...nodeWriteEndpointDescriptors,
    ...awkwardReadEndpointDescriptors,
    ...awkwardWriteEndpointDescriptors,
    ...revisionReadEndpointDescriptors,
    ...managementWriteEndpointDescriptors,
    ...assetEndpointDescriptors,
    ...webhookReadEndpointDescriptors,
    ...webhookWriteEndpointDescriptors,
    ...authEndpointDescriptors,
    ...zarrEndpointDescriptors,
];

/** Domain order used for display. */
export const TILED_ENDPOINT_GROUPS: readonly TiledEndpointGroup[] = [
    'info',
    'search',
    'metadata',
    'array',
    'ragged',
    'table',
    'container',
    'node',
    'awkward',
    'management',
    'asset',
    'webhooks',
    'auth',
    'zarr',
];

/** Human-readable group labels. */
export const TILED_GROUP_LABELS: Record<TiledEndpointGroup, string> = {
    info: 'Server info',
    search: 'Search',
    metadata: 'Metadata',
    array: 'Arrays',
    ragged: 'Ragged arrays',
    table: 'Tables',
    container: 'Containers',
    node: 'Nodes',
    awkward: 'Awkward arrays',
    management: 'Registration & revisions',
    asset: 'Assets',
    webhooks: 'Webhooks',
    auth: 'Authentication',
    zarr: 'Zarr',
};

export function getEndpointById(id: string): TiledEndpointDescriptor | undefined {
    return TILED_ENDPOINTS.find((endpoint) => endpoint.id === id);
}

export function getEndpointsByGroup(group: TiledEndpointGroup): TiledEndpointDescriptor[] {
    return TILED_ENDPOINTS.filter((endpoint) => endpoint.group === group);
}

/**
 * Endpoints safe to fire in bulk against a live server: reads that change nothing and need no
 * argument beyond a node path.
 *
 * Excludes anything destructive, anything needing a required query parameter the caller would have
 * to invent, and the auth routes — which are not destructive but do fail loudly on a server with
 * authentication disabled, and would be pure noise in a sweep.
 */
export function getReadOnlyEndpoints(): TiledEndpointDescriptor[] {
    return TILED_ENDPOINTS.filter(
        (endpoint) =>
            // `readOnly` covers the four POSTs that are reads with a body — see the flag's docs.
            (endpoint.method === 'GET' || endpoint.readOnly === true) &&
            !endpoint.destructive &&
            endpoint.group !== 'auth' &&
            !endpoint.params?.some((param) => param.required && param.in === 'query'),
    );
}

/** Every operation that changes server state — excluding the POSTs that are really reads. */
export function getWriteEndpoints(): TiledEndpointDescriptor[] {
    return TILED_ENDPOINTS.filter(
        (endpoint) => endpoint.method !== 'GET' && endpoint.readOnly !== true,
    );
}
