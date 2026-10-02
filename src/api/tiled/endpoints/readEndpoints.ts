import type { PostMetadataRequest } from '../types/generatedAliases';
import {
    numberParam,
    payloadAs,
    tupleParam,
    type TiledEndpointDescriptor,
} from '../types/registry';

/**
 * Registry descriptors for the read half of the API: info, search, metadata, and the data reads
 * across every structure family.
 *
 * Split from `writeEndpoints.ts` purely by size. The ordering within each group is the one a human
 * reading top to bottom would want — the common read first, the exotic variants after.
 */

const PATH_PARAM = { name: 'path', in: 'path', required: true } as const;

export const infoEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'info.about',
        group: 'info',
        method: 'GET',
        path: '/api/v1/',
        operationId: 'about_api_v1__get',
        fn: 'getServerInfo',
        summary: 'Server versions, supported formats, queries and auth providers.',
        call: (client) => client.getServerInfo(),
    },
    {
        id: 'info.healthz',
        group: 'info',
        method: 'GET',
        path: '/healthz',
        operationId: 'healthz_healthz_get',
        fn: 'getHealth',
        summary: 'Liveness probe. Outside /api/v1, so issued against the origin.',
        call: (client) => client.getHealth(),
    },
    {
        id: 'info.uiSettings',
        group: 'info',
        method: 'GET',
        path: '/tiled-ui-settings',
        operationId: 'tiled_ui_settings_tiled_ui_settings_get',
        fn: 'getUiSettings',
        summary: "The server's hints for its own web UI.",
        call: (client) => client.getUiSettings(),
    },
    {
        id: 'info.metrics',
        group: 'info',
        method: 'GET',
        path: '/api/v1/metrics',
        operationId: 'metrics_api_v1_metrics_get',
        fn: 'getMetrics',
        summary: 'Prometheus-style server metrics. Often restricted.',
        call: (client) => client.getMetrics(),
    },
];

export const searchEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'search.search',
        group: 'search',
        method: 'GET',
        path: '/api/v1/search/{path}',
        operationId: 'route_with_sig_api_v1_search__path__get',
        fn: 'getSearch',
        summary: "List and filter a container's children. '' is the root.",
        pathParam: true,
        params: [PATH_PARAM],
        sampleBody: { searchOptions: { pageLimit: 10 } },
        call: (client, input) => client.getSearch(input.path ?? '', payloadAs(input)),
    },
    {
        id: 'search.distinct',
        group: 'search',
        method: 'GET',
        path: '/api/v1/distinct/{path}',
        operationId: 'route_with_sig_api_v1_distinct__path__get',
        fn: 'getDistinct',
        summary: 'Distinct values of metadata keys, specs and structure families, with counts.',
        pathParam: true,
        params: [PATH_PARAM],
        sampleBody: { structureFamilies: true, specs: true, counts: true },
        call: (client, input) => client.getDistinct(input.path ?? '', payloadAs(input)),
    },
];

export const metadataReadEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'metadata.get',
        group: 'metadata',
        method: 'GET',
        path: '/api/v1/metadata/{path}',
        operationId: 'metadata_api_v1_metadata__path__get',
        fn: 'getMetadata',
        summary: "One node's metadata, specs, structure and links.",
        pathParam: true,
        params: [PATH_PARAM],
        call: (client, input) => client.getMetadata(input.path ?? ''),
    },
];

export const arrayReadEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'array.getJSON',
        group: 'array',
        method: 'GET',
        path: '/api/v1/array/full/{path}',
        operationId: 'full_array_api_v1_array_full__path__get',
        fn: 'getArrayAsJSON',
        summary: 'A whole array as JSON, downsampled to the byte budget.',
        pathParam: true,
        params: [PATH_PARAM],
        call: (client, input) => client.getArrayAsJSON(input.path ?? ''),
    },
    {
        id: 'array.getBlock',
        group: 'array',
        method: 'GET',
        path: '/api/v1/array/block/{path}',
        operationId: 'array_block_api_v1_array_block__path__get',
        fn: 'getArrayBlock',
        summary: 'One chunk of an array, as raw bytes.',
        pathParam: true,
        binaryResponse: true,
        params: [
            PATH_PARAM,
            {
                name: 'block',
                in: 'query',
                required: true,
                description: 'Comma-separated index tuple',
            },
        ],
        call: (client, input) =>
            client.getArrayBlock(input.path ?? '', { block: tupleParam(input, 'block') }),
    },
];

