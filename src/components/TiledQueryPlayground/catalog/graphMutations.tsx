/* eslint-disable react-refresh/only-export-components --
 * A Runner has to live beside its descriptor; see `managementQueries.tsx` for the reasoning.
 */
import {
    useTiledCreateGraphEntityMutation,
    useTiledCreateGraphLinkMutation,
    useTiledDeleteGraphEntityMutation,
    useTiledDeleteGraphLinkMutation,
    useTiledDeleteGraphNamespaceMutation,
    useTiledGraphQLMutation,
    useTiledUpdateGraphEntityMutation,
    useTiledUpdateGraphLinkMutation,
    useTiledUpsertGraphNamespaceMutation,
} from '@/api/tiled';
import type {
    TiledGraphCreateEntityInput,
    TiledGraphCreateLinkInput,
    TiledGraphQLVariables,
    TiledGraphUpdateEntityInput,
    TiledGraphUpdateLinkInput,
} from '@/api/tiled';
import MutationResultPanel from '../MutationResultPanel';
import { json, str, type MutationDescriptor, type MutationRunnerProps } from '../types';

/**
 * Writes to the graph of links. All need `write:metadata`, and every one refreshes every graph read.
 *
 * Creating only adds, so those two run without a prompt. Note that on upstream `main` nothing stops
 * a second entity with the same type and name.
 */

const ID_FIELD = { name: 'id', kind: 'text', label: 'id', required: true } as const;

function GraphQLMutationRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledGraphQLMutation(undefined, requestOptions);
    const document = str(values, 'document');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledGraphQLMutation"
            canRun={document.trim().length > 0}
            onRun={() =>
                confirm('Send this GraphQL mutation') &&
                mutation.mutate({
                    document,
                    variables: json<TiledGraphQLVariables>(values, 'variables'),
                })
            }
        />
    );
}

function CreateEntityRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledCreateGraphEntityMutation(undefined, requestOptions);
    const input = json<TiledGraphCreateEntityInput>(values, 'input');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledCreateGraphEntityMutation"
            canRun={input !== undefined}
            onRun={() =>
                input && confirm(`Create entity "${input.name}"`) && mutation.mutate(input)
            }
        />
    );
}

function UpdateEntityRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledUpdateGraphEntityMutation(undefined, requestOptions);
    const input = json<TiledGraphUpdateEntityInput>(values, 'input');
    const id = str(values, 'id');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledUpdateGraphEntityMutation"
            canRun={id.length > 0 && input !== undefined}
            onRun={() => input && confirm(`Update entity ${id}`) && mutation.mutate({ id, input })}
        />
    );
}

function DeleteEntityRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledDeleteGraphEntityMutation(undefined, requestOptions);
    const id = str(values, 'id');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledDeleteGraphEntityMutation"
            canRun={id.length > 0}
            onRun={() =>
                confirm(`Delete entity ${id} and every link attached to it`) &&
                mutation.mutate({ id })
            }
        />
    );
}

function CreateLinkRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledCreateGraphLinkMutation(undefined, requestOptions);
    const input = json<TiledGraphCreateLinkInput>(values, 'input');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledCreateGraphLinkMutation"
            canRun={input !== undefined}
            onRun={() =>
                input &&
                confirm(`Link ${input.subjectId} —${input.predicate}→ ${input.objectId}`) &&
                mutation.mutate(input)
            }
        />
    );
}

function UpdateLinkRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledUpdateGraphLinkMutation(undefined, requestOptions);
    const input = json<TiledGraphUpdateLinkInput>(values, 'input');
    const id = str(values, 'id');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledUpdateGraphLinkMutation"
            canRun={id.length > 0 && input !== undefined}
            onRun={() => input && confirm(`Update link ${id}`) && mutation.mutate({ id, input })}
        />
    );
}

function DeleteLinkRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledDeleteGraphLinkMutation(undefined, requestOptions);
    const id = str(values, 'id');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledDeleteGraphLinkMutation"
            canRun={id.length > 0}
            onRun={() => confirm(`Delete link ${id}`) && mutation.mutate({ id })}
        />
    );
}

function UpsertNamespaceRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledUpsertGraphNamespaceMutation(undefined, requestOptions);
    const prefix = str(values, 'prefix');
    const uri = str(values, 'uri');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledUpsertGraphNamespaceMutation"
            canRun={prefix.length > 0 && uri.length > 0}
            onRun={() =>
                confirm(`Map prefix "${prefix}" to ${uri}`) && mutation.mutate({ prefix, uri })
            }
        />
    );
}

function DeleteNamespaceRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledDeleteGraphNamespaceMutation(undefined, requestOptions);
    const prefix = str(values, 'prefix');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledDeleteGraphNamespaceMutation"
            canRun={prefix.length > 0}
            onRun={() => confirm(`Remove prefix "${prefix}"`) && mutation.mutate({ prefix })}
        />
    );
}

