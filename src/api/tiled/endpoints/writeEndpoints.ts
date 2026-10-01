import type {
    PatchMetadataRequest,
    PostMetadataRequest,
    PutDataSourceRequest,
    PutMetadataRequest,
    WebhookRegistrationRequest,
} from '../types/generatedAliases';
import {
    numberParam,
    payloadAs,
    tupleParam,
    type TiledEndpointDescriptor,
} from '../types/registry';
import { SAMPLE_CONTAINER_BODY } from './readEndpoints';

/**
 * Registry descriptors for the write half of the API, plus auth and zarr.
 *
 * Every binary write is marked `binary: true`; the harness offers a file picker for those rather
 * than a JSON editor, because there is no useful way to type array bytes into a textarea. Where a
 * write cannot be exercised without one, `call` still accepts an empty body so the request shape can
 * be checked against the server's validation.
 */

const PATH_PARAM = { name: 'path', in: 'path', required: true } as const;

/** Bytes from a harness invocation, or an empty buffer when nothing was attached. */
async function bodyBytes(file: File | Blob | null | undefined): Promise<ArrayBuffer> {
    if (!file) return new ArrayBuffer(0);
    return file.arrayBuffer();
}

export const metadataWriteEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'metadata.create',
        group: 'metadata',
        method: 'POST',
        path: '/api/v1/metadata/{path}',
        operationId: 'post_metadata_api_v1_metadata__path__post',
        fn: 'createNode',
        summary: 'Create a node INSIDE the container at this path; body.id names the child.',
        pathParam: true,
        params: [PATH_PARAM],
        sampleBody: SAMPLE_CONTAINER_BODY as unknown as Record<string, unknown>,
        call: (client, input) =>
            client.createNode(input.path ?? '', payloadAs<PostMetadataRequest>(input)),
    },
    {
        id: 'metadata.update',
        group: 'metadata',
        method: 'PUT',
        path: '/api/v1/metadata/{path}',
        operationId: 'put_metadata_api_v1_metadata__path__put',
        fn: 'updateMetadata',
        summary: 'Replace metadata, specs and access blob wholesale.',
        pathParam: true,
        destructive: true,
        params: [PATH_PARAM, { name: 'drop_revision', in: 'query', required: false }],
        sampleBody: { metadata: { note: 'edited by finch' }, specs: [] },
        call: (client, input) =>
            client.updateMetadata(input.path ?? '', payloadAs<PutMetadataRequest>(input), {
                drop_revision: input.params?.drop_revision === 'true',
            }),
    },
    {
        id: 'metadata.patch',
        group: 'metadata',
        method: 'PATCH',
        path: '/api/v1/metadata/{path}',
        operationId: 'patch_metadata_api_v1_metadata__path__patch',
        fn: 'patchMetadata',
        summary: "Partial update. body['content-type'] picks merge-patch or JSON Patch.",
        pathParam: true,
        destructive: true,
        params: [PATH_PARAM, { name: 'drop_revision', in: 'query', required: false }],
        sampleBody: {
            'content-type': 'application/merge-patch+json',
            metadata: { note: 'patched by finch' },
            specs: null,
        },
        call: (client, input) =>
            client.patchMetadata(input.path ?? '', payloadAs<PatchMetadataRequest>(input), {
                drop_revision: input.params?.drop_revision === 'true',
            }),
    },
    {
        id: 'metadata.delete',
        group: 'metadata',
        method: 'DELETE',
        path: '/api/v1/metadata/{path}',
        operationId: 'delete_api_v1_metadata__path__delete',
        fn: 'deleteNode',
        summary:
            'Delete a node. external_only defaults to true server-side; pass false to mean it.',
        pathParam: true,
        destructive: true,
        params: [
            PATH_PARAM,
            { name: 'recursive', in: 'query', required: false },
            { name: 'external_only', in: 'query', required: false },
        ],
        call: (client, input) =>
            client.deleteNode(input.path ?? '', {
                recursive: input.params?.recursive === 'true',
                external_only: input.params?.external_only
                    ? input.params.external_only === 'true'
                    : undefined,
            }),
    },
];

