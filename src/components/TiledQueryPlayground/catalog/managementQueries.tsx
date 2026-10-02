/* eslint-disable react-refresh/only-export-components --
 * A Runner has to live beside its descriptor: the descriptor's whole purpose is to pair a hook's
 * metadata with the one component allowed to call it. Splitting them to satisfy fast refresh would
 * scatter 41 one-hook components across 41 files and leave the catalog pointing at them from
 * elsewhere. These are dev-harness modules; losing component-level HMR granularity here costs
 * nothing.
 */
import {
    useTiledAssetBytesQuery,
    useTiledAssetManifestQuery,
    useTiledRevisionsQuery,
    useTiledWebhookHistoryQuery,
    useTiledWebhooksQuery,
} from '@/api/tiled';
import QueryResultPanel from '../QueryResultPanel';
import { num, str, type QueryDescriptor, type QueryRunnerProps } from '../types';

/**
 * Revisions, assets and webhooks — the reads that administer a node rather than return its data.
 *
 * Three of these are guarded on a numeric argument rather than a path, which makes them the place
 * to see `FinchMissingArgumentError`: force `enabled` on with the id blank and the hook raises a
 * named error before any request goes out, rather than putting `undefined` on the wire.
 */

const NODE_PATH = {
    name: 'path',
    kind: 'path',
    label: 'path',
    required: true,
    defaultValue: '',
} as const;

function RevisionsRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledRevisionsQuery(
        str(values, 'path'),
        {
            pageLimit: values.pageLimit === undefined ? undefined : num(values, 'pageLimit'),
            pageOffset: values.pageOffset === undefined ? undefined : num(values, 'pageOffset'),
        },
        queryOptions,
        requestOptions,
    );
    return (
        <QueryResultPanel
            result={result}
            resultKind="json"
            guardedBy={['path']}
            guardSatisfied={str(values, 'path').length > 0}
        />
    );
}

function AssetBytesRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const hasId = values.id !== undefined;
    const result = useTiledAssetBytesQuery(
        str(values, 'path'),
        hasId
            ? { id: num(values, 'id'), relative_path: str(values, 'relative_path') || undefined }
            : undefined,
        queryOptions,
        requestOptions,
    );
    return (
        <QueryResultPanel
            result={result}
            resultKind="bytes"
            guardedBy={['path', 'id']}
            guardSatisfied={str(values, 'path').length > 0 && hasId}
        />
    );
}

function AssetManifestRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const hasId = values.id !== undefined;
    const result = useTiledAssetManifestQuery(
        str(values, 'path'),
        hasId ? { id: num(values, 'id') } : undefined,
        queryOptions,
        requestOptions,
    );
    return (
        <QueryResultPanel
            result={result}
            resultKind="json"
            guardedBy={['path', 'id']}
            guardSatisfied={str(values, 'path').length > 0 && hasId}
        />
    );
}

function WebhooksRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledWebhooksQuery(str(values, 'path'), queryOptions, requestOptions);
    return (
        <QueryResultPanel
            result={result}
            resultKind="json"
            guardedBy={['path']}
            guardSatisfied={str(values, 'path').length > 0}
        />
    );
}

function WebhookHistoryRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const hasId = values.webhookId !== undefined;
    const result = useTiledWebhookHistoryQuery(
        hasId ? num(values, 'webhookId') : undefined,
        { limit: values.limit === undefined ? undefined : num(values, 'limit') },
        queryOptions,
        requestOptions,
    );
    return (
        <QueryResultPanel
            result={result}
            resultKind="json"
            guardedBy={['webhookId']}
            guardSatisfied={hasId}
        />
    );
}

export const managementQueryDescriptors: readonly QueryDescriptor[] = [
    {
        id: 'management.revisions',
        kind: 'query',
        group: 'management',
        hookName: 'useTiledRevisionsQuery',
        summary: "A node's metadata revision history — the audit trail behind the write hooks.",
        fields: [
            NODE_PATH,
            { name: 'pageLimit', kind: 'number', label: 'pageLimit' },
            { name: 'pageOffset', kind: 'number', label: 'pageOffset' },
        ],
        guardedBy: ['path'],
        resultKind: 'json',
        Runner: RevisionsRunner,
    },
    {
        id: 'asset.bytes',
        kind: 'query',
        group: 'asset',
        hookName: 'useTiledAssetBytesQuery',
        summary: 'The file as stored, bypassing the structure layer. Needs an asset id.',
        fields: [
            NODE_PATH,
            {
                name: 'id',
                kind: 'number',
                label: 'id',
                description: "from the node's data_sources[].assets[].id",
                required: true,
            },
            { name: 'relative_path', kind: 'text', label: 'relative_path' },
        ],
        guardedBy: ['path', 'id'],
        resultKind: 'bytes',
        Runner: AssetBytesRunner,
    },
    {
        id: 'asset.manifest',
        kind: 'query',
        group: 'asset',
        hookName: 'useTiledAssetManifestQuery',
        summary: 'The file list of a directory-shaped asset.',
        fields: [NODE_PATH, { name: 'id', kind: 'number', label: 'id', required: true }],
        guardedBy: ['path', 'id'],
        resultKind: 'json',
        Runner: AssetManifestRunner,
    },
    {
        id: 'webhooks.list',
        kind: 'query',
        group: 'webhooks',
        hookName: 'useTiledWebhooksQuery',
        summary: 'The webhooks registered on a node.',
        fields: [NODE_PATH],
        guardedBy: ['path'],
        resultKind: 'json',
        Runner: WebhooksRunner,
    },
    {
        id: 'webhooks.history',
        kind: 'query',
        group: 'webhooks',
        hookName: 'useTiledWebhookHistoryQuery',
        summary: 'Delivery attempts for one webhook. Idles until an id is given.',
        fields: [
            { name: 'webhookId', kind: 'number', label: 'webhookId', required: true },
            { name: 'limit', kind: 'number', label: 'limit' },
        ],
        guardedBy: ['webhookId'],
        resultKind: 'json',
        Runner: WebhookHistoryRunner,
    },
];