export const graphMutationDescriptors: readonly MutationDescriptor[] = [
    {
        id: 'graph.rawMutation',
        kind: 'mutation',
        group: 'graph',
        hookName: 'useTiledGraphQLMutation',
        summary: 'Any GraphQL mutation. A failing aliased field can follow committed ones.',
        destructive: true,
        fields: [
            {
                name: 'document',
                kind: 'multilineText',
                label: 'document',
                required: true,
                defaultValue:
                    'mutation ($input: CreateEntityInput!) {\n  createEntity(input: $input) { id name }\n}',
            },
            {
                name: 'variables',
                kind: 'json',
                label: 'variables',
                defaultValue: { input: { entityType: 'sample', name: 'S001' } },
            },
        ],
        resultKind: 'json',
        Runner: GraphQLMutationRunner,
    },
    {
        id: 'graph.createEntity',
        kind: 'mutation',
        group: 'graph',
        hookName: 'useTiledCreateGraphEntityMutation',
        summary: 'Create an entity, optionally bound to a catalog node by nodePathParts.',
        fields: [
            {
                name: 'input',
                kind: 'json',
                label: 'input',
                required: true,
                defaultValue: { entityType: 'project', name: 'example-project' },
            },
        ],
        resultKind: 'json',
        Runner: CreateEntityRunner,
    },
    {
        id: 'graph.updateEntity',
        kind: 'mutation',
        group: 'graph',
        hookName: 'useTiledUpdateGraphEntityMutation',
        summary: 'Change an entity. Omitted fields are untouched; null clears (detaches a node).',
        destructive: true,
        fields: [
            ID_FIELD,
            {
                name: 'input',
                kind: 'json',
                label: 'input',
                required: true,
                defaultValue: { name: 'renamed' },
            },
        ],
        resultKind: 'json',
        Runner: UpdateEntityRunner,
    },
    {
        id: 'graph.deleteEntity',
        kind: 'mutation',
        group: 'graph',
        hookName: 'useTiledDeleteGraphEntityMutation',
        summary: 'Delete an entity and every link attached to it.',
        destructive: true,
        fields: [ID_FIELD],
        resultKind: 'json',
        Runner: DeleteEntityRunner,
    },
    {
        id: 'graph.createLink',
        kind: 'mutation',
        group: 'graph',
        hookName: 'useTiledCreateGraphLinkMutation',
        summary: 'Link two entities: subject —predicate→ object.',
        fields: [
            {
                name: 'input',
                kind: 'json',
                label: 'input',
                required: true,
                defaultValue: { subjectId: '', predicate: 'schema:isPartOf', objectId: '' },
            },
        ],
        resultKind: 'json',
        Runner: CreateLinkRunner,
    },
    {
        id: 'graph.updateLink',
        kind: 'mutation',
        group: 'graph',
        hookName: 'useTiledUpdateGraphLinkMutation',
        summary: "Change a link's predicate or access tags.",
        destructive: true,
        fields: [
            ID_FIELD,
            {
                name: 'input',
                kind: 'json',
                label: 'input',
                required: true,
                defaultValue: { predicate: 'schema:isPartOf' },
            },
        ],
        resultKind: 'json',
        Runner: UpdateLinkRunner,
    },
    {
        id: 'graph.deleteLink',
        kind: 'mutation',
        group: 'graph',
        hookName: 'useTiledDeleteGraphLinkMutation',
        summary: 'Delete one link.',
        destructive: true,
        fields: [ID_FIELD],
        resultKind: 'json',
        Runner: DeleteLinkRunner,
    },
    {
        id: 'graph.upsertNamespace',
        kind: 'mutation',
        group: 'graph',
        hookName: 'useTiledUpsertGraphNamespaceMutation',
        summary: 'Register or replace a CURIE prefix.',
        destructive: true,
        fields: [
            {
                name: 'prefix',
                kind: 'text',
                label: 'prefix',
                required: true,
                defaultValue: 'schema',
            },
            {
                name: 'uri',
                kind: 'text',
                label: 'uri',
                required: true,
                defaultValue: 'https://schema.org/',
            },
        ],
        resultKind: 'json',
        Runner: UpsertNamespaceRunner,
    },
    {
        id: 'graph.deleteNamespace',
        kind: 'mutation',
        group: 'graph',
        hookName: 'useTiledDeleteGraphNamespaceMutation',
        summary: 'Remove a CURIE prefix.',
        destructive: true,
        fields: [{ name: 'prefix', kind: 'text', label: 'prefix', required: true }],
        resultKind: 'json',
        Runner: DeleteNamespaceRunner,
    },
];