export const arrayWriteEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'array.putFull',
        group: 'array',
        method: 'PUT',
        path: '/api/v1/array/full/{path}',
        operationId: 'put_array_full_api_v1_array_full__path__put',
        fn: 'putArrayFull',
        summary: "Write a whole array. Bytes must be in the array's own dtype and C order.",
        pathParam: true,
        binary: true,
        destructive: true,
        params: [PATH_PARAM, { name: 'persist', in: 'query', required: false }],
        call: async (client, input) =>
            client.putArrayFull(input.path ?? '', await bodyBytes(input.file), {
                persist: input.params?.persist === 'true',
            }),
    },
    {
        id: 'array.putBlock',
        group: 'array',
        method: 'PUT',
        path: '/api/v1/array/block/{path}',
        operationId: 'put_array_block_api_v1_array_block__path__put',
        fn: 'putArrayBlock',
        summary: 'Write one chunk of an array.',
        pathParam: true,
        binary: true,
        destructive: true,
        params: [
            PATH_PARAM,
            {
                name: 'block',
                in: 'query',
                required: true,
                description: 'Comma-separated index tuple',
            },
            { name: 'persist', in: 'query', required: false },
        ],
        call: async (client, input) =>
            client.putArrayBlock(input.path ?? '', await bodyBytes(input.file), {
                block: tupleParam(input, 'block'),
                persist: input.params?.persist === 'true',
            }),
    },
    {
        id: 'array.patchFull',
        group: 'array',
        method: 'PATCH',
        path: '/api/v1/array/full/{path}',
        operationId: 'patch_array_full_api_v1_array_full__path__patch',
        fn: 'patchArrayFull',
        summary: 'Write a sub-region; extend=true grows a resizable array.',
        pathParam: true,
        binary: true,
        destructive: true,
        params: [
            PATH_PARAM,
            { name: 'offset', in: 'query', required: true },
            { name: 'shape', in: 'query', required: true },
            { name: 'extend', in: 'query', required: false },
            { name: 'persist', in: 'query', required: false },
        ],
        call: async (client, input) =>
            client.patchArrayFull(input.path ?? '', await bodyBytes(input.file), {
                offset: tupleParam(input, 'offset'),
                shape: tupleParam(input, 'shape'),
                extend: input.params?.extend === 'true',
                persist: input.params?.persist === 'true',
            }),
    },
];

export const raggedWriteEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'ragged.putFull',
        group: 'ragged',
        method: 'PUT',
        path: '/api/v1/ragged/full/{path}',
        operationId: 'put_ragged_full_api_v1_ragged_full__path__put',
        fn: 'putRaggedFull',
        summary: 'Write a whole ragged array.',
        pathParam: true,
        binary: true,
        destructive: true,
        params: [PATH_PARAM, { name: 'persist', in: 'query', required: false }],
        call: async (client, input) =>
            client.putRaggedFull(input.path ?? '', await bodyBytes(input.file), {
                persist: input.params?.persist === 'true',
            }),
    },
    {
        id: 'ragged.putBlock',
        group: 'ragged',
        method: 'PUT',
        path: '/api/v1/ragged/block/{path}',
        operationId: 'put_ragged_block_api_v1_ragged_block__path__put',
        fn: 'putRaggedBlock',
        summary: 'Write one chunk of a ragged array.',
        pathParam: true,
        binary: true,
        destructive: true,
        params: [
            PATH_PARAM,
            { name: 'block', in: 'query', required: true },
            { name: 'persist', in: 'query', required: false },
        ],
        call: async (client, input) =>
            client.putRaggedBlock(input.path ?? '', await bodyBytes(input.file), {
                block: tupleParam(input, 'block'),
                persist: input.params?.persist === 'true',
            }),
    },
    {
        id: 'ragged.patchFull',
        group: 'ragged',
        method: 'PATCH',
        path: '/api/v1/ragged/full/{path}',
        operationId: 'patch_ragged_full_api_v1_ragged_full__path__patch',
        fn: 'patchRaggedFull',
        summary: 'Write a sub-region of a ragged array.',
        pathParam: true,
        binary: true,
        destructive: true,
        params: [
            PATH_PARAM,
            { name: 'offset', in: 'query', required: true },
            { name: 'shape', in: 'query', required: true },
            { name: 'extend', in: 'query', required: false },
            { name: 'persist', in: 'query', required: false },
        ],
        call: async (client, input) =>
            client.patchRaggedFull(input.path ?? '', await bodyBytes(input.file), {
                offset: tupleParam(input, 'offset'),
                shape: tupleParam(input, 'shape'),
                extend: input.params?.extend === 'true',
                persist: input.params?.persist === 'true',
            }),
    },
];

