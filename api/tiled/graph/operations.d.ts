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
export declare const GRAPH_ENTITY = "\n    query TiledGraphEntity($id: ID!) {\n        entity(id: $id) {\n            ...TiledGraphEntityFields\n        }\n    }\n    \n    fragment TiledGraphEntityFields on Entity {\n        id\n        isNodeBound\n        entityType\n        name\n        uri\n        properties\n        createdAt\n    }\n\n";
export declare const GRAPH_ENTITIES = "\n    query TiledGraphEntities(\n        $entityType: String\n        $nodePathParts: [String!]\n        $limit: Int! = 100\n        $offset: Int! = 0\n    ) {\n        entities(\n            entityType: $entityType\n            nodePathParts: $nodePathParts\n            limit: $limit\n            offset: $offset\n        ) {\n            ...TiledGraphEntityFields\n        }\n    }\n    \n    fragment TiledGraphEntityFields on Entity {\n        id\n        isNodeBound\n        entityType\n        name\n        uri\n        properties\n        createdAt\n    }\n\n";
export declare const GRAPH_LINK = "\n    query TiledGraphLink($id: ID!) {\n        link(id: $id) {\n            ...TiledGraphLinkFields\n        }\n    }\n    \n    fragment TiledGraphLinkFields on Link {\n        id\n        subjectId\n        predicate\n        objectId\n        properties\n        accessTags\n        createdAt\n    }\n\n";
export declare const GRAPH_LINKS = "\n    query TiledGraphLinks(\n        $subjectId: ID\n        $predicate: String\n        $objectId: ID\n        $limit: Int! = 100\n        $offset: Int! = 0\n    ) {\n        links(\n            subjectId: $subjectId\n            predicate: $predicate\n            objectId: $objectId\n            limit: $limit\n            offset: $offset\n        ) {\n            ...TiledGraphLinkFields\n        }\n    }\n    \n    fragment TiledGraphLinkFields on Link {\n        id\n        subjectId\n        predicate\n        objectId\n        properties\n        accessTags\n        createdAt\n    }\n\n";
export declare const GRAPH_NAMESPACES = "\n    query TiledGraphNamespaces {\n        namespaces {\n            prefix\n            uri\n        }\n    }\n";
export declare const GRAPH_CREATE_ENTITY = "\n    mutation TiledGraphCreateEntity($input: CreateEntityInput!) {\n        createEntity(input: $input) {\n            ...TiledGraphEntityFields\n        }\n    }\n    \n    fragment TiledGraphEntityFields on Entity {\n        id\n        isNodeBound\n        entityType\n        name\n        uri\n        properties\n        createdAt\n    }\n\n";
export declare const GRAPH_UPDATE_ENTITY = "\n    mutation TiledGraphUpdateEntity($id: ID!, $input: UpdateEntityInput!) {\n        updateEntity(id: $id, input: $input) {\n            ...TiledGraphEntityFields\n        }\n    }\n    \n    fragment TiledGraphEntityFields on Entity {\n        id\n        isNodeBound\n        entityType\n        name\n        uri\n        properties\n        createdAt\n    }\n\n";
export declare const GRAPH_DELETE_ENTITY = "\n    mutation TiledGraphDeleteEntity($id: ID!) {\n        deleteEntity(id: $id)\n    }\n";
export declare const GRAPH_CREATE_LINK = "\n    mutation TiledGraphCreateLink($input: CreateLinkInput!) {\n        createLink(input: $input) {\n            ...TiledGraphLinkFields\n        }\n    }\n    \n    fragment TiledGraphLinkFields on Link {\n        id\n        subjectId\n        predicate\n        objectId\n        properties\n        accessTags\n        createdAt\n    }\n\n";
export declare const GRAPH_UPDATE_LINK = "\n    mutation TiledGraphUpdateLink($id: ID!, $input: UpdateLinkInput!) {\n        updateLink(id: $id, input: $input) {\n            ...TiledGraphLinkFields\n        }\n    }\n    \n    fragment TiledGraphLinkFields on Link {\n        id\n        subjectId\n        predicate\n        objectId\n        properties\n        accessTags\n        createdAt\n    }\n\n";
export declare const GRAPH_DELETE_LINK = "\n    mutation TiledGraphDeleteLink($id: ID!) {\n        deleteLink(id: $id)\n    }\n";
export declare const GRAPH_UPSERT_NAMESPACE = "\n    mutation TiledGraphUpsertNamespace($prefix: String!, $uri: String!) {\n        upsertNamespace(prefix: $prefix, uri: $uri) {\n            prefix\n            uri\n        }\n    }\n";
export declare const GRAPH_DELETE_NAMESPACE = "\n    mutation TiledGraphDeleteNamespace($prefix: String!) {\n        deleteNamespace(prefix: $prefix)\n    }\n";
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
export declare const TILED_GRAPH_OPERATIONS: readonly TiledGraphOperation[];
/**
 * The oldest Tiled release whose graph API these documents match.
 *
 * The graph has shipped since 0.2.15, but 0.2.15–0.2.18 have an older shape — an entity exposes
 * `nodeId` instead of `isNodeBound`, is bound by `nodeId` instead of `nodePathParts`, and access
 * control is `accessBlob` instead of `accessTags` — so every entity and link document fails
 * validation there. Only the namespace operations work on both.
 */
export declare const TILED_GRAPH_MIN_VERSION = "0.2.19";
/**
 * The first field newer than the server's graph API that `errors` complain about, or `undefined`.
 *
 * Matches the messages a Tiled 0.2.18 server actually returns for these documents, e.g.
 * `Cannot query field 'isNodeBound' on type 'Entity'.` — so a caller gets "upgrade the server"
 * rather than a validation error that reads like a bug in Finch.
 */
export declare function fieldMissingFromOlderGraphApi(errors: readonly {
    message: string;
}[] | undefined): string | undefined;
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
export declare function graphOperationKinds(document: string): TiledGraphOperationKind[];
/** The operation name a document declares, for error messages. `undefined` for anonymous ones. */
export declare function graphOperationName(document: string): string | undefined;
//# sourceMappingURL=operations.d.ts.map