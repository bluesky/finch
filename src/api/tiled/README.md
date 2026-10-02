# Tiled API client (`tiled`)

A complete client for [Tiled](https://github.com/bluesky/tiled): **all 48 API operations** from
`openapi.json`, the seven auth routes the spec omits, zarr URL builders, and a TanStack Query hook
for every one of them.

Built on the client in
[tiled-viewer-react](https://github.com/bluesky/tiled-viewer-react/tree/main/src/components/Tiled/api)
— the read paths are ports, not rewrites — and shaped like
[`src/api/qServer`](../qServer/README.md), so the two backends are learnable as one thing: a
`TiledApiClient` class, a module-level default instance, a flat free-function facade, and hooks with
the same argument order, key shape and invalidation model.

> **This replaced a hook layer over `@blueskyproject/tiled`.** Nothing under `src/api/tiled` imports
> that package any more. Every name it used to re-export is exported from here with the same
> signature, so no call site changed — but the implementation is Finch's, the types come from Tiled's
> own OpenAPI schema, and the write half of the API exists for the first time.

## Quickstart

```ts
import { getTiledSearch, setDefaultTiledUrl, setGlobalTiledApiKey } from '@/api/tiled';

setDefaultTiledUrl('http://localhost:8000/api/v1'); // include the version segment
setGlobalTiledApiKey('…');

const runs = await getTiledSearch('', { searchFilters: { specs: { include: ['BlueskyRun'], exclude: [] } } });
console.log(runs.meta.count);
```

```tsx
import { useTiledSearchBySpecsQuery, useTiledMetadataQuery } from '@/api/tiled';

function RunBrowser() {
    const runs = useTiledSearchBySpecsQuery('', { include: ['BlueskyRun'], exclude: [] });
    const [selected, setSelected] = useState<string>();
    const item = useTiledMetadataQuery(selected ?? ''); // idle until something is selected

    if (runs.isPending) return <p>loading…</p>;
    if (runs.isError) return <p>{runs.error.message}</p>;
    return <ul>{runs.data.data.map((run) => <li key={run.id}>{run.id}</li>)}</ul>;
}
```

### The base URL includes the API version

`http://host:8000/api/v1`. Nothing appends it: guessing would silently point a misconfigured app at
a URL it never asked for. This is the opposite of the queue-server rule, where the base URL is the
bare origin because its spec paths already start with `/api/` — each is forced by its own server.

The handful of routes outside the version segment — `/healthz`, `/tiled-ui-settings`, every zarr
route — are issued against the origin derived from the base URL. `tiledOriginFromBaseUrl` drops
everything from the **last** `/api/v1`, so a server mounted under a sub-path works too.

## Three levels of control

```ts
// 1. the app-wide client
import { getTiledSearch, setGlobalTiledApiKey } from '@/api/tiled';
setGlobalTiledApiKey('another-key'); // affects the very next request; no rebuild
await getTiledSearch('');

// 2. your own instance
import { createTiledApiClient, setDefaultTiledApiClient } from '@/api/tiled';
const client = createTiledApiClient({
    baseUrl: 'http://localhost:8000/api/v1',
    apiKey: '…',
    client: myAxiosInstance, // optional: adopt an existing axios instance
    maxArrayBytes: 2_000_000,
});
setDefaultTiledApiClient(client); // optional: make it the app-wide one

// 3. one call at a time
await getTiledSearch('', undefined, {
    baseUrl: 'http://other-host:8000/api/v1',
    apiKey: 'one-off',
    signal: controller.signal,
});
```

Per-request options never touch client state. `resetDefaultTiledApiClient()` discards the singleton —
call it in `beforeEach` so tests do not leak configuration into one another.

### Authentication

| What | How |
| --- | --- |
| API key in a header | default; `Authorization: ApiKey <key>` (the casing the package sends) |
| Spec casing | `setGlobalTiledApiKeyScheme('Apikey')` |
| API key in the query | `setGlobalTiledApiKeyLocation('query')` → `?api_key=<key>` |
| Bearer token | `setDefaultBearerToken(jwt)`; takes precedence over the API key |
| No credentials, one call | `options.apiKey: null` — distinct from omitting it, which inherits |
| Refresh on 401 | automatic, single-flight, then one retry — but only when the call did not choose its own credentials and went to the configured server (see below). `/auth/session/refresh`, falling back to `/auth/refresh` on a 404 |

The key is read **at request time** by a built-in interceptor, which is why `setApiKey` takes effect
immediately.

#### The 401 refresh will not override you

Two conditions beyond "it was a 401" decide whether a refresh is attempted, and both exist so the
client cannot quietly undo a decision the caller made:

- **The caller did not choose this call's credentials.** A request sent with `apiKey: null`, a
  one-off key, or an explicit `Authorization` header already said what identity to use. Refreshing
  and retrying with the stored session's bearer token would substitute credentials the caller
  deliberately withheld — turning an intentionally anonymous probe into an authenticated one,
  invisibly. Such a call surfaces the 401 instead.
- **The request went to this client's own server.** The stored refresh token was issued by the
  configured server; a per-call `baseUrl` points somewhere else. The refresh always targets the
  configured server and is skipped entirely for a redirected call, so the token is never offered to
  a host that did not issue it.

`logout()` is the mirror image: it clears local credentials in a `finally` that covers endpoint
discovery as well as the request, so an unreachable server — or one with authentication disabled —
still logs you out of this tab. It rejects afterwards so the failure is reportable.

`'query'` mode exists for the two places a header cannot go: an `<img src>` built by
`getArrayAsImagePath`, and — once they land — websocket handshakes, which browsers will not let you
set headers on. Note it puts the key in the DOM and in any referrer logging.

**Login tokens are shared with the `<Tiled>` viewer component.** Both write `tiledAccessToken` and
`tiledRefreshToken` to `localStorage` under the same keys, so a login through either is a login for
both. Storage is injectable (`tokenStorage`), defaulting to `localStorage` in a browser and memory
elsewhere — which is what makes this work under SSR and keeps auth tests from leaking into one
another.

### The auth routes are not in the spec

Tiled generates `openapi.json` **without its auth router**, so there is no spec entry for `whoami`,
`apikey`, `refresh_session`, `revoke_session` or `logout`. What the spec does carry is
`AboutAuthenticationLinks`, so the client resolves every auth URL from `GET /api/v1/`'s
`authentication.links` rather than hard-coding paths.

A server with authentication disabled reports `{ required: false, providers: [], links: null }`
(verified against Tiled 0.2.15b1). Every auth method then fails with a `TiledApiError` saying so,
rather than requesting a URL built from `null`. Check
`useTiledServerInfoQuery().data?.authentication?.required` before offering a login UI at all.

### Interceptors

```ts
import { addRequestInterceptor, clearInterceptors, ejectInterceptor } from '@/api/tiled';

const handle = addRequestInterceptor((config) => {
    console.log(config.method, config.url);
    return config;
});

ejectInterceptor(handle);
clearInterceptors(); // removes only YOUR interceptors
```

The built-in auth and refresh handlers are tracked separately and survive `clearInterceptors()`.
`setAxiosClient(next)` re-installs everything — built-ins first, then yours in registration order.
Axios runs request interceptors last-registered-first, so yours sees the config *before*
`Authorization` is attached.

## Four wire-format corrections

These were found by probing a live Tiled 0.2.15b1, not by reading the spec — the spec says a
parameter's *type*, not how a list is serialised, and Tiled uses two different conventions. Each one
failed quietly under `@blueskyproject/tiled`.

**1. Three filter names were wrong.** FastAPI drops an unknown query parameter rather than rejecting
it, so these filters simply never applied and the search came back unfiltered — which reads as "the
filter matched everything", not as a bug.

| Filter | Package sent | Server expects |
| --- | --- | --- |
| `keysFilter` | `filter[keys][condition][keys][]` | `filter[keys_filter][condition][keys]` |
| `keyPresent` | `filter[key_present][condition][…]` | `filter[keypresent][condition][…]` |
| `accessBlob` | `filter[access_blob][condition][…]` | `filter[access_blob_filter][condition][…]` |

**2. Axios brackets array parameters by default.** `column[]=a&column[]=b` where FastAPI reads
`column=a&column=b`. So `column` and `field` selections silently returned *everything*, and `fields`
never narrowed a response. Fixed with `paramsSerializer: { indexes: null }` on every request.

**3. Four filters want one JSON array, not repeated keys.** `keys_filter.keys`, `in.value`,
`notin.value` and `specs.include`/`exclude` travel as
`filter[in][condition][value]=["count"]`. Sent as repeated keys, `in` matches nothing and
`keys_filter` answers **500**. `specs` additionally needs *both* `include` and `exclude` present —
sending one alone is a 500, which is why `TiledSpecsFilter` requires both.

**4. Filter values are JSON-encoded for you.** Six filters — `eq`, `noteq`, `comparison`,
`contains`, `in`, `notin` — have a `value` the server reads with `json.loads`, so matching the string
`xas_scan` requires sending `"xas_scan"`, quotes included. Pass the value itself:

```ts
useTiledSearchQuery('', { searchFilters: { contains: { key: 'start.plan_name', value: 'xas_scan' } } });
// on the wire: filter[contains][condition][value]="xas_scan"
```

`string | number | boolean | null` are all accepted. Encoding is unconditional — there is no attempt
to detect an already-encoded value, because it is not decidable (given `"5"`, is that the number 5
encoded, or the two-character string `5`?). Pre-quoting is a bug the widened types now catch.

## The hooks

One per operation, in [`hooks/`](./hooks). Arguments are positional, always in the same order:

```ts
useTiledSomethingQuery(...endpointArgs, queryOptions?, requestOptions?);
useTiledSomethingMutation(mutationOptions?, requestOptions?);
```

| position | what it is |
| --- | --- |
| the endpoint's own arguments | a path, a filter, a format — named and typed, so hover tells you what is required |
| TanStack options | `FinchQueryOptions` for queries, `FinchMutationOptions` for mutations |
| `requestOptions` | `baseUrl`, `apiKey`, `initialPath`, `pathMode`, `signal`, `client`, `headers`, `query`, `axiosConfig` |

**`requestOptions` is always last**, and means exactly the same thing on every Finch backend — where
this one call goes and who it is. The queue-server hooks use the identical order; the convention is
stated in full, once, in [`src/api/shared/queryOptions.ts`](../shared/queryOptions.ts). Transport
goes last because it is the rarest thing to pass, so the common call needs no placeholder.

Mutations take their arguments through `mutate`, so one hook instance performs many writes — the
path is part of the variables, not of the hook:

```ts
const patch = useTiledPatchMetadataMutation();
patch.mutate({ path: 'scan/1', metadata: { comment: 'calibration run' } });
```

**The array, table and node hooks take one extra slot** for the endpoint's own parameters, because
the client's option types merge them with transport (`TiledArrayRequestOptions extends
TiledRequestOptions`, so `stack` and `baseUrl` arrive in one object). The hooks split them apart and
recombine before calling through, so `requestOptions` does not mean two different things depending
on which hook you are looking at. `hooks/typeTests.ts` asserts that no transport key survives in the
endpoint types.

### What is covered

| Group | Queries | Mutations |
| --- | --- | --- |
| Search | `useTiledSearchQuery` + 6 filter conveniences, `useTiledDistinctQuery` | — |
| Metadata | `useTiledMetadataQuery` | create, update, patch, delete |
| Arrays | 4 formats, `useTiledArrayBlockQuery`, `useTiledArrayImagePath` | put full, put block, patch full |
| Ragged | `useTiledRaggedFullQuery` | put full, put block, patch full |
| Tables | 5 JSON reads, `useTiledTableFullAsQuery` (CSV/parquet/arrow/…), 2 POST reads | put partition, patch partition, put full |
| Containers / nodes | full reads + POST variants | put node full |
| Awkward | full, buffers, POST buffers | put full |
| Management | revisions, assets | register, put data source, delete revision, close stream |
| Webhooks | list, history | register, delete |
| Server info | about, health, UI settings, metrics | — |
| Auth | whoami | login, logout, API key create/revoke, session refresh/revoke |

### `useTiledDistinctQuery` is the one to know about

It did not exist before. It answers "which plan names are in this catalogue, and how many runs does
each have" in **one request**, over the same filters a search takes — so a facet count can be scoped
to the current query. The alternative was paginating the whole container client-side and counting.

```ts
const facets = useTiledDistinctQuery('', {
    metadata: ['start.plan_name'],
    counts: true,
    searchFilters: { comparison: { operator: 'gt', key: 'start.time', value: lastWeek } },
});
```

### Two return values that surprise people

- **`useTiledServerInfoQuery().data` can be `null`** — an unreachable server resolves `null` instead
  of throwing, so `isError` stays `false`. Inherited deliberately: the login screen probes servers it
  knows nothing about and needs an answer, not an exception. Use `useTiledAboutQuery` when you want
  the error.
- **`useTiledLoginMutation()` resolves `null` on a wrong password** rather than rejecting. A wrong
  password is an expected outcome of a login form. Check the resolved value, not `isError`.

### Guarded queries

`enabled` is applied **after** the caller's options, with `??` — so an options object carrying
`enabled: undefined` (trivially produced by spreading props) falls through to the guard instead of
clobbering it.

Every path-addressed query idles while its path is empty, so `useTiledMetadataQuery(selected ?? '')`
makes no request until something is selected. Queries whose argument cannot be defaulted —
`useTiledArrayBlockQuery`, the asset hooks, `useTiledWebhookHistoryQuery` — idle while it is
`undefined`, and raise `FinchMissingArgumentError` if `enabled: true` forces them past the guard.

## Writing data

```ts
const create = useTiledCreateNodeMutation();
const write = useTiledPutArrayFullMutation();

await create.mutateAsync({
    parentPath: '',            // the CONTAINER to create in, not the new node's path
    body: {
        id: 'processed',       // the new node's key; omit for a server-assigned uuid
        structure_family: 'array',
        metadata: {},
        specs: [],
        access_blob: {},
        data_sources: [{ /* … structure describing what you are about to write … */ }],
    },
});

await write.mutateAsync({ path: 'processed', data: new Float64Array([1, 2, 3, 4, 5, 6]) });
```

Three things to get right, all verified against a live server:

- **`POST /metadata/{path}` addresses the parent.** The new node's key goes in `body.id`. Posting to
  the path you want the node to have answers 404 `No such entry`.
- **An array or table node needs its structure up front**, in `data_sources[0].structure`. The server
  allocates from it and does not infer it later.
- **`DELETE` defaults to `external_only: true`**, which refuses with a 409 when any of the tree is
  internally managed — deleting those records would delete the underlying data files. Pass
  `external_only: false` to mean it.

Binary writes take an `ArrayBuffer`, a typed array or a `Blob`, sent as `application/octet-stream` in
the array's own dtype and C order — the server trusts the declared structure and does not convert. A
nested `number[][]` is sent as JSON instead. **Nothing converts one into the other**: a dtype
mismatch writes plausible-looking garbage rather than failing, so that encoding is left to the
caller, who knows the dtype.

Table writes additionally require an explicit `mimetype` (`'application/x-parquet'`, `'text/csv'`,
`'application/vnd.apache.arrow.file'`) because the server dispatches its reader on exactly that
header.

## Keys and invalidation

Keys are `['tiled', <resource>, <args | null>, { baseUrl, initialPath }]`, with fourteen resources.
The scope is last so prefixes like `['tiled','search']` still match.

**The scope carries `initialPath`, not just `baseUrl`.** Tiled prepends the client's initial path to
relative request paths, so the same relative path under two prefixes is two different pieces of data.
`pathMode: 'absolute'` resolves the prefix to `''`, because such a request ignores it entirely.

**Args are projections, never raw option objects** — see
[`hooks/internal/keyParts.ts`](./hooks/internal/keyParts.ts). An options object carries a `signal`
(a fresh identity most renders), possibly a `client`, and possibly a whole `arrayItem`. Keying on it
directly would rewrite the key every render and refetch forever, so only the fields that change the
response take part. `structure` / `arrayItem` are excluded on purpose — they only let the client skip
a metadata round-trip on the way to identical bytes.

The rule when adding an option is **include it unless it provably cannot change the bytes the server
sends**. `column` is the cautionary case: it narrows a table response, so leaving it out of the key
made a read of `['energy']` and a read of `['intensity']` one cache entry, and let each be served the
other's columns.

Mutations invalidate named bundles automatically, awaited before `mutateAsync` resolves. Three rules
decide the map:

- a **metadata write** refreshes that node and the searches that could have matched on what changed;
- a **data write** refreshes the data *and* the metadata, because a write can change a structure —
  `patchArrayFull` with `extend: true` grows the shape, and a cached structure saying otherwise is
  what the downsampling maths reads;
- a **create, delete or register** uses the `structure` bundle, which also covers the parent
  container's contents.

The API key is deliberately absent from every key: it would put a secret in the Devtools cache
inspector, and a credential change invalidates everything rather than one entry. That is why every
auth mutation invalidates `all`.

```ts
const invalidate = useTiledInvalidate();
await invalidate.roots('search');   // one resource
await invalidate.bundles('data');   // every structure family's payloads
await invalidate.all();
```

## Errors

Every failure is a `TiledApiError` carrying `status`, `method`, `path`, `responseBody`, and — for
FastAPI's 422 — `isValidationError` plus parsed `validationErrors`. The message is assembled from
whichever envelope Tiled used, so `GET /metadata/x failed with 404: No such entry` is what you get
rather than `Request failed with status code 404`.

```ts
import { isTiledApiError } from '@/api/tiled';

try {
    await createTiledNode('', body);
} catch (error) {
    if (isTiledApiError(error) && error.isValidationError) console.warn(error.validationErrors);
}
```

A cancelled request passes through untouched, so TanStack can still recognise the `AbortError`.
`TiledEndpointUnavailableError` is raised instead when a hook's method is missing from a client
injected through `TiledApiProvider`.

## Where the client comes from

1. the client injected via `TiledApiProvider`, if there is one — the seam that lets a stub drive
   hook-based components in tests and Storybook;
2. otherwise the module-level default client.

Setting `tiledApiUrl` / `tiledApiKey` on `FinchConfigProvider` is enough: those values are applied to
the default client *and* carried on every request, so even the first fetch of the first render uses
the configured server. Absent Finch config the client's own configuration stands. An **injected
client is never redirected** — it is the caller's explicit choice, so Finch config is ignored for
that subtree.

A partial injected client (a hand-written stub missing some methods) makes the affected hooks reject
with `TiledEndpointUnavailableError` rather than silently falling through to the network. The surface
is now the whole API rather than seventeen methods, which is a real cost for stub authors; a stub
only needs the methods its component actually calls.

## Types

`openapi-typescript` output lives in [`generated/schema.d.ts`](./generated/) and is **authoritative
for nearly everything** — request bodies, structures, enums, envelopes — which is the opposite of the
queue server, whose spec declares every body as an untyped object. `types/generatedAliases.ts` gives
them readable names.

Hand-written types are confined to three places: `types/auth.ts`-shaped content in `types/info.ts`
(the auth routes are not in the spec), `types/searchFilters.ts` (the deliberate widening above), and
`types/structures.ts` / `types/nodes.ts`.

**Those last two are ports, deliberately.** `ArrayStructure`, `TiledSearchItem` and friends keep the
exact shapes `@blueskyproject/tiled` used, because every Tiled component in this repo already
destructures them and a shape change would be a silent breakage dressed up as a type improvement. The
spec's own versions are exported alongside under a `Schema` prefix, and they do differ — the spec's
`ArrayStructure.data_type` is `BuiltinDtype | StructDtype` where Finch's is the builtin form alone.
**Reading** a response: use the unprefixed ones. **Building** a request body: use `Schema…`, which is
what the validator on the other end checks against.

One correction was made: `attributes.data_sources` is `unknown[] | null`, not `string | null`. The
spec and the server both contradict the package, and nothing in this repo read the field.

## `@blueskyproject/tiled` is still a dependency

For the `<Tiled>` **viewer component** and its CSS only — `src/components/Tiled/Tiled.tsx`,
`src/features/TiledHeatmapSelector.tsx`, `src/app/App.tsx`.

That component keeps its own internal client and its own singleton, so `setGlobalTiledApiKey` here
does **not** configure it. `Tiled.tsx` passes the URL and key as props from Finch config, which is the
arrangement to keep. Login tokens *are* shared, through the `localStorage` keys above.

## Completeness is checked, not claimed

[`src/testing/tests/TiledRegistry.test.ts`](../../testing/tests/TiledRegistry.test.ts) diffs
`endpointRegistry.ts` against the committed `openapi.json` and fails on any operation with no client
method. Regenerate the spec when the Tiled version changes (see `generated/README.md`); a new route
then fails that suite, which is the signal to add a path, a method, a hook and a descriptor.

Ten spec operations are deliberately unimplemented and listed in that test: `/ui/{path}` and `/`
serve the server's own web UI, and the eight per-file zarr routes (`.zattrs`, `.zgroup`, `.zarray`,
`zarr.json`, chunk paths) are derived by a zarr reader from the two base URLs `getZarrV2Url` /
`getZarrV3Url` return. Shipping typed fetchers for those would invite a consumer that should have
used a zarr library.

## Not here yet

**Websockets and GraphQL.** Three seams are reserved so they land additively:

- `apiKeyLocation: 'query'` is implemented already, because a browser websocket handshake cannot set
  headers and query-string auth is the only mode that will work. The queue server learned this the
  hard way; [its README](../qServer/README.md) documents the whole matrix.
- `closeStream` and the spec's `EventType` enum (`container-child-created`,
  `container-child-metadata-updated`, `stream-closed`) are the streaming vocabulary. Webhooks already
  model delivery; a socket transport will reuse those types rather than inventing parallel ones.
- Query roots are keyed by resource, not transport, so a socket that pushes an update invalidates
  through the same `useTiledInvalidate()` surface.

## Known duplication

`client/interceptorRegistry.ts` is a copy of the queue server's. Both want to live in `@/api/shared`,
but moving it would mean editing `src/api/qServer`, which this work deliberately did not touch. The
duplication is on purpose and the deduplication is a clean separate change. If you fix a bug in one,
fix it in the other.
