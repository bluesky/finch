import type {
    TiledGraphCreateEntityInput,
    TiledGraphCreateLinkInput,
    TiledGraphEntityFilters,
    TiledGraphLinkFilters,
    TiledGraphUpdateEntityInput,
    TiledGraphUpdateLinkInput,
} from '../types/graph';
import {
    payloadAs,
    type TiledEndpointDescriptor,
    type TiledGraphOperationDescriptor,
} from '../types/registry';

/**
 * The graph-of-links operations, one per root field of `../graph/schema.graphql`.
 *
 * `call` takes the operation's GraphQL variables as a plain object — the same names the server
 * declares — so a harness can render one JSON editor for any of them.
 *
 * Destructive means "changes or removes something that already exists". Creating an entity or a
 * link only adds; `upsertNamespace` can replace an existing prefix's URI and so re-render every
 * predicate, which is why it is flagged.
 */
export const graphEndpointDescriptors: readonly TiledGraphOperationDescriptor[] = [
    {
        id: 'graph.entity',
        group: 'graph',
        kind: 'query',
        field: 'entity',
        fn: 'getGraphEntity',
        summary: 'One entity by id.',
        sampleVariables: { id: '' },
        call: (client, vars) => client.getGraphEntity(String(vars.id ?? '')),
    },
    {
        id: 'graph.entities',
        group: 'graph',
        kind: 'query',
        field: 'entities',
        fn: 'getGraphEntities',
        summary: 'A page of entities, by type and/or bound catalog node.',
        sampleVariables: { entityType: 'project', limit: 100, offset: 0 },
        call: (client, vars) => client.getGraphEntities(vars as TiledGraphEntityFilters),
    },
    {
        id: 'graph.link',
        group: 'graph',
        kind: 'query',
        field: 'link',
        fn: 'getGraphLink',
        summary: 'One link by id.',
        sampleVariables: { id: '' },
        call: (client, vars) => client.getGraphLink(String(vars.id ?? '')),
    },
    {
        id: 'graph.links',
        group: 'graph',
        kind: 'query',
        field: 'links',
        fn: 'getGraphLinks',
        summary: 'A page of links, by subject, predicate and/or object.',
        sampleVariables: { predicate: 'schema:isPartOf', limit: 100, offset: 0 },
        call: (client, vars) => client.getGraphLinks(vars as TiledGraphLinkFilters),
    },
    {
        id: 'graph.namespaces',
        group: 'graph',
        kind: 'query',
        field: 'namespaces',
        fn: 'getGraphNamespaces',
        summary: 'The registered CURIE prefixes.',
        call: (client) => client.getGraphNamespaces(),
    },
    {
        id: 'graph.createEntity',
        group: 'graph',
        kind: 'mutation',
        field: 'createEntity',
        fn: 'createGraphEntity',
        summary: 'Create an entity, optionally bound to a catalog node.',
        sampleVariables: { input: { entityType: 'project', name: 'example-project' } },
        call: (client, vars) => client.createGraphEntity(vars.input as TiledGraphCreateEntityInput),
    },
    {
        id: 'graph.updateEntity',
        group: 'graph',
        kind: 'mutation',
        field: 'updateEntity',
        fn: 'updateGraphEntity',
        summary: 'Change an entity. Omitted fields are untouched; null clears.',
        destructive: true,
        sampleVariables: { id: '', input: { name: 'renamed' } },
        call: (client, vars) =>
            client.updateGraphEntity(
                String(vars.id ?? ''),
                vars.input as TiledGraphUpdateEntityInput,
            ),
    },
    {
        id: 'graph.deleteEntity',
        group: 'graph',
        kind: 'mutation',
        field: 'deleteEntity',
        fn: 'deleteGraphEntity',
        summary: 'Delete an entity and every link attached to it.',
        destructive: true,
        sampleVariables: { id: '' },
        call: (client, vars) => client.deleteGraphEntity(String(vars.id ?? '')),
    },
    {
        id: 'graph.createLink',
        group: 'graph',
        kind: 'mutation',
        field: 'createLink',
        fn: 'createGraphLink',
        summary: 'Link two entities: subject —predicate→ object.',
        sampleVariables: {
            input: { subjectId: '', predicate: 'schema:isPartOf', objectId: '' },
        },
        call: (client, vars) => client.createGraphLink(vars.input as TiledGraphCreateLinkInput),
    },
    {
        id: 'graph.updateLink',
        group: 'graph',
        kind: 'mutation',
        field: 'updateLink',
        fn: 'updateGraphLink',
        summary: "Change a link's predicate or access tags.",
        destructive: true,
        sampleVariables: { id: '', input: { predicate: 'schema:isPartOf' } },
        call: (client, vars) =>
            client.updateGraphLink(String(vars.id ?? ''), vars.input as TiledGraphUpdateLinkInput),
    },
    {
        id: 'graph.deleteLink',
        group: 'graph',
        kind: 'mutation',
        field: 'deleteLink',
        fn: 'deleteGraphLink',
        summary: 'Delete one link.',
        destructive: true,
        sampleVariables: { id: '' },
        call: (client, vars) => client.deleteGraphLink(String(vars.id ?? '')),
    },
    {
        id: 'graph.upsertNamespace',
        group: 'graph',
        kind: 'mutation',
        field: 'upsertNamespace',
        fn: 'upsertGraphNamespace',
        summary: 'Register or replace a CURIE prefix.',
        destructive: true,
        sampleVariables: { prefix: 'schema', uri: 'https://schema.org/' },
        call: (client, vars) =>
            client.upsertGraphNamespace(String(vars.prefix ?? ''), String(vars.uri ?? '')),
    },
    {
        id: 'graph.deleteNamespace',
        group: 'graph',
        kind: 'mutation',
        field: 'deleteNamespace',
        fn: 'deleteGraphNamespace',
        summary: 'Remove a CURIE prefix.',
        destructive: true,
        sampleVariables: { prefix: '' },
        call: (client, vars) => client.deleteGraphNamespace(String(vars.prefix ?? '')),
    },
];

