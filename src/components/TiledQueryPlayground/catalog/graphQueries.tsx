/* eslint-disable react-refresh/only-export-components --
 * A Runner has to live beside its descriptor; see `managementQueries.tsx` for the reasoning.
 */
import {
    useTiledGraphEntitiesQuery,
    useTiledGraphEntityQuery,
    useTiledGraphLinkQuery,
    useTiledGraphLinksQuery,
    useTiledGraphNamespacesQuery,
    useTiledGraphNodeEntitiesQuery,
    useTiledGraphQLQuery,
} from '@/api/tiled';
import type { TiledGraphQLVariables } from '@/api/tiled';
import QueryResultPanel from '../QueryResultPanel';
import { json, list, num, str, type QueryDescriptor, type QueryRunnerProps } from '../types';

/**
 * The graph of links — `{origin}/api/graphql`, on catalog-backed servers only.
 *
 * Reads never fail for want of an API key: the server filters instead of refusing, so a server
 * with an access policy returns empty lists and one without returns everything. A server with no
 * graph router answers every one of these with a 404 that says so.
 */

const PAGE_FIELDS = [
    { name: 'limit', kind: 'number', label: 'limit', defaultValue: 100 },
    { name: 'offset', kind: 'number', label: 'offset', defaultValue: 0 },
] as const;

/** `undefined` for a blank field, so the server's own default applies. */
function optionalNumber(values: Record<string, unknown>, name: string): number | undefined {
    return values[name] === undefined || values[name] === '' ? undefined : num(values, name);
}

function optionalString(values: Record<string, unknown>, name: string): string | undefined {
    return str(values, name) || undefined;
}

const PROJECT_SAMPLES = `query ProjectMembers($id: ID!, $predicate: String) {
  entity(id: $id) {
    id
    name
    incomingLinks(predicate: $predicate) {
      subject { id name entityType isNodeBound }
    }
  }
}`;

function GraphQLRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledGraphQLQuery(
        str(values, 'document'),
        json<TiledGraphQLVariables>(values, 'variables'),
        queryOptions,
        requestOptions,
    );
    return (
        <QueryResultPanel
            result={result}
            resultKind="json"
            guardedBy={['document']}
            guardSatisfied={str(values, 'document').trim().length > 0}
        />
    );
}

function EntityRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledGraphEntityQuery(str(values, 'id'), queryOptions, requestOptions);
    return (
        <QueryResultPanel
            result={result}
            resultKind="json"
            guardedBy={['id']}
            guardSatisfied={str(values, 'id').length > 0}
        />
    );
}

function EntitiesRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledGraphEntitiesQuery(
        {
            entityType: optionalString(values, 'entityType'),
            nodePathParts: list(values, 'nodePathParts'),
            limit: optionalNumber(values, 'limit'),
            offset: optionalNumber(values, 'offset'),
        },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" />;
}

function NodeEntitiesRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledGraphNodeEntitiesQuery(
        str(values, 'path'),
        {
            entityType: optionalString(values, 'entityType'),
            limit: optionalNumber(values, 'limit'),
            offset: optionalNumber(values, 'offset'),
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

function LinkRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledGraphLinkQuery(str(values, 'id'), queryOptions, requestOptions);
    return (
        <QueryResultPanel
            result={result}
            resultKind="json"
            guardedBy={['id']}
            guardSatisfied={str(values, 'id').length > 0}
        />
    );
}

function LinksRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledGraphLinksQuery(
        {
            subjectId: optionalString(values, 'subjectId'),
            predicate: optionalString(values, 'predicate'),
            objectId: optionalString(values, 'objectId'),
            limit: optionalNumber(values, 'limit'),
            offset: optionalNumber(values, 'offset'),
        },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" />;
}

function NamespacesRunner({ queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledGraphNamespacesQuery(queryOptions, requestOptions);
    return <QueryResultPanel result={result} resultKind="json" />;
}

export const graphQueryDescriptors: readonly QueryDescriptor[] = [
    {
        id: 'graph.raw',
        kind: 'query',
        group: 'graph',
        hookName: 'useTiledGraphQLQuery',
        summary:
            'Any GraphQL query — nested traversal in one request. Idles until a document is given.',
        fields: [
            {
                name: 'document',
                kind: 'multilineText',
                label: 'document',
                required: true,
                defaultValue: PROJECT_SAMPLES,
            },
            {
                name: 'variables',
                kind: 'json',
                label: 'variables',
                defaultValue: { id: '', predicate: 'schema:isPartOf' },
            },
        ],
        guardedBy: ['document'],
        resultKind: 'json',
        Runner: GraphQLRunner,
    },
    {
        id: 'graph.entity',
        kind: 'query',
        group: 'graph',
        hookName: 'useTiledGraphEntityQuery',
        summary: 'One entity by id. Idles until an id is given.',
        fields: [{ name: 'id', kind: 'text', label: 'id', required: true }],
        guardedBy: ['id'],
        resultKind: 'json',
        Runner: EntityRunner,
    },
    {
        id: 'graph.entities',
        kind: 'query',
        group: 'graph',
        hookName: 'useTiledGraphEntitiesQuery',
        summary: 'A page of entities, by type and/or bound catalog node.',
        fields: [
            { name: 'entityType', kind: 'text', label: 'entityType', defaultValue: '' },
            {
                name: 'nodePathParts',
                kind: 'stringList',
                label: 'nodePathParts',
                description: 'Key segments of a catalog node, e.g. raw, S001',
            },
            ...PAGE_FIELDS,
        ],
        resultKind: 'json',
        Runner: EntitiesRunner,
    },
    {
        id: 'graph.nodeEntities',
        kind: 'query',
        group: 'graph',
        hookName: 'useTiledGraphNodeEntitiesQuery',
        summary:
            'The entities bound to one catalog node, e.g. a Bluesky run. Idles until a path is given.',
        fields: [
            { name: 'path', kind: 'path', label: 'path', required: true, defaultValue: '' },
            { name: 'entityType', kind: 'text', label: 'entityType', defaultValue: '' },
            ...PAGE_FIELDS,
        ],
        guardedBy: ['path'],
        resultKind: 'json',
        Runner: NodeEntitiesRunner,
    },
    {
        id: 'graph.link',
        kind: 'query',
        group: 'graph',
        hookName: 'useTiledGraphLinkQuery',
        summary: 'One link by id. Idles until an id is given.',
        fields: [{ name: 'id', kind: 'text', label: 'id', required: true }],
        guardedBy: ['id'],
        resultKind: 'json',
        Runner: LinkRunner,
    },
    {
        id: 'graph.links',
        kind: 'query',
        group: 'graph',
        hookName: 'useTiledGraphLinksQuery',
        summary: 'A page of links, by subject, predicate (CURIEs accepted) and/or object.',
        fields: [
            { name: 'subjectId', kind: 'text', label: 'subjectId' },
            { name: 'predicate', kind: 'text', label: 'predicate', defaultValue: '' },
            { name: 'objectId', kind: 'text', label: 'objectId' },
            ...PAGE_FIELDS,
        ],
        resultKind: 'json',
        Runner: LinksRunner,
    },
    {
        id: 'graph.namespaces',
        kind: 'query',
        group: 'graph',
        hookName: 'useTiledGraphNamespacesQuery',
        summary: 'The registered CURIE prefixes.',
        fields: [],
        resultKind: 'json',
        Runner: NamespacesRunner,
    },
];
