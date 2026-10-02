/* eslint-disable react-refresh/only-export-components --
 * A Runner has to live beside its descriptor; see `infoQueries.tsx` for the reasoning.
 */
import {
    useTiledCreateNodeMutation,
    useTiledDeleteNodeMutation,
    useTiledPatchMetadataMutation,
    useTiledUpdateMetadataMutation,
} from '@/api/tiled';
import type { PatchMetadataRequest, PostMetadataRequest, PutMetadataRequest } from '@/api/tiled';
import MutationResultPanel from '../MutationResultPanel';
import { bool, json, str, type MutationDescriptor, type MutationRunnerProps } from '../types';

/**
 * Metadata writes.
 *
 * These are the ones worth pairing with a pinned `metadata.get` or `search.search`: they invalidate
 * the `metadata` and `search` bundles, so the cache inspector should show those entries refetching
 * the moment one succeeds.
 */

const PARENT_PATH = {
    name: 'parentPath',
    kind: 'path',
    label: 'parentPath',
    description: 'the container to create INSIDE; the new node’s key goes in body.id',
    defaultValue: '',
} as const;

const NODE_PATH = {
    name: 'path',
    kind: 'path',
    label: 'path',
    required: true,
    defaultValue: '',
} as const;

const DROP_REVISION = {
    name: 'drop_revision',
    kind: 'boolean',
    label: 'drop_revision',
    description: 'skip recording this change in the revision history',
} as const;

function CreateNodeRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledCreateNodeMutation(undefined, requestOptions);
    const body = json<PostMetadataRequest>(values, 'body');

    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledCreateNodeMutation"
            canRun={body !== undefined}
            onRun={() =>
                body &&
                confirm(`Create a node in "${str(values, 'parentPath') || '(root)'}"`) &&
                mutation.mutate({ parentPath: str(values, 'parentPath'), body })
            }
        />
    );
}

function UpdateMetadataRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledUpdateMetadataMutation(undefined, requestOptions);
    const body = json<PutMetadataRequest>(values, 'body');

    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledUpdateMetadataMutation"
            canRun={body !== undefined && str(values, 'path').length > 0}
            onRun={() =>
                body &&
                confirm(`Replace the metadata of "${str(values, 'path')}"`) &&
                mutation.mutate({
                    path: str(values, 'path'),
                    body,
                    drop_revision: bool(values, 'drop_revision'),
                })
            }
        />
    );
}

function PatchMetadataRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPatchMetadataMutation(undefined, requestOptions);
    const mode = str(values, 'mode', 'merge') as 'merge' | 'json-patch';

    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPatchMetadataMutation"
            canRun={str(values, 'path').length > 0}
            onRun={() =>
                confirm(`Patch the metadata of "${str(values, 'path')}" (${mode})`) &&
                mutation.mutate({
                    path: str(values, 'path'),
                    mode,
                    metadata: json<PatchMetadataRequest['metadata']>(values, 'metadata'),
                    specs: json<PatchMetadataRequest['specs']>(values, 'specs') ?? null,
                    drop_revision: bool(values, 'drop_revision'),
                })
            }
        />
    );
}

function DeleteNodeRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledDeleteNodeMutation(undefined, requestOptions);
    const recursive = bool(values, 'recursive');

    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledDeleteNodeMutation"
            canRun={str(values, 'path').length > 0}
            onRun={() =>
                confirm(
                    `DELETE "${str(values, 'path')}"${recursive ? ' and everything under it' : ''}`,
                ) &&
                mutation.mutate({
                    path: str(values, 'path'),
                    recursive,
                    // Undefined rather than false when unticked, so the server's own default
                    // (true — refuse if internally-managed data is affected) still applies.
                    external_only: bool(values, 'external_only') ? false : undefined,
                })
            }
        />
    );
}

export const metadataMutationDescriptors: readonly MutationDescriptor[] = [
    {
        id: 'metadata.create',
        kind: 'mutation',
        group: 'metadata',
        hookName: 'useTiledCreateNodeMutation',
        summary:
            'Create a node inside a container. The path is the PARENT; body.id names the child.',
        fields: [
            PARENT_PATH,
            {
                name: 'body',
                kind: 'json',
                label: 'body',
                required: true,
                defaultValue: {
                    id: 'finch-playground',
                    structure_family: 'container',
                    metadata: { created_by: 'playground' },
                    data_sources: [],
                    specs: [],
                    access_blob: {},
                },
            },
        ],
        resultKind: 'json',
        Runner: CreateNodeRunner,
    },
    {
        id: 'metadata.update',
        kind: 'mutation',
        group: 'metadata',
        hookName: 'useTiledUpdateMetadataMutation',
        summary: 'Replace metadata, specs and access blob wholesale. Absent fields are cleared.',
        destructive: true,
        fields: [
            NODE_PATH,
            {
                name: 'body',
                kind: 'json',
                label: 'body',
                required: true,
                defaultValue: { metadata: { note: 'edited by the playground' }, specs: [] },
            },
            DROP_REVISION,
        ],
        resultKind: 'json',
        Runner: UpdateMetadataRunner,
    },
    {
        id: 'metadata.patch',
        kind: 'mutation',
        group: 'metadata',
        hookName: 'useTiledPatchMetadataMutation',
        summary: 'Partial update. merge sets the given keys; json-patch takes RFC 6902 operations.',
        destructive: true,
        fields: [
            NODE_PATH,
            {
                name: 'mode',
                kind: 'enum',
                label: 'mode',
                enums: ['merge', 'json-patch'],
                defaultValue: 'merge',
                description: 'json-patch is how you remove a key',
            },
            {
                name: 'metadata',
                kind: 'json',
                label: 'metadata',
                description: 'an object in merge mode, an operation list in json-patch mode',
                defaultValue: { note: 'patched by the playground' },
            },
            { name: 'specs', kind: 'json', label: 'specs' },
            DROP_REVISION,
        ],
        resultKind: 'json',
        Runner: PatchMetadataRunner,
    },
    {
        id: 'metadata.delete',
        kind: 'mutation',
        group: 'metadata',
        hookName: 'useTiledDeleteNodeMutation',
        summary: 'Delete a node. Not undoable.',
        destructive: true,
        fields: [
            NODE_PATH,
            { name: 'recursive', kind: 'boolean', label: 'recursive', description: 'children too' },
            {
                name: 'external_only',
                kind: 'boolean',
                label: 'allow deleting managed data',
                description:
                    'sends external_only=false. Without it the server refuses with 409 when the tree holds internally-managed data',
            },
        ],
        resultKind: 'json',
        Runner: DeleteNodeRunner,
    },
];
