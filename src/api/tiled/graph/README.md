# Graph of links — schema snapshot

`schema.graphql` is the GraphQL SDL of Tiled's entity/link graph, exported from upstream source at
**bluesky/tiled@849c984a**, whose `tiled/graph/` is byte-identical to the **v0.2.19rc2** release.
It is not in `../openapi.json`: the graph is served by a Strawberry GraphQL router at
`{origin}/api/graphql`, outside the `/api/v1` version segment, and only on catalog-backed servers.

## Compatibility: Tiled 0.2.19 or later

The graph has shipped since Tiled 0.2.15, but its API changed in 0.2.19, and this client targets
the newer shape (`TILED_GRAPH_MIN_VERSION` in `operations.ts`):

| | 0.2.15 – 0.2.18 | 0.2.19rc1 and later |
| --- | --- | --- |
| Entity's node | `nodeId: Int` | `isNodeBound: Boolean` |
| Bind on create | `nodeId` | `nodePathParts: ['raw', 'S001']` |
| Node lookup | `catalogNodeId(path)` query | removed |
| Filter entities by node | — | `entities(nodePathParts: …)` |
| Access control | `accessBlob` | `accessTags` |

Against a 0.2.18 server every entity and link operation fails GraphQL validation (verified against a
live 0.2.18); only the namespace operations work. The client recognises those validation messages
and rejects with "this Tiled server's graph API is older than 0.2.19 … upgrade the server", keeping
the server's own message after it. Supporting both shapes is deliberately out of scope: the older one
is gone upstream, and the API is still moving (see below).

`operations.ts` holds every document the client sends, and is the **only** file that spells a
graph field name. `TiledGraph.test.tsx` validates each of those documents against this snapshot and
diffs the snapshot's `Query` / `Mutation` fields against `TILED_GRAPH_OPERATIONS`, so a schema
change surfaces as a failing test — the GraphQL counterpart of `TiledRegistry.test.ts`.

## Regenerating

From a Python environment with the target Tiled installed:

```sh
python -c "from tiled.graph.schema import schema; print(schema.as_str())" > /tmp/schema.graphql
```

or against a running server, with any GraphQL introspection tool, e.g.
`npx get-graphql-schema http://localhost:8000/api/graphql`.

Keep the one-line provenance comment at the top of `schema.graphql` and update the commit above.
Then run:

```sh
npm run test:run -- src/testing/tests/TiledGraph.test.tsx
```

A renamed or removed field fails document validation; a new query or mutation fails the
completeness check, which is the signal to add a document, a client method, a hook, a registry
descriptor and a playground entry.

## Known upstream changes

- **#1499** renames `entityType` → `kind` and adds a unique `(node, kind, name)` constraint with an
  `ENTITY_EXISTS` error.
- **#1500** moves entity/link ids to UUIDs (still `ID` on the wire) and adds a `name` filter to
  `entities`.
- **#1457** JSON-LD import/export; **#1487** a graph web UI.
