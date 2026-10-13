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

/**
 * The oldest Tiled release whose graph API these documents match.
 *
 * The graph has shipped since 0.2.15, but 0.2.15–0.2.18 have an older shape — an entity exposes
 * `nodeId` instead of `isNodeBound`, is bound by `nodeId` instead of `nodePathParts`, and access
 * control is `accessBlob` instead of `accessTags` — so every entity and link document fails
 * validation there. Only the namespace operations work on both.
 */
export const TILED_GRAPH_MIN_VERSION = '0.2.19';

/** Fields and arguments these documents use that first appeared in {@link TILED_GRAPH_MIN_VERSION}. */
const FIELDS_ADDED_IN_MIN_VERSION = ['isNodeBound', 'nodePathParts', 'accessTags'] as const;

/** GraphQL validation messages that mean "this schema does not have that name". */
const UNKNOWN_NAME = /Cannot query field|Unknown argument|is not defined by type/;

/**
 * The first field newer than the server's graph API that `errors` complain about, or `undefined`.
 *
 * Matches the messages a Tiled 0.2.18 server actually returns for these documents, e.g.
 * `Cannot query field 'isNodeBound' on type 'Entity'.` — so a caller gets "upgrade the server"
 * rather than a validation error that reads like a bug in Finch.
 */
export function fieldMissingFromOlderGraphApi(
    errors: readonly { message: string }[] | undefined,
): string | undefined {
    for (const { message } of errors ?? []) {
        if (!UNKNOWN_NAME.test(message)) continue;
        const field = FIELDS_ADDED_IN_MIN_VERSION.find((name) => message.includes(`'${name}'`));
        if (field) return field;
    }
    return undefined;
}

/** The kind of each operation a GraphQL document defines. */
export type TiledGraphOperationKind = 'query' | 'mutation' | 'subscription';

/**
 * The kind of every operation `document` defines, in order: `query` for a `query …` definition or
 * the `{ … }` shorthand, `mutation`, `subscription`. Fragments are not operations and are skipped.
 *
 * A small scanner rather than the `graphql` package's parser, which is a devDependency only: it
 * looks at top-level definitions and skips what could otherwise fool it — `#` comments, strings and
 * block strings, and parentheses, whose variable defaults and directive arguments may hold `{ }`.
 * It classifies; it does not validate. An unparseable document yields whatever it could see, and
 * the server reports the rest.
 *
 * ```ts
 * graphOperationKinds('{ entities { id } }');                       // ['query']
 * graphOperationKinds('mutation ($i: CreateLinkInput!) { … }');     // ['mutation']
 * graphOperationKinds('fragment F on Entity { id } query { … }');   // ['query']
 * ```
 */
export function graphOperationKinds(document: string): TiledGraphOperationKind[] {
    const kinds: TiledGraphOperationKind[] = [];
    let braces = 0;
    let parens = 0;
    // A definition keyword was read at the top level; its own `{` opens its body, not a shorthand.
    let awaitingBody = false;
    let i = 0;
    const n = document.length;

    while (i < n) {
        const c = document[i];
        if (c === '#') {
            while (i < n && document[i] !== '\n' && document[i] !== '\r') i++;
        } else if (document.startsWith('"""', i)) {
            i += 3;
            while (i < n && !document.startsWith('"""', i)) {
                i += document.startsWith('\\"""', i) ? 4 : 1;
            }
            i += 3;
        } else if (c === '"') {
            i++;
            while (i < n && document[i] !== '"' && document[i] !== '\n') {
                i += document[i] === '\\' ? 2 : 1;
            }
            i++;
        } else if (c === '(') {
            parens++;
            i++;
        } else if (c === ')') {
            parens = Math.max(0, parens - 1);
            i++;
        } else if (c === '{' && parens === 0) {
            if (braces === 0) {
                if (!awaitingBody) kinds.push('query');
                awaitingBody = false;
            }
            braces++;
            i++;
        } else if (c === '}' && parens === 0) {
            braces = Math.max(0, braces - 1);
            i++;
        } else if (/[_A-Za-z]/.test(c)) {
            const start = i;
            while (i < n && /[_0-9A-Za-z]/.test(document[i])) i++;
            if (braces === 0 && parens === 0 && !awaitingBody) {
                const word = document.slice(start, i);
                if (word === 'query' || word === 'mutation' || word === 'subscription') {
                    kinds.push(word);
                    awaitingBody = true;
                } else if (word === 'fragment') {
                    awaitingBody = true;
                }
            }
        } else {
            i++;
        }
    }
    return kinds;
}

/** The operation name a document declares, for error messages. `undefined` for anonymous ones. */
export function graphOperationName(document: string): string | undefined {
    return /\b(?:query|mutation|subscription)\s+([_A-Za-z][_0-9A-Za-z]*)/.exec(document)?.[1];
}
