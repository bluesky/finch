# SKILLS — working in `src/api/tiled`

Terse map for anyone (human or agent) changing this folder. Prose docs are in `README.md`.

## File map

```
index.ts                   public barrel — client + hooks + runtime + types + free functions
openapi.json               the spec, fetched from a live server; the coverage test's input
endpointRegistry.ts        TILED_ENDPOINTS + groups + labels + getReadOnlyEndpoints/getWriteEndpoints
README.md / SKILLS.md      docs

generated/
  schema.d.ts              openapi-typescript output — DO NOT hand-edit
  README.md                the regeneration command

client/
  TiledApiClient.ts        the class: config, auth, 401 refresh, funnels, every endpoint method
  defaultClient.ts         module singleton + global setters (setGlobalTiledApiKey, …)
  facade.ts                one flat free function per operation, bound to the singleton
  interceptorRegistry.ts   COPIED from qServer — keep the two in sync
  urlUtils.ts              base URL / origin derivation, path normalisation + per-segment encoding
  formats.ts               format name <-> media type <-> axios responseType, JSON-seq parser
  searchParams.ts          filter + option encoding (the four wire-format corrections live here)
  arraySlicing.ts          downsampling maths, ported from upstream TiledArrayApi
  tokenStorage.ts          injectable login-token store; localStorage keys shared with <Tiled>

endpoints/
  readEndpoints.ts         registry descriptors: info, search, metadata GET, data reads, assets
  writeEndpoints.ts        registry descriptors: writes, auth, zarr

types/
  paths.ts                 TILED_PATHS (spec paths) + toClientPath + buildPath + completeness assert
  generatedAliases.ts      readable names over generated/schema.d.ts; structures are `Schema`-prefixed
  structures.ts            Finch's structure types (ports) + family guards
  nodes.ts                 TiledSearchItem, TiledSearchResult, metadata, table rows
  info.ts                  TiledInfoResponse + auth links + isValidTiledInfoResponse
  requestOptions.ts        TiledRequestOptions — the transport contract
  dataOptions.ts           array/table/node option + return maps, and the endpoint/transport split
  searchFilters.ts         all 15 filters; six values widened to take real values
  errors.ts                TiledApiError + toTiledApiError
  registry.ts              descriptor types + payloadAs/numberParam/tupleParam
  common.ts                the re-export hub + interceptor types
  index.ts                 barrel

runtime/
  clientLike.ts            TiledClientLike = Pick<TiledApiClient, ~68> + TILED_CLIENT_LIKE_METHODS
  TiledApiProvider.tsx     client context + useTiledApiClient / useTiledApiClientOptional
  index.ts                 barrel

hooks/
  types.ts                 TiledHookError + re-export of the shared Finch option types
  errors.ts                TiledEndpointUnavailableError
  queryKeys.ts             14 roots + key builders; scope LAST, and carries initialPath
  invalidation.ts          bundles + mutation->bundle map + useTiledInvalidate
  useTiledClient.ts        resolver: provider -> Finch-configured singleton; useTiledQueryScope()
  internal/
    keyParts.ts            projects cache-relevant fields out of the endpoint options
    useTiledQuery.ts       the one query engine
    useTiledMutation.ts    the one mutation engine
  searchHooks.ts           7 queries, all on the `search` root
  distinctHooks.ts         1 query (faceting)
  metadataHooks.ts         1 query + 4 mutations
  arrayHooks.ts            5 queries + useTiledArrayImagePath (NOT a query) + 3 mutations
  tableHooks.ts            8 queries + 3 mutations
  nodeHooks.ts             container / node / awkward / ragged — 7 queries + 5 mutations
  managementHooks.ts       revisions, assets, webhooks, register, data source, stream — 5q + 6m
  infoHooks.ts             5 queries
  authHooks.ts             1 query + 6 mutations
  typeTests.ts             compile-time assertions (tsconfig excludes src/testing, so they live here)
  index.ts                 barrel
```

Shared with the queue server, under `src/api/shared/` — change any of it and you change both backends:

| file                | what                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `queryOptions.ts`   | `FinchQueryOptions` / `FinchMutationOptions`, `resolveEnabled`, **and the canonical slot order** |
| `requestOptions.ts` | the transport contract, `mergeRequestOptions`, `combineAbortSignals`, `stripUndefined`           |
| `queryKeys.ts`      | `FinchQueryScope`, `INJECTED_CLIENT_SCOPE`, the 4-element key contract                           |
| `errors.ts`         | `FinchHookError`, `FinchMissingArgumentError`, `requireArg`                                      |
| `invalidation.ts`   | `resolveInvalidationRoots` + `invalidateRoots` (the pure halves)                                 |

## Adding an endpoint

The spec is the source of truth and the coverage test enforces it. Five steps, in this order:

1. **`types/paths.ts`** — add the spec path. `_AssertNoMissingPaths` already failed the build if you
   regenerated the schema without doing this.
2. **`client/TiledApiClient.ts`** — add the method. Use the `get`/`post`/`put`/`patch`/`del` funnels,
   or `sendBinary` for a binary body. Node paths go through `this.dataPath(...)`, never `buildPath`.
3. **`client/facade.ts`** — add the free function.
4. **`runtime/clientLike.ts`** — add the method name to *both* the `Pick` and
   `TILED_CLIENT_LIKE_METHODS` (the `satisfies` makes one without the other a compile error).
5. **`endpoints/*.ts`** — add the descriptor, with the spec's `operationId`.

Then the hook: see below.

## Adding a hook

Hooks are written out explicitly, never generated by a factory — a factory would erase hover types,
JSDoc and the endpoint's own argument names. Each body is ~10 lines over the shared engine in
`hooks/internal/`.

Call shape: positional — `useTiledXQuery(...endpointArgs, queryOptions?, requestOptions?)` and
`useTiledXMutation(mutationOptions?, requestOptions?)`. **`requestOptions` is always last and always
means transport**, on this backend and the queue server alike. Array, table and node hooks carry an
extra endpoint slot because the client's option types merge endpoint parameters with transport and
the hooks do not — they `Omit` the transport keys and recombine in `fetch`. Mutation variables go
through `mutate(variables)`, never the hook.

1. Add the resource to `tiledQueryRoots` + `tiledQueryKeys` if it is not one of the existing fourteen.
2. Write the hook in the matching `hooks/<domain>Hooks.ts`, with `@param` docs on every parameter.
3. If the hook takes an options object that mixes endpoint and transport fields, key it through a
   `keyParts` projection — never the object itself.
4. For a mutation, add its bundle list to `TILED_MUTATION_INVALIDATIONS`.
5. Export it from `hooks/index.ts`.

`TiledHooks.test.tsx` maps every `TILED_CLIENT_LIKE_METHODS` entry to a hook, so a client method
without one fails CI. The two zarr URL builders are the only entries mapped to `NOT_A_HOOK`.

## Invariants the tests enforce

`TiledRegistry.test.ts`:

- every operation in `openapi.json` has a descriptor, except the ten listed as intentionally
  unimplemented (the web UI's two, and the eight per-file zarr routes).
- no descriptor claims an `operationId` the spec does not declare, and each one's path and method
  match the spec's.
- only the `auth` group may carry `operationId: null` — otherwise the coverage check could be silenced.
- every descriptor names a real client method; ids are unique; every group is non-empty and labelled.
- every write is `destructive`, except `metadata.create` / `webhooks.register`; only the four
  body-carrying reads may set `readOnly`.
- `TILED_PATHS` and the spec's path list agree in both directions.

`TiledHooks.test.tsx`:

- key shape `['tiled', resource, args, { baseUrl, initialPath }]`, prefix `['tiled','search']` matching.
- all search variants land on the `search` root; identical filters share one entry.
- the scope forks on `baseUrl` and on `initialPath`; `pathMode: 'absolute'` blanks the prefix.
- a data key does not change when a fresh `signal` / `structure` / `arrayItem` is passed each render.
- Finch config reaches the first request AND is synced onto the singleton.
- an injected client is never redirected; `apiKey: null` passes through as `null`.
- guards: empty path is idle, `enabled: undefined` does not clobber the guard.
- unmount aborts the signal the client received; a caller signal also aborts it.
- a partial injected client throws `TiledEndpointUnavailableError` and never falls back to the network.
- `getServerInfo` resolving `null` is `data === null`, not `isError`.
- the three corrected filter parameter names, and the JSON-array encodings.

`TiledClient.test.ts`: path encoding, origin derivation, downsampling maths (including the
non-array-structure guard), format resolution, JSON-seq parsing, search option mapping, error
normalisation.

## Gotchas

- **Lists travel two different ways.** Repeated keys for `fields`/`sort`/`column`/`field`/`form_key`/
  `metadata`; one JSON array for `keys_filter.keys`, `in.value`, `notin.value`, `specs.*`. Getting it
  wrong is a silent no-op or a 500. Both forms are in `client/searchParams.ts` with the evidence.
- **`paramsSerializer: { indexes: null }` is load-bearing.** Axios otherwise writes `column[]=`,
  which FastAPI drops — so a column selection silently returns every column. Set on the instance
  *and* per request, so an adopted axios client behaves too.
- **Six filter values are JSON, not text.** `eq`, `noteq`, `comparison`, `contains`, `in`, `notin`.
  Callers pass real values; `searchParams.ts` encodes. Do not encode `fulltext`/`regex`/`like`/
  `lookup`/`structureFamily` — those are plain strings.
- **`POST /metadata/{path}` addresses the PARENT.** `body.id` names the child. Posting to the new
  node's intended path is a 404 `No such entry`.
- **`DELETE` defaults to `external_only: true`** server-side — a 409 on internally-managed data until
  you pass `false`.
- **Never put a raw options object in a query key.** A `signal` in a key refetches forever. Project
  through `keyParts.ts`.
- **`enabled` goes after the caller's spread**, with `??`. Before it, a caller spreading an options
  object containing `enabled: undefined` clobbers the guard and fetches with an empty path.
- **`initialPath` belongs in the cache scope.** The client prepends it to relative paths, so keying on
  `baseUrl` alone serves one prefix's data for another's.
- **Base URL includes `/api/v1`; origin-scoped routes derive the origin from it.** `/healthz`,
  `/tiled-ui-settings` and zarr are not under the version segment — pass `origin: true` in the
  request extras.
- **Node paths are encoded per segment.** `encodeTiledPath`, never `encodeURIComponent` on the whole
  path, or the separators become `%2F`. `buildPath` is for scalars only (`{webhook_id}`).
- **A structure may not be an array structure.** `resolveArrayStructure` validates `shape` before the
  downsampling maths touches it; a caller can point an array read at a table, and the server's 404 is
  a far better error than a `TypeError` from inside our arithmetic.
- **`getArrayAsImagePath` is synchronous.** It is a `useMemo` helper, not a query, and it cannot fetch
  structure for downsampling — the caller must pass `structure` or `arrayItem`.
- **`getArrayAsPng` is browser-only.** `responseType: 'blob'` is an XHR concept; under Node the
  result is not a `Blob`. Use `getArrayAsBuffer` outside a browser.
- **`getServerInfo` resolves `null` instead of throwing.** Deliberate and inherited — the login screen
  probes unknown servers. Use `getAbout` when you want the error.
- **`loginWithUsernamePassword` resolves `null` on a bad password.** Also deliberate.
- **The auth routes are not in `openapi.json`.** URLs come from `About.authentication.links`, which is
  `null` on a server with auth disabled. Descriptors carry `operationId: null`.
- **`interceptorRegistry.ts` is duplicated from qServer on purpose.** Fix bugs in both.
- **`@blueskyproject/tiled` is still installed, for the `<Tiled>` viewer only.** Nothing in this
  folder may import it. The viewer has its own client and singleton; only `localStorage` tokens are
  shared.
- **`src/components/Tiled/types/tempTypes.ts` is a stale duplicate** of the node/structure types, kept
  for the viewer's prop types. It still types `data_sources` as `string | null`, which is wrong. Do
  not add call sites; import from `@/api/tiled`.

## Verifying against a live server

The client was built and checked against Tiled 0.2.15b1. To re-verify after a change:

```ts
// run with: npx vite-node <file>.ts   (NOT vitest — the jsdom setup has no `window` in node env,
// and jsdom's XHR hits CORS. vite-node uses the axios http adapter and resolves `@/`.)
import { TiledApiClient } from '@/api/tiled';
import { getReadOnlyEndpoints } from '@/api/tiled/endpointRegistry';
```

Sweep `getReadOnlyEndpoints()` and call each descriptor's `call`. Endpoints for structure families
the server has no data for answer a clean 404 naming the mismatch — that is a pass, not a failure.

**CORS:** a Tiled dev server typically allows one origin. The client sets `withCredentials: true`
(inherited; Tiled's cookie session flows need it), which means the server must echo the origin rather
than answer `Access-Control-Allow-Origin: *`. Browser-side testing has to run on the allowed port.