export const tableWriteEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'table.putPartition',
        group: 'table',
        method: 'PUT',
        path: '/api/v1/table/partition/{path}',
        operationId: 'put_table_partition_api_v1_table_partition__path__put',
        fn: 'putTablePartition',
        summary: 'Write one partition. mimetype says parquet / CSV / arrow.',
        pathParam: true,
        binary: true,
        destructive: true,
        params: [
            PATH_PARAM,
            { name: 'partition', in: 'query', required: true },
            { name: 'mimetype', in: 'query', required: true, description: 'Encoding of the body' },
        ],
        call: async (client, input) =>
            client.putTablePartition(input.path ?? '', await bodyBytes(input.file), {
                partition: numberParam(input, 'partition'),
                mimetype: input.params?.mimetype ?? 'application/x-parquet',
            }),
    },
    {
        id: 'table.patchPartition',
        group: 'table',
        method: 'PATCH',
        path: '/api/v1/table/partition/{path}',
        operationId: 'patch_table_partition_api_v1_table_partition__path__patch',
        fn: 'patchTablePartition',
        summary: 'Append to one partition.',
        pathParam: true,
        binary: true,
        destructive: true,
        params: [
            PATH_PARAM,
            { name: 'partition', in: 'query', required: true },
            { name: 'mimetype', in: 'query', required: true },
        ],
        call: async (client, input) =>
            client.patchTablePartition(input.path ?? '', await bodyBytes(input.file), {
                partition: numberParam(input, 'partition'),
                mimetype: input.params?.mimetype ?? 'application/x-parquet',
            }),
    },
    {
        id: 'table.putFull',
        group: 'table',
        method: 'PUT',
        path: '/api/v1/table/full/{path}',
        operationId: 'put_node_full_api_v1_table_full__path__put',
        fn: 'putTableFull',
        summary: 'Write a whole table. The same server operation as node.putFull.',
        pathParam: true,
        binary: true,
        destructive: true,
        params: [PATH_PARAM, { name: 'mimetype', in: 'query', required: true }],
        call: async (client, input) =>
            client.putTableFull(input.path ?? '', await bodyBytes(input.file), {
                mimetype: input.params?.mimetype ?? 'application/x-parquet',
            }),
    },
];

export const nodeWriteEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'node.putFull',
        group: 'node',
        method: 'PUT',
        path: '/api/v1/node/full/{path}',
        operationId: 'put_node_full_api_v1_node_full__path__put',
        fn: 'putNodeFull',
        summary: 'Write a whole node.',
        pathParam: true,
        binary: true,
        destructive: true,
        params: [PATH_PARAM, { name: 'mimetype', in: 'query', required: true }],
        call: async (client, input) =>
            client.putNodeFull(input.path ?? '', await bodyBytes(input.file), {
                mimetype: input.params?.mimetype ?? 'application/x-parquet',
            }),
    },
];

export const awkwardWriteEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'awkward.putFull',
        group: 'awkward',
        method: 'PUT',
        path: '/api/v1/awkward/full/{path}',
        operationId: 'put_awkward_full_api_v1_awkward_full__path__put',
        fn: 'putAwkwardFull',
        summary: 'Write an awkward array as its form plus a buffer map.',
        pathParam: true,
        destructive: true,
        params: [PATH_PARAM],
        sampleBody: { form: {}, length: 0, container: {} },
        call: (client, input) =>
            client.putAwkwardFull(
                input.path ?? '',
                payloadAs<{ form: unknown; length: number; container: Record<string, unknown> }>(
                    input,
                ),
            ),
    },
];

