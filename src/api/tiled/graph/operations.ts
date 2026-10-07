/**
 * Every GraphQL document the client sends to Tiled's graph endpoint.
 *
 * **This is the only file that spells a graph field name.** The graph API is experimental and
 * upstream is still renaming things (#1499 turns `entityType` into `kind`), so keeping every
 * selection here means such a rename is an edit to this file and `../types/graph.ts`, and
 * `TiledGraph.test.tsx` — which validates each document against `schema.graphql` — says exactly
 * which documents broke.
 *
 * Selections are deliberately one level deep: an entity's fields, a link's fields with ids for its
 * ends. Nested traversal (`incomingLinks { subject { … } }`) is what `TiledApiClient.graphql` is
 * for; the server caps nesting depth at 10.
 *
 * `limit` / `offset` are declared `Int!` with the server's own defaults, so leaving them out of the
 * variables gets the server default rather than an explicit `null` the server would reject.
 */

const ENTITY_FIELDS = /* GraphQL */ `
    fragment TiledGraphEntityFields on Entity {
        id
        isNodeBound
        entityType
        name
        uri
        properties
        createdAt
    }
`;

const LINK_FIELDS = /* GraphQL */ `
    fragment TiledGraphLinkFields on Link {
        id
        subjectId
        predicate
        objectId
        properties
        accessTags
        createdAt
    }
`;

// #region queries

export const GRAPH_ENTITY = /* GraphQL */ `
    query TiledGraphEntity($id: ID!) {
        entity(id: $id) {
            ...TiledGraphEntityFields
        }
    }
    ${ENTITY_FIELDS}
`;

export const GRAPH_ENTITIES = /* GraphQL */ `
    query TiledGraphEntities(
        $entityType: String
        $nodePathParts: [String!]
        $limit: Int! = 100
        $offset: Int! = 0
    ) {
        entities(
            entityType: $entityType
            nodePathParts: $nodePathParts
            limit: $limit
            offset: $offset
        ) {
            ...TiledGraphEntityFields
        }
    }
    ${ENTITY_FIELDS}
`;

export const GRAPH_LINK = /* GraphQL */ `
    query TiledGraphLink($id: ID!) {
        link(id: $id) {
            ...TiledGraphLinkFields
        }
    }
    ${LINK_FIELDS}
`;

export const GRAPH_LINKS = /* GraphQL */ `
    query TiledGraphLinks(
        $subjectId: ID
        $predicate: String
        $objectId: ID
        $limit: Int! = 100
        $offset: Int! = 0
    ) {
        links(
            subjectId: $subjectId
            predicate: $predicate
            objectId: $objectId
            limit: $limit
            offset: $offset
        ) {
            ...TiledGraphLinkFields
        }
    }
    ${LINK_FIELDS}
`;

export const GRAPH_NAMESPACES = /* GraphQL */ `
    query TiledGraphNamespaces {
        namespaces {
            prefix
            uri
        }
    }
`;

// #endregion

// #region mutations

export const GRAPH_CREATE_ENTITY = /* GraphQL */ `
    mutation TiledGraphCreateEntity($input: CreateEntityInput!) {
        createEntity(input: $input) {
            ...TiledGraphEntityFields
        }
    }
    ${ENTITY_FIELDS}
`;

export const GRAPH_UPDATE_ENTITY = /* GraphQL */ `
    mutation TiledGraphUpdateEntity($id: ID!, $input: UpdateEntityInput!) {
        updateEntity(id: $id, input: $input) {
            ...TiledGraphEntityFields
        }
    }
    ${ENTITY_FIELDS}
`;

export const GRAPH_DELETE_ENTITY = /* GraphQL */ `
    mutation TiledGraphDeleteEntity($id: ID!) {
        deleteEntity(id: $id)
    }
`;

export const GRAPH_CREATE_LINK = /* GraphQL */ `
    mutation TiledGraphCreateLink($input: CreateLinkInput!) {
        createLink(input: $input) {
            ...TiledGraphLinkFields
        }
    }
    ${LINK_FIELDS}
`;

