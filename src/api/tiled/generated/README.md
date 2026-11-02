# Generated types — do not hand-edit

`schema.d.ts` is machine output from [`openapi-typescript`](https://www.npmjs.com/package/openapi-typescript),
derived from `../openapi.json` (fetched from a running Tiled server at
`http://localhost:8000/openapi.json`, Tiled 0.2.15b1).

## Regenerating

1. Refresh the spec if the server version changed:

    ```sh
    curl -s http://localhost:8000/openapi.json | python3 -m json.tool > src/api/tiled/openapi.json
    ```

2. Regenerate and format (the format step keeps `npm run format` green):

    ```sh
    npx openapi-typescript@^7 src/api/tiled/openapi.json \
        -o src/api/tiled/generated/schema.d.ts
    npx prettier --write src/api/tiled/generated/schema.d.ts
    ```

3. Run `npm run test:run -- src/testing/tests/TiledRegistry.test.ts`.
   That suite fails if the spec gained or lost an operation, which is the signal
   to add or remove the corresponding entry in `../types/paths.ts`, a client
   method, and a registry descriptor.

`openapi-typescript` is intentionally **not** a project dependency — it is a
one-shot codegen tool run via `npx`.

## What these types are good for

**Almost everything.** This is the opposite of the queue server's situation, where
the spec declares every domain body and response as an untyped object and
`generated/schema.d.ts` is authoritative only for the path unions. Tiled's spec is
precise, so the generated file is the source of truth for:

- `paths` / `operations` key unions — every URL in `../types/paths.ts` is checked
  against `keyof paths`, and a type-level assertion makes a newly added spec path
  a compile error until it is registered.
- **Request bodies** — `PostMetadataRequest`, `PutMetadataRequest`,
  `PatchMetadataRequest`, `PutDataSourceRequest`, `WebhookRegistrationRequest`.
- **Structures** — `ArrayStructure`, `TableStructure`, `AwkwardStructure`,
  `COOStructure`, `RaggedStructure`, `NodeStructure`, `BuiltinDtype`,
  `StructDtype`, `Field`.
- **Enums** — `StructureFamily`, `EntryFields`, `EventType`, `Management`,
  `Operator`.
- **Envelopes** — `About`, `NodeAttributes`, the `Resource_*` / `Response_*`
  wrappers, `GetDistinctResponse`, `WebhookResponse`, `DeliveryResponse`,
  `HTTPValidationError`.

These are re-exported with readable names from `../types/generatedAliases.ts`.
Hand-written types are confined to three places: `../types/auth.ts` (the auth
routes are **not in the spec** — see `../README.md`), `../types/searchFilters.ts`
(which deliberately widens the six JSON-valued filter values), and response
shapes the spec declares as bare `unknown`.