/**
 * The GraphQL route itself, as `openapi.json` declares it — two operations, `POST` and `GET`.
 *
 * These are REST descriptors, in `TILED_ENDPOINTS` with the rest of the spec, because since Tiled
 * 0.2.19 the spec lists the route and `TiledRegistry.test.ts` holds every spec operation to a
 * descriptor. They carry a whole GraphQL document; the per-field operations above are the typed view.
 *
 * `POST` runs anything, mutations included, so it is flagged destructive. `GET` runs queries only —
 * the server refuses a mutation sent that way — and needs a `query`, so a read-only sweep skips it.
 */
export const graphTransportEndpointDescriptors: readonly TiledEndpointDescriptor[] = [
    {
        id: 'graph.execute',
        group: 'graph',
        method: 'POST',
        path: '/api/graphql',
        operationId: 'handle_http_post_api_graphql_post',
        fn: 'graphql',
        summary: 'Run any GraphQL document. Can write.',
        destructive: true,
        sampleBody: { query: '{ namespaces { prefix uri } }', variables: {} },
        call: (client, input) => {
            const { query, variables } = payloadAs<{
                query?: string;
                variables?: Record<string, unknown>;
            }>(input);
            return client.graphql(query ?? '', variables ?? {});
        },
    },
    {
        id: 'graph.executeViaGet',
        group: 'graph',
        method: 'GET',
        path: '/api/graphql',
        operationId: 'handle_http_get_api_graphql_get',
        fn: 'graphqlGet',
        summary: 'Run a GraphQL query from the URL. Queries only.',
        params: [
            { name: 'query', in: 'query', required: true, description: 'A GraphQL query' },
            {
                name: 'variables',
                in: 'query',
                required: false,
                description: 'Its variables, as a JSON object',
            },
        ],
        call: (client, input) =>
            client.graphqlGet(
                input.params?.query ?? '',
                input.params?.variables
                    ? (JSON.parse(input.params.variables) as Record<string, unknown>)
                    : {},
            ),
    },
];