export const managementWriteEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'management.register',
        group: 'management',
        method: 'POST',
        path: '/api/v1/register/{path}',
        operationId: 'post_register_api_v1_register__path__post',
        fn: 'postRegister',
        summary: 'Register data already on disk. Addresses the parent container.',
        pathParam: true,
        destructive: true,
        params: [PATH_PARAM],
        sampleBody: SAMPLE_CONTAINER_BODY as unknown as Record<string, unknown>,
        call: (client, input) =>
            client.postRegister(input.path ?? '', payloadAs<PostMetadataRequest>(input)),
    },
    {
        id: 'management.putDataSource',
        group: 'management',
        method: 'PUT',
        path: '/api/v1/data_source/{path}',
        operationId: 'put_data_source_api_v1_data_source__path__put',
        fn: 'putDataSource',
        summary: "Replace a node's data source.",
        pathParam: true,
        destructive: true,
        params: [
            PATH_PARAM,
            { name: 'patch_shape', in: 'query', required: false },
            { name: 'patch_offset', in: 'query', required: false },
        ],
        call: (client, input) =>
            client.putDataSource(input.path ?? '', payloadAs<PutDataSourceRequest>(input), {
                patch_shape: input.params?.patch_shape,
                patch_offset: input.params?.patch_offset,
            }),
    },
    {
        id: 'management.deleteRevision',
        group: 'management',
        method: 'DELETE',
        path: '/api/v1/revisions/{path}',
        operationId: 'delete_revision_api_v1_revisions__path__delete',
        fn: 'deleteRevision',
        summary: 'Drop one metadata revision by number.',
        pathParam: true,
        destructive: true,
        params: [PATH_PARAM, { name: 'number', in: 'query', required: true }],
        call: (client, input) =>
            client.deleteRevision(input.path ?? '', { number: numberParam(input, 'number') }),
    },
    {
        id: 'management.closeStream',
        group: 'management',
        method: 'DELETE',
        path: '/api/v1/stream/close/{path}',
        operationId: 'close_stream_api_v1_stream_close__path__delete',
        fn: 'closeStream',
        summary: "Mark an append-only node complete. Emits the 'stream-closed' event.",
        pathParam: true,
        destructive: true,
        params: [PATH_PARAM],
        call: (client, input) => client.closeStream(input.path ?? ''),
    },
];

export const webhookWriteEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'webhooks.register',
        group: 'webhooks',
        method: 'POST',
        path: '/api/v1/webhooks/target/{path}',
        operationId: 'register_webhook_api_v1_webhooks_target__path__post',
        fn: 'registerWebhook',
        summary: "Register a webhook for a node's events.",
        pathParam: true,
        params: [PATH_PARAM],
        sampleBody: {
            url: 'https://example.org/hook',
            events: ['container-child-created'],
        },
        call: (client, input) =>
            client.registerWebhook(input.path ?? '', payloadAs<WebhookRegistrationRequest>(input)),
    },
    {
        id: 'webhooks.delete',
        group: 'webhooks',
        method: 'DELETE',
        path: '/api/v1/webhooks/{webhook_id}',
        operationId: 'delete_webhook_api_v1_webhooks__webhook_id__delete',
        fn: 'deleteWebhook',
        summary: 'Deactivate and remove a webhook.',
        destructive: true,
        params: [{ name: 'webhook_id', in: 'path', required: true }],
        call: (client, input) => client.deleteWebhook(numberParam(input, 'webhook_id')),
    },
];

/**
 * Auth endpoints.
 *
 * `operationId: null` throughout — these routes are genuinely absent from `openapi.json`, because
 * Tiled generates the spec without its auth router. The coverage test knows this and treats a null
 * operation id as deliberate rather than as a gap. The URLs are resolved at call time from
 * `About.authentication.links`; on a server with auth disabled every one of them fails with a
 * `TiledApiError` saying so.
 */