export const raggedReadEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'ragged.getFull',
        group: 'ragged',
        method: 'GET',
        path: '/api/v1/ragged/full/{path}',
        operationId: 'ragged_full_api_v1_ragged_full__path__get',
        fn: 'getRaggedFull',
        summary: 'A whole ragged array.',
        pathParam: true,
        params: [PATH_PARAM],
        call: (client, input) => client.getRaggedFull(input.path ?? ''),
    },
];

export const tableReadEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'table.getPartition',
        group: 'table',
        method: 'GET',
        path: '/api/v1/table/partition/{path}',
        operationId: 'table_partition_api_v1_table_partition__path__get',
        fn: 'getTablePartitionAsJSON',
        summary: 'One partition of a table, column-oriented.',
        pathParam: true,
        params: [
            PATH_PARAM,
            { name: 'partition', in: 'query', required: true, description: '0-based' },
        ],
        call: (client, input) =>
            client.getTablePartitionAsJSON(input.path ?? '', {
                partition: numberParam(input, 'partition'),
            }),
    },
    {
        id: 'table.getFull',
        group: 'table',
        method: 'GET',
        path: '/api/v1/table/full/{path}',
        operationId: 'full__table__data_api_v1_table_full__path__get',
        fn: 'getTableFullAsJSON',
        summary: 'Every partition of a table, column-oriented.',
        pathParam: true,
        params: [PATH_PARAM],
        call: (client, input) => client.getTableFullAsJSON(input.path ?? ''),
    },
    {
        id: 'table.postFull',
        group: 'table',
        method: 'POST',
        path: '/api/v1/table/full/{path}',
        operationId: 'full__table__data_api_v1_table_full__path__post',
        fn: 'postTableFull',
        summary: 'Every partition, with the column list in the body. A read, despite the verb.',
        readOnly: true,
        pathParam: true,
        params: [PATH_PARAM],
        // The server rejects an empty list with 422 — the body is a selection, and selecting
        // nothing is not a way to ask for everything. Use the GET for that.
        sampleBody: ['seq_num'],
        call: (client, input) =>
            client.postTableFull(input.path ?? '', payloadAs<string[] | null>(input)),
    },
    {
        id: 'table.postPartition',
        group: 'table',
        method: 'POST',
        path: '/api/v1/table/partition/{path}',
        operationId: 'table_partition_api_v1_table_partition__path__post',
        fn: 'postTablePartition',
        summary: 'One partition, with the column list in the body. A read.',
        readOnly: true,
        pathParam: true,
        params: [
            PATH_PARAM,
            { name: 'partition', in: 'query', required: true, description: '0-based' },
        ],
        sampleBody: ['seq_num'],
        call: (client, input) =>
            client.postTablePartition(input.path ?? '', payloadAs<string[] | null>(input), {
                partition: numberParam(input, 'partition'),
            }),
    },
];

export const containerReadEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'container.getFull',
        group: 'container',
        method: 'GET',
        path: '/api/v1/container/full/{path}',
        operationId: 'full__container__metadata_and_data_api_v1_container_full__path__get',
        fn: 'getContainerFull',
        summary: "A container's metadata and data together.",
        pathParam: true,
        params: [PATH_PARAM],
        call: (client, input) => client.getContainerFull(input.path ?? ''),
    },
    {
        id: 'container.postFull',
        group: 'container',
        method: 'POST',
        path: '/api/v1/container/full/{path}',
        operationId: 'full__container__metadata_and_data_api_v1_container_full__path__post',
        fn: 'postContainerFull',
        summary: 'The same read, with the field list in the body.',
        readOnly: true,
        pathParam: true,
        params: [PATH_PARAM],
        // Non-empty for the same reason as `table.postFull`.
        sampleBody: ['internal'],
        call: (client, input) =>
            client.postContainerFull(input.path ?? '', payloadAs<string[] | null>(input)),
    },
];

export const nodeReadEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'node.getFull',
        group: 'node',
        method: 'GET',
        path: '/api/v1/node/full/{path}',
        operationId: 'full__container__or__table__api_v1_node_full__path__get',
        fn: 'getNodeFull',
        summary: 'Whichever of container or table the node turns out to be.',
        pathParam: true,
        params: [PATH_PARAM],
        call: (client, input) => client.getNodeFull(input.path ?? ''),
    },
];

