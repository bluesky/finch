# Generated types — do not hand-edit

`schema.d.ts` is machine output from [`openapi-typescript`](https://www.npmjs.com/package/openapi-typescript),
derived from `../openapi.json` (which was fetched from a running queue server at
`http://localhost:60610/openapi.json`).

## Regenerating

1. Refresh the spec if the server version changed:

    ```sh
    curl -s http://localhost:60610/openapi.json | python3 -m json.tool > src/api/qServer_new/openapi.json
    ```

2. Regenerate and format (the format step keeps `npm run format` green):

    ```sh
    npx openapi-typescript@^7 src/api/qServer_new/openapi.json \
        -o src/api/qServer_new/generated/schema.d.ts
    npx prettier --write src/api/qServer_new/generated/schema.d.ts
    ```

3. Run `npm run test:run -- src/testing/tests/QServerNewRegistry.test.tsx`.
   That suite fails if the spec gained or lost an operation, which is the signal
   to add or remove the corresponding entry in `../types/paths.ts`, a client
   method, and a registry descriptor.

`openapi-typescript` is intentionally **not** a project dependency — it is a
one-shot codegen tool run via `npx`.

## What these types are good for

The queue-server spec declares almost every domain endpoint as
`requestBody: {additionalProperties: true}` / `responses: {200: {schema: {}}}`,
so the generated `operations` carry no useful body or response shapes for
status, queue, plans, devices, history, run engine, tasks, locks or console.

Two things here _are_ authoritative and are used for real type safety:

- `paths` / `operations` key unions — every URL in `../types/paths.ts` is checked
  against `keyof paths`, and a type-level assertion makes a newly added spec path
  a compile error until it is registered.
- `components['schemas']` — the 12 auth-related schemas (`Principal`, `APIKey`,
  `APIKeyWithSecret`, `APIKeyRequestParams`, `AccessAndRefreshTokens`,
  `RefreshToken`, `Session`, `Identity`, `PrincipalType`, `HTTPValidationError`,
  `ValidationError`, and the spreadsheet upload body). These are re-exported with
  readable names from `../types/generatedAliases.ts`.

Domain response shapes are hand-written in `../types/*.ts`.