export const GRAPH_UPDATE_LINK = /* GraphQL */ `
    mutation TiledGraphUpdateLink($id: ID!, $input: UpdateLinkInput!) {
        updateLink(id: $id, input: $input) {
            ...TiledGraphLinkFields
        }
    }
    ${LINK_FIELDS}
`;

export const GRAPH_DELETE_LINK = /* GraphQL */ `
    mutation TiledGraphDeleteLink($id: ID!) {
        deleteLink(id: $id)
    }
`;

export const GRAPH_UPSERT_NAMESPACE = /* GraphQL */ `
    mutation TiledGraphUpsertNamespace($prefix: String!, $uri: String!) {
        upsertNamespace(prefix: $prefix, uri: $uri) {
            prefix
            uri
        }
    }
`;

export const GRAPH_DELETE_NAMESPACE = /* GraphQL */ `
    mutation TiledGraphDeleteNamespace($prefix: String!) {
        deleteNamespace(prefix: $prefix)
    }
`;

// #endregion

/** One operation the client implements, described as data. */
export interface TiledGraphOperation {
    /** The GraphQL operation name, which also prefixes error messages. */
    name: string;
    kind: 'query' | 'mutation';
    /** The root `Query` / `Mutation` field it selects — what the completeness test diffs. */
    field: string;
    document: string;
}

/**
 * Every operation, one per root field of the schema. `TiledGraph.test.tsx` fails when the schema has
 * a root field this list does not, or the reverse.
 */
export const TILED_GRAPH_OPERATIONS: readonly TiledGraphOperation[] = [
    { name: 'TiledGraphEntity', kind: 'query', field: 'entity', document: GRAPH_ENTITY },
    { name: 'TiledGraphEntities', kind: 'query', field: 'entities', document: GRAPH_ENTITIES },
    { name: 'TiledGraphLink', kind: 'query', field: 'link', document: GRAPH_LINK },
    { name: 'TiledGraphLinks', kind: 'query', field: 'links', document: GRAPH_LINKS },
    {
        name: 'TiledGraphNamespaces',
        kind: 'query',
        field: 'namespaces',
        document: GRAPH_NAMESPACES,
    },
    {
        name: 'TiledGraphCreateEntity',
        kind: 'mutation',
        field: 'createEntity',
        document: GRAPH_CREATE_ENTITY,
    },
    {
        name: 'TiledGraphUpdateEntity',
        kind: 'mutation',
        field: 'updateEntity',
        document: GRAPH_UPDATE_ENTITY,
    },
    {
        name: 'TiledGraphDeleteEntity',
        kind: 'mutation',
        field: 'deleteEntity',
        document: GRAPH_DELETE_ENTITY,
    },
    {
        name: 'TiledGraphCreateLink',
        kind: 'mutation',
        field: 'createLink',
        document: GRAPH_CREATE_LINK,
    },
    {
        name: 'TiledGraphUpdateLink',
        kind: 'mutation',
        field: 'updateLink',
        document: GRAPH_UPDATE_LINK,
    },
    {
        name: 'TiledGraphDeleteLink',
        kind: 'mutation',
        field: 'deleteLink',
        document: GRAPH_DELETE_LINK,
    },
    {
        name: 'TiledGraphUpsertNamespace',
        kind: 'mutation',
        field: 'upsertNamespace',
        document: GRAPH_UPSERT_NAMESPACE,
    },
    {
        name: 'TiledGraphDeleteNamespace',
        kind: 'mutation',
        field: 'deleteNamespace',
        document: GRAPH_DELETE_NAMESPACE,
    },
];

/** The operation name a document declares, for error messages. `undefined` for anonymous ones. */
export function graphOperationName(document: string): string | undefined {
    return /\b(?:query|mutation|subscription)\s+([_A-Za-z][_0-9A-Za-z]*)/.exec(document)?.[1];
}