export const awkwardReadEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'awkward.getFull',
        group: 'awkward',
        method: 'GET',
        path: '/api/v1/awkward/full/{path}',
        operationId: 'Full_AwkwardArray_api_v1_awkward_full__path__get',
        fn: 'getAwkwardFull',
        summary: 'A whole awkward array.',
        pathParam: true,
        params: [PATH_PARAM],
        call: (client, input) => client.getAwkwardFull(input.path ?? ''),
    },
    {
        id: 'awkward.getBuffers',
        group: 'awkward',
        method: 'GET',
        path: '/api/v1/awkward/buffers/{path}',
        operationId: 'AwkwardArray_buffers_api_v1_awkward_buffers__path__get',
        fn: 'getAwkwardBuffers',
        summary: 'Selected buffers of an awkward array, by form key.',
        pathParam: true,
        params: [PATH_PARAM],
        call: (client, input) => client.getAwkwardBuffers(input.path ?? ''),
    },
    {
        id: 'awkward.postBuffers',
        group: 'awkward',
        method: 'POST',
        path: '/api/v1/awkward/buffers/{path}',
        operationId: 'AwkwardArray_buffers_api_v1_awkward_buffers__path__post',
        fn: 'postAwkwardBuffers',
        summary: 'The same read, with the form-key list in the body.',
        readOnly: true,
        pathParam: true,
        params: [PATH_PARAM],
        sampleBody: ['node0'],
        call: (client, input) =>
            client.postAwkwardBuffers(input.path ?? '', payloadAs<string[]>(input)),
    },
];

export const assetEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'asset.bytes',
        group: 'asset',
        method: 'GET',
        path: '/api/v1/asset/bytes/{path}',
        operationId: 'get_asset_api_v1_asset_bytes__path__get',
        fn: 'getAssetBytes',
        summary: 'The raw bytes of one asset backing a node.',
        pathParam: true,
        binaryResponse: true,
        params: [
            PATH_PARAM,
            { name: 'id', in: 'query', required: true, description: 'Asset id' },
            { name: 'relative_path', in: 'query', required: false },
        ],
        call: (client, input) =>
            client.getAssetBytes(input.path ?? '', {
                id: numberParam(input, 'id'),
                relative_path: input.params?.relative_path,
            }),
    },
    {
        id: 'asset.manifest',
        group: 'asset',
        method: 'GET',
        path: '/api/v1/asset/manifest/{path}',
        operationId: 'get_asset_manifest_api_v1_asset_manifest__path__get',
        fn: 'getAssetManifest',
        summary: 'The file list of a directory-shaped asset.',
        pathParam: true,
        params: [PATH_PARAM, { name: 'id', in: 'query', required: true, description: 'Asset id' }],
        call: (client, input) =>
            client.getAssetManifest(input.path ?? '', { id: numberParam(input, 'id') }),
    },
];

export const revisionReadEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'management.revisions',
        group: 'management',
        method: 'GET',
        path: '/api/v1/revisions/{path}',
        operationId: 'get_revisions_api_v1_revisions__path__get',
        fn: 'getRevisions',
        summary: "A node's metadata revision history.",
        pathParam: true,
        params: [PATH_PARAM],
        call: (client, input) => client.getRevisions(input.path ?? ''),
    },
];

export const webhookReadEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'webhooks.list',
        group: 'webhooks',
        method: 'GET',
        path: '/api/v1/webhooks/target/{path}',
        operationId: 'list_webhooks_api_v1_webhooks_target__path__get',
        fn: 'listWebhooks',
        summary: 'The webhooks registered on a node.',
        pathParam: true,
        params: [PATH_PARAM],
        call: (client, input) => client.listWebhooks(input.path ?? ''),
    },
    {
        id: 'webhooks.history',
        group: 'webhooks',
        method: 'GET',
        path: '/api/v1/webhooks/history/{webhook_id}',
        operationId: 'webhook_history_api_v1_webhooks_history__webhook_id__get',
        fn: 'getWebhookHistory',
        summary: 'Recent delivery attempts for one webhook.',
        params: [{ name: 'webhook_id', in: 'path', required: true }],
        call: (client, input) => client.getWebhookHistory(numberParam(input, 'webhook_id')),
    },
];

/** The sample body the harness prefills for a container creation. */
export const SAMPLE_CONTAINER_BODY: PostMetadataRequest = {
    id: 'finch-example',
    structure_family: 'container',
    metadata: { created_by: 'finch' },
    data_sources: [],
    specs: [],
    access_blob: {},
};