export const authEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'auth.whoami',
        group: 'auth',
        method: 'GET',
        path: '/api/v1/',
        operationId: null,
        fn: 'whoami',
        summary: 'Who the current credentials identify.',
        call: (client) => client.whoami(),
    },
    {
        id: 'auth.login',
        group: 'auth',
        method: 'POST',
        path: '/api/v1/',
        operationId: null,
        fn: 'loginWithUsernamePassword',
        summary: 'Log in with a username and password. Resolves null on a failed login.',
        sampleBody: { username: '', password: '' },
        call: (client, input) => {
            const { username = '', password = '' } = payloadAs<{
                username?: string;
                password?: string;
            }>(input);
            return client.loginWithUsernamePassword(username, password);
        },
    },
    {
        id: 'auth.createApiKey',
        group: 'auth',
        method: 'POST',
        path: '/api/v1/',
        operationId: null,
        fn: 'createApiKey',
        summary: 'Mint an API key. The secret is returned once and never again.',
        sampleBody: { expires_in: null, scopes: null, note: 'finch' },
        call: (client, input) => client.createApiKey(payloadAs(input)),
    },
    {
        id: 'auth.revokeApiKey',
        group: 'auth',
        method: 'DELETE',
        path: '/api/v1/',
        operationId: null,
        fn: 'revokeApiKey',
        summary: 'Revoke an API key by its first eight characters.',
        destructive: true,
        params: [{ name: 'first_eight', in: 'query', required: true }],
        call: (client, input) => client.revokeApiKey(input.params?.first_eight ?? ''),
    },
    {
        id: 'auth.refreshSession',
        group: 'auth',
        method: 'POST',
        path: '/api/v1/',
        operationId: null,
        fn: 'refreshSession',
        summary: 'Exchange the stored refresh token for a new access token.',
        call: (client) => client.refreshSession(),
    },
    {
        id: 'auth.revokeSession',
        group: 'auth',
        method: 'DELETE',
        path: '/api/v1/',
        operationId: null,
        fn: 'revokeSession',
        summary: 'Revoke one session by id.',
        destructive: true,
        params: [{ name: 'session_id', in: 'query', required: true }],
        call: (client, input) => client.revokeSession(input.params?.session_id ?? ''),
    },
    {
        id: 'auth.logout',
        group: 'auth',
        method: 'POST',
        path: '/api/v1/',
        operationId: null,
        fn: 'logout',
        summary: 'Log out, then drop every local credential.',
        destructive: true,
        call: (client) => client.logout(),
    },
];

/**
 * Zarr.
 *
 * URL builders, not fetchers — these routes exist to be handed to zarr.js or xarray, which do their
 * own chunk fetching. `synchronous: true` tells the harness to show the URL rather than to await a
 * response. The ten spec paths collapse to two entries because a zarr reader is given a node's base
 * URL and derives `.zattrs`, `.zgroup`, `zarr.json` and the chunk paths itself; the coverage test
 * lists the other eight as covered-by-these.
 */
export const zarrEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'zarr.v2',
        group: 'zarr',
        method: 'GET',
        path: '/zarr/v2/{path}',
        operationId:
            'Zarr_group__directory__structure_or_a_chunk_of_a_zarr_array_zarr_v2__path__get',
        fn: 'getZarrV2Url',
        summary: 'The base URL to hand a zarr v2 reader for a node.',
        pathParam: true,
        synchronous: true,
        params: [PATH_PARAM],
        call: (client, input) => Promise.resolve(client.getZarrV2Url(input.path ?? '')),
    },
    {
        id: 'zarr.v3',
        group: 'zarr',
        method: 'GET',
        path: '/zarr/v3/{path}',
        operationId: 'Contents_of_a_zarr_group_zarr_v3__path__get',
        fn: 'getZarrV3Url',
        summary: 'The base URL to hand a zarr v3 reader for a node.',
        pathParam: true,
        synchronous: true,
        params: [PATH_PARAM],
        call: (client, input) => Promise.resolve(client.getZarrV3Url(input.path ?? '')),
    },
];
