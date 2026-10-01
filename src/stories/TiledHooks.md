# Tiled Query Hooks

Every operation in Tiled's API has a TanStack Query hook in `@/api/tiled` — **reads and writes alike**.
This page lists them with the exact call shape.

Finch now ships its own Tiled client rather than wrapping `@blueskyproject/tiled`. For consumers that
changed nothing: every hook kept its name and signature. What is new is the other half of the API —
creating, updating and deleting nodes, writing array and table data, faceted search, revisions, assets,
webhooks and the full auth surface — none of which the package exposed.

---

## Naming

Every hook starts with **`useTiled`**, so the Tiled family never collides with the `useQueue...` and
`useOphyd...` families for the other two backends. After the prefix comes the client method's own name:

| client method               | hook                                |
| --------------------------- | ----------------------------------- |
| `getSearch`                 | `useTiledSearchQuery`               |
| `getMetadata`               | `useTiledMetadataQuery`             |
| `getArrayAsJSON`            | `useTiledArrayAsJSONQuery`          |
| `getTablePartitionAsJSON`   | `useTiledTablePartitionAsJSONQuery` |
| `getServerInfo`             | `useTiledServerInfoQuery`           |
| `createNode`                | `useTiledCreateNodeMutation`        |
| `putArrayFull`              | `useTiledPutArrayFullMutation`      |
| `loginWithUsernamePassword` | `useTiledLoginMutation`             |

A hook ending in **`Query`** reads and **`Mutation`** writes — with four deliberate exceptions, the
POST endpoints that are reads with a request body (`useTiledPostTableFullQuery` and friends). They take
a selection list too long for a query string and change nothing, so they are queries.

The infrastructure hooks are not endpoints and keep their own names: `useTiledClient`,
`useTiledQueryScope`, `useTiledInvalidate`, `useTiledApiClient`.

## The call shape

Arguments are **positional**, always in the same order:

```tsx
useTiledSomethingQuery(...endpointArgs, queryOptions?, requestOptions?);
useTiledSomethingMutation(mutationOptions?, requestOptions?);
```

```tsx
const item = useTiledMetadataQuery(
    'scans/run1', // the endpoint's argument
    { staleTime: 60_000 }, // standard TanStack query options
    { apiKey: null }, // TiledRequestOptions — transport, and rarely needed
);

const login = useTiledLoginMutation({ onSuccess: (tokens) => console.log(tokens) });
login.mutate({ username, password }); // the variables go to mutate()
```

| position                     | what goes in it                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| the endpoint's own arguments | a path, a filter, a format — named and typed, so hover says what is required       |
| TanStack options             | `enabled`, `refetchInterval`, `staleTime`, `select`, … · `onSuccess`, `onError`, … |
| `requestOptions`             | `baseUrl`, `apiKey`, `initialPath`, `pathMode`, `signal`, `client`, `headers`, `query`, `axiosConfig` |

**`requestOptions` is always last**, and it means the same thing here as on the queue-server hooks:
where this one call goes and who it is. Last because it is the rarest thing to pass, so the common
call needs no placeholder — `useTiledMetadataQuery(path, { staleTime: 60_000 })`.

**The array, table and node hooks take one extra slot**, for the endpoint's own parameters. The
client's option types merge those with transport — `TiledArrayRequestOptions` extends
`TiledRequestOptions`, so `stack` and `baseUrl` arrive together — and the hooks split them back apart so
that `requestOptions` does not mean one thing on some hooks and something wider on others.

```tsx
useTiledArrayAsJSONQuery('scans/run1/detector', { stack: [4], maxBytesAllowed: 2_000_000 });
useTiledTablePartitionAsJSONQuery(
    'scans/run1/primary',
    { partition: 0 },
    { refetchInterval: 1000 },
);
useTiledTablePartitionAsJSONQuery('scans/run1/primary', { partition: 0 }, undefined, { baseUrl });
```

The two TanStack option types are exported as `FinchQueryOptions<TResponse, TData>` and
`FinchMutationOptions<TResponse, TVariables>` — shared with the queue-server hooks. `queryKey`,
`queryFn` and `mutationFn` are omitted from them because the hook owns those; overriding the key would
detach the entry from the invalidation map.

## Setup

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinchConfigProvider } from '@blueskyproject/finch';

const queryClient = new QueryClient();

<FinchConfigProvider config={{ tiledApiUrl: 'http://localhost:8000/api/v1' }}>
    <QueryClientProvider client={queryClient}>
        <YourApp />
    </QueryClientProvider>
</FinchConfigProvider>;
```

That is all the configuration needed: the URL and key from `FinchConfigProvider` are applied to the
default client _and_ carried on every request, so the first fetch of the first render already goes to
the right server. **The URL must include `/api/v1`** — the client expects it, and nothing appends it
for you, because guessing would silently point a misconfigured app at a URL it never asked for.

To point the hooks at a specific client instead — a second server, or a stub in a test — wrap the tree
in `TiledApiProvider`:

```tsx
import { TiledApiClient, TiledApiProvider } from '@blueskyproject/finch';

const client = new TiledApiClient({ baseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1' });

<TiledApiProvider client={client}>
    <YourApp />
</TiledApiProvider>;
```

An injected client is never redirected by Finch config, and must be stable across renders (module scope
or a `useMemo`).

---

## Search

All seven hooks call `GET /api/v1/search/{path}` and share the `search` query root. Shape:
`(searchPath, filter, searchOptions?, queryOptions?, requestOptions?)`.

`searchPath: ''` means the **root container** and is legal, so these have no path guard.

| hook                                      | filter argument                                         | endpoint                    |
| ----------------------------------------- | ------------------------------------------------------- | --------------------------- |
| `useTiledSearchQuery`                     | `config?: TiledSearchConfig`                            | `GET /api/v1/search/{path}` |
| `useTiledSearchBySpecsQuery`              | `TiledSpecsFilter` — `{ include, exclude }`             | `GET /api/v1/search/{path}` |
| `useTiledSearchByFullTextQuery`           | `TiledFulltextFilter` — `{ text }`                      | `GET /api/v1/search/{path}` |
| `useTiledSearchByMetadataEqualsQuery`     | `TiledEqualityFilter` — `{ key, value }`                | `GET /api/v1/search/{path}` |
| `useTiledSearchByStructureFamilyQuery`    | `TiledStructureFamilyFilter` — `{ value }`              | `GET /api/v1/search/{path}` |
| `useTiledSearchByRegexQuery`              | `TiledRegexFilter` — `{ key, pattern, caseSensitive? }` | `GET /api/v1/search/{path}` |
| `useTiledSearchByMetadataComparisonQuery` | `TiledComparisonFilter` — `{ operator, key, value }`    | `GET /api/v1/search/{path}` |

All resolve `TiledSearchResult`: `{ data: TiledSearchItem[], error, links, meta: { count } }`.

```tsx
// every Bluesky run in a container, newest first, 25 at a time
const runs = useTiledSearchBySpecsQuery(
    'experiments',
    { include: ['BlueskyRun'], exclude: [] },
    { sort: '-time', pageLimit: 25 },
);

// runs started after a timestamp
const recent = useTiledSearchByMetadataComparisonQuery('experiments', {
    operator: 'gt',
    key: 'start.time',
    value: 1700000000,
});
```

### Filter values are values, not JSON

Six filters — `eq`, `noteq`, `comparison`, `contains`, `in`, `notin` — have a `value` that Tiled reads
with `json.loads` on the server, so the raw API wants a string to arrive with its quotes:
`'"xas_scan"'`. **The hooks encode for you** — pass the value itself:

```tsx
useTiledSearchQuery('', {
    searchFilters: { contains: { key: 'start.plan_name', value: 'xas_scan' } },
});
// sends filter[contains][condition][value]="xas_scan"
```

`string`, `number`, `boolean` and `null` all work. Watch out for this if you have ever written the raw
API: numbers and booleans are valid JSON bare, so forgetting to quote only ever broke _string_ values,
which made it look like an intermittent fault rather than a systematic one.

The remaining filters are deliberately **not** encoded — `fulltext.text`, `regex.pattern`,
`like.pattern`, `lookup.key` and `structureFamily.value` are plain strings server-side. `specs`,
`keysFilter`, `in` and `notin` are encoded as whole JSON arrays, which is a different rule and one the
client handles for you.

### Three filters used to silently do nothing

`keysFilter`, `keyPresent` and `accessBlob` were sent under parameter names the server does not have.
FastAPI drops an unknown query parameter rather than rejecting it, so those filters never applied and
the search came back **unfiltered** — which reads as "the filter matched everything" rather than as a
bug. All three now use the names in Tiled's OpenAPI schema, verified against a live server. If you have
code that worked around one of them, it can go.

`useTiledSearchByFullTextQuery` stays **idle while `filter.text` is empty**, since an empty full-text
search matches everything and is rarely what a search box means on first render.

The six conveniences cover the common filters. For the other nine — `lookup`, `keysFilter`, `noteq`,
`contains`, `in`, `notin`, `keyPresent`, `like`, `accessBlob` — use `useTiledSearchQuery` and build the
config yourself:

```tsx
const inList = useTiledSearchQuery('experiments', {
    searchFilters: { in: { key: 'start.plan_name', value: ['count', 'scan'] } },
});
```

## Faceted search

`useTiledDistinctQuery(searchPath, config?, queryOptions?, requestOptions?)` answers "which plan names
are in this catalogue, and how many runs does each have" in **one request** — over the same filters a
search takes, so a facet count can be scoped to the current query.

```tsx
const facets = useTiledDistinctQuery('', {
    metadata: ['start.plan_name', 'start.detectors'],
    counts: true,
    searchFilters: { comparison: { operator: 'gt', key: 'start.time', value: lastWeek } },
});
// facets.data?.metadata['start.plan_name'] → [{ value: 'count', count: 2 }, …]
```

New in this version; the alternative was paginating the whole container client-side and counting. It
idles until the config asks for at least one facet.

## Metadata

| hook                    | argument                  | returns `data`       | endpoint                      |
| ----------------------- | ------------------------- | -------------------- | ----------------------------- |
| `useTiledMetadataQuery` | `path: string` (required) | `TiledSearchItem<S>` | `GET /api/v1/metadata/{path}` |

Idle while `path` is empty, so `useTiledMetadataQuery(selected ?? '')` makes no request until something
is selected. Pass the structure type to narrow `data`:

```tsx
const detector = useTiledMetadataQuery<ArrayStructure>('scans/run1/detector');
detector.data?.attributes.structure.shape; // number[]

const primary = useTiledMetadataQuery<TableStructure>('scans/run1/primary');
primary.data?.attributes.structure.columns; // string[]
```

Or use the exported guards on a result you did not type: `isArrayStructure(item)`,
`isTableStructure(item)`, `isContainerStructure(item)`.

## Arrays

Shape: `(arrayPath, arrayOptions?, queryOptions?, requestOptions?)` — the array parameters get their
own slot, separate from transport. All of them are idle while `arrayPath` is empty.
(`useTiledArrayImagePath` is not a query, so it has no `queryOptions`:
`(arrayPath, arrayOptions?, requestOptions?)`.)

| hook                         | returns `data`             | endpoint                         |
| ---------------------------- | -------------------------- | -------------------------------- |
| `useTiledArrayAsQuery`       | per `type`                 | `GET /api/v1/array/…`            |
| `useTiledArrayAsJSONQuery`   | `number[][]`               | `GET /api/v1/array/full/{path}`  |
| `useTiledArrayAsPngQuery`    | `Blob`                     | `GET /api/v1/array/full/{path}`  |
| `useTiledArrayAsBufferQuery` | `ArrayBuffer`              | `GET /api/v1/array/full/{path}`  |
| `useTiledArrayBlockQuery`    | `ArrayBuffer`              | `GET /api/v1/array/block/{path}` |
| `useTiledArrayImagePath`     | `string` — **not a query** | (no request)                     |

Useful options: `stack: [n]` to pick one frame of a 3-D array, `downSampleRatio`, `maxBytesAllowed` to
have the client compute a downsample step for you, `structure` / `arrayItem` to skip the metadata
round-trip, and `isRGB` / `channelFirst` for colour images.

```tsx
// one frame, downsampled to stay under 2 MB
const frame = useTiledArrayAsJSONQuery('scans/run1/detector', {
    stack: [frameIndex],
    maxBytesAllowed: 2_000_000,
});

// a different response shape
const cube = useTiledArrayAsJSONQuery<number[][][]>('scans/run1/detector');
```

`useTiledArrayImagePath` is **not a query** — `getArrayAsImagePath` is synchronous, so caching it would
only cache string concatenation. It resolves the client (and therefore the configured base URL and key)
and memoizes the URL; the browser does the fetching:

```tsx
const src = useTiledArrayImagePath('scans/run1/detector', { stack: [frame], structure });
return src ? <img src={src} alt="detector frame" /> : null;
```

Because it is synchronous it cannot fetch the array structure — pass `structure` or `arrayItem` if you
want downsampling applied.

## Tables

Shape: `(tablePath, tableOptions?, queryOptions?, requestOptions?)` — a dedicated endpoint slot again.
Idle while `tablePath` is empty.

Two axes: **format** (`JSON` is column-oriented, `JSON_SEQ` row-oriented) and **endpoint** (`partition`
reads one 0-based partition, `full` reads them all).

| hook                                        | returns `data`              | endpoint                             |
| ------------------------------------------- | --------------------------- | ------------------------------------ |
| `useTiledTableAsQuery`                      | per `type`                  | `GET /api/v1/table/…`                |
| `useTiledTablePartitionAsJSONQuery`         | `Record<string, unknown[]>` | `GET /api/v1/table/partition/{path}` |
| `useTiledTablePartitionAsJSONSequenceQuery` | `TiledTableRow[]`           | `GET /api/v1/table/partition/{path}` |
| `useTiledTableFullAsJSONQuery`              | `Record<string, unknown[]>` | `GET /api/v1/table/full/{path}`      |
| `useTiledTableFullAsJSONSequenceQuery`      | `TiledTableRow[]`           | `GET /api/v1/table/full/{path}`      |
| `useTiledTableFullAsQuery`                  | per `format`                | `GET /api/v1/table/full/{path}`      |

Column-oriented is usually what a plotting library wants; row-oriented is what a table wants.

```tsx
const columns = useTiledTablePartitionAsJSONQuery('scans/run1/primary', { partition: 0 });
const x = columns.data?.['motor'] ?? [];
const y = columns.data?.['I0'] ?? [];
```

**`column` narrows the response.** New — no `column` parameter was sent before, so every read returned
the whole table. On a wide table this is the difference between a few columns and a few hundred:

```tsx
useTiledTableFullAsJSONQuery('scans/run1/primary', { column: ['motor', 'I0'] });
```

**`useTiledTableFullAsQuery` reads any representation** — `'CSV'`, `'PARQUET'`, `'ARROW'`, `'XLSX'`,
`'HDF5'` — which is what a download button wants. The format decides the return type, and the server's
own `About.formats.table` says what a given deployment supports.

## Containers, nodes, awkward and ragged arrays

None of these existed before; the package covered arrays and tables only.

| hook                           | reads                                                    |
| ------------------------------ | -------------------------------------------------------- |
| `useTiledContainerFullQuery`   | a container's metadata and data together                 |
| `useTiledNodeFullQuery`        | whichever of container or table the node turns out to be |
| `useTiledAwkwardFullQuery`     | a whole awkward array                                    |
| `useTiledAwkwardBuffersQuery`  | selected buffers, by form key                            |
| `useTiledRaggedFullQuery`      | a ragged array                                           |

`useTiledContainerFullQuery` with `format: 'HDF5'` or `'ZIP'` packages a whole subtree as one download,
which is the usual reason to reach for it rather than for a search plus per-child reads.

## Server info

| hook                      | argument | returns `data`              | endpoint                |
| ------------------------- | -------- | --------------------------- | ----------------------- |
| `useTiledServerInfoQuery` | —        | `TiledInfoResponse \| null` | `GET /api/v1/`          |
| `useTiledAboutQuery`      | —        | `TiledInfoResponse`         | `GET /api/v1/`          |
| `useTiledHealthQuery`     | —        | `unknown`                   | `GET /healthz`          |
| `useTiledUiSettingsQuery` | —        | `unknown`                   | `GET /tiled-ui-settings` |
| `useTiledMetricsQuery`    | —        | `unknown`                   | `GET /api/v1/metrics`   |

**`useTiledServerInfoQuery().data` can be `null`.** The client catches an unreachable server or an
unparseable response and resolves `null` rather than throwing, so `isError` stays `false`. That
asymmetry with every other read is deliberate: the login screen probes servers it knows nothing about
and needs an answer rather than an exception. Use `useTiledAboutQuery` when you want the error.

```tsx
const info = useTiledServerInfoQuery();
const needsLogin = Boolean(info.data?.authentication?.required);
const providers = info.data?.authentication?.providers ?? [];
```

Effectively static for the lifetime of a deployment, so a long `staleTime` is appropriate.

## Login

| hook                    | `mutate(…)`           | resolves to                               | invalidates | endpoint                   |
| ----------------------- | --------------------- | ----------------------------------------- | ----------- | -------------------------- |
| `useTiledLoginMutation` | `TiledLoginVariables` | `{ access_token, refresh_token } \| null` | everything  | the server's auth endpoint |

Six more auth mutations sit beside it — `useTiledLogoutMutation`, `useTiledCreateApiKeyMutation`,
`useTiledRevokeApiKeyMutation`, `useTiledRefreshSessionMutation`, `useTiledRevokeSessionMutation` —
plus `useTiledWhoamiQuery`.

`useTiledLogoutMutation` **always clears local credentials**, including when the server is
unreachable or advertises no logout endpoint. The mutation still rejects so you can report the
failure; the credentials are gone either way.

**These routes are not in Tiled's OpenAPI schema.** The server generates it without its auth router, so
the client resolves every auth URL from `GET /api/v1/`'s `authentication.links` at call time. A server
with authentication disabled reports `links: null`, and those hooks then fail with a `TiledApiError`
saying so — check `useTiledServerInfoQuery().data?.authentication?.required` before offering a login UI
at all.

```tsx
const login = useTiledLoginMutation();

const submit = async () => {
    const tokens = await login.mutateAsync({ username, password });
    if (!tokens) setError('Login failed'); // null, NOT a rejection
};
```

`mutate({ username, password, url?, provider? })` — `url` overrides the server, and `provider` lets you
pass one from `useTiledServerInfoQuery().data?.authentication?.providers` instead of letting the client
pick the first password provider.

On success the tokens are persisted — `localStorage` in a browser, memory elsewhere — set as the
client's bearer token, and refreshed automatically on a later 401. That automatic refresh is skipped
for any call that chose its own credentials (`apiKey: null`, a one-off key, an explicit
`Authorization` header) or that was sent to a different server with `requestOptions.baseUrl`, so it
can never substitute the stored session for an identity you picked, or offer the refresh token to a
server that did not issue it. The hook then invalidates **every**
Tiled query: what you are allowed to see changes with your identity, so every cached read is suspect,
including a search that legitimately returned nothing.

The storage keys are shared with the `<Tiled>` viewer component, so a login through either is a login
for both.

---

## Writing

Every write is a mutation, and the variables go to `mutate` — so one hook instance performs many
writes, with the path part of the variables rather than of the hook.

| hook                                 | writes                                            |
| ------------------------------------ | ------------------------------------------------- |
| `useTiledCreateNodeMutation`         | `POST /metadata/{path}` — create a node           |
| `useTiledUpdateMetadataMutation`     | `PUT /metadata/{path}` — replace metadata         |
| `useTiledPatchMetadataMutation`      | `PATCH /metadata/{path}` — merge or JSON Patch    |
| `useTiledDeleteNodeMutation`         | `DELETE /metadata/{path}`                         |
| `useTiledPutArrayFullMutation`       | a whole array                                     |
| `useTiledPutArrayBlockMutation`      | one chunk                                         |
| `useTiledPatchArrayFullMutation`     | a sub-region; `extend` grows a resizable array    |
| `useTiledPutTablePartitionMutation`  | one table partition                               |
| `useTiledPutTableFullMutation`       | a whole table                                     |
| `useTiledRegisterMutation`           | register data already on disk                     |
| `useTiledCloseStreamMutation`        | mark an append-only node complete                 |
| `useTiledRegisterWebhookMutation`    | watch a node's events                             |

…plus the ragged, awkward, node, data-source and revision writes.

```tsx
const create = useTiledCreateNodeMutation();
const write = useTiledPutArrayFullMutation();

await create.mutateAsync({
    parentPath: '', // the CONTAINER to create in, not the new node's path
    body: {
        id: 'processed', // the new node's key
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

- **`POST /metadata/{path}` addresses the parent container.** The new node's key goes in `body.id`.
  Posting to the path you want the node to have answers 404 `No such entry`.
- **An array or table node needs its structure up front**, in `data_sources[0].structure`. The server
  allocates from it and does not infer it later.
- **`DELETE` defaults to `external_only: true`**, which refuses with a 409 when any of the tree is
  internally managed — deleting those records would delete the underlying data files. Pass
  `external_only: false` to mean it.

Binary writes take an `ArrayBuffer`, a typed array or a `Blob`, in the array's own dtype and C order —
the server trusts the declared structure and does not convert. A nested `number[][]` is sent as JSON
instead. **Nothing converts one into the other**: a dtype mismatch writes plausible-looking garbage
rather than failing, so that encoding is left to the caller, who knows the dtype. Table writes need an
explicit `mimetype`, because the server dispatches its reader on exactly that header.

### Patching metadata

`useTiledPatchMetadataMutation` covers both of Tiled's patch modes:

```tsx
const patch = useTiledPatchMetadataMutation();

// merge (default): set or overwrite one key, leave the rest alone
patch.mutate({ path: 'scan/1', metadata: { comment: 'calibration run' } });

// json-patch: remove a key, or edit one element of an array
patch.mutate({
    path: 'scan/1',
    mode: 'json-patch',
    metadata: [{ op: 'remove', path: '/comment' }],
});
```

## Revisions, assets and webhooks

| hook                             | reads                                          |
| -------------------------------- | ---------------------------------------------- |
| `useTiledRevisionsQuery`         | a node's metadata revision history             |
| `useTiledAssetBytesQuery`        | the raw bytes of one asset backing a node      |
| `useTiledAssetManifestQuery`     | the file list of a directory-shaped asset      |
| `useTiledWebhooksQuery`          | the webhooks registered on a node              |
| `useTiledWebhookHistoryQuery`    | recent delivery attempts for one webhook       |

Tiled records a revision on every metadata write unless `drop_revision` said otherwise, so
`useTiledRevisionsQuery` is the audit trail behind the metadata mutations. `useTiledAssetBytesQuery`
reads a file as stored, bypassing Tiled's structure layer — use it to download an original TIFF or
HDF5 rather than a re-encoded view of it.

---

## Query keys

Keys are `['tiled', <resource>, <args | null>, { baseUrl, initialPath }]` — the scope goes **last**, so
prefix matching still works:

```ts
queryClient.invalidateQueries({ queryKey: ['tiled', 'search'] }); // every search
```

Fourteen resources: `search`, `distinct`, `metadata`, `array`, `table`, `container`, `node`, `awkward`,
`ragged`, `revisions`, `asset`, `webhooks`, `serverInfo`, `auth`.

They are deliberately named after **resources, not transports**: when a websocket eventually pushes an
update for a node, it will invalidate `metadata` through this same surface.

**All seven search hooks share the `search` root**, because they are the same endpoint with different
filters. Two hooks that build identical filters correctly share one cache entry.

**The scope carries `initialPath` as well as `baseUrl`.** Tiled prepends the client's initial path to
relative request paths, so the same relative path under two prefixes is two different pieces of data. A
per-call `requestOptions.baseUrl` or `initialPath` overrides the scope, and `pathMode: 'absolute'`
resolves the prefix to `''` because such a request ignores it.

**Array and table keys hold a projection of the options, not the object.** Only the fields that change
the response take part — `stack`, `downSampleRatio`, `maxBytesAllowed`, `format`, `isRGB`,
`channelFirst`, `partition`, `column`. `signal`, `client`, `structure` and `arrayItem` are excluded,
which is what makes it safe to pass a fresh options object (and a fresh `AbortSignal`) on every render.

`column` is in that list because it narrows the response: two reads of the same table differing only
in their column selection are different data and get different entries.

The API key is deliberately not part of any key: it would put a secret into the Devtools cache
inspector, and because auth is applied at request time a credential change invalidates everything rather
than one entry. Use `invalidateAllTiledQueries(queryClient)` after rotating it.

Build keys with the exported factory rather than by hand — `tiledQueryKeys.search(scope, args)`,
`tiledQueryRoots.metadata`, and so on.

## Invalidation bundles

| bundle      | resources refreshed                                          |
| ----------- | ------------------------------------------------------------ |
| `search`    | search, distinct                                             |
| `metadata`  | metadata, revisions                                          |
| `data`      | array, table, container, node, awkward, ragged               |
| `structure` | search, distinct, metadata, revisions, container, node       |
| `webhooks`  | webhooks                                                     |
| `info`      | serverInfo                                                   |
| `auth`      | auth                                                         |
| `all`       | all fourteen                                                 |

Mutations apply these automatically, awaited before `mutateAsync` resolves — so the affected queries
have already refetched on the next line. Three rules decide which bundle a write uses:

- a **metadata write** refreshes that node and the searches that could have matched on what changed;
- a **data write** refreshes the data _and_ the metadata, because a write can change a structure —
  `patchArrayFull` with `extend: true` grows the shape;
- a **create, delete or register** uses `structure`, which also covers the parent container's contents.

```tsx
const invalidate = useTiledInvalidate();
await invalidate.roots('search', 'metadata'); // individual resources
await invalidate.bundles('data'); // a named bundle
await invalidate.all(); // everything — after a login or a key change
```

## Guarded queries

`enabled` is applied after your options with `??`, so an options object carrying `enabled: undefined`
falls through to the guard instead of clobbering it.

| hook                                            | idle until                     |
| ----------------------------------------------- | ------------------------------ |
| every path-addressed query                      | its path is non-empty          |
| `useTiledSearchByFullTextQuery`                 | `filter.text` is non-empty     |
| `useTiledDistinctQuery`                         | the config asks for a facet    |
| `useTiledArrayBlockQuery`, the asset hooks, `useTiledWebhookHistoryQuery` | their required argument is defined |

Pass `enabled` in the last parameter to override either way. Forcing one of the last group past its
guard raises `FinchMissingArgumentError` — named, before any request goes out — rather than sending
`undefined` where the server expects an identifier.

## Cancelling

Queries are cancelled automatically on unmount and by `queryClient.cancelQueries`. To cancel from your
own code as well, pass a signal; the two compose, so either one aborts the request:

```tsx
const controller = new AbortController();
const runs = useTiledSearchQuery('', undefined, { signal: controller.signal });
```

## Worked example

```tsx
import {
    useTiledSearchBySpecsQuery,
    useTiledMetadataQuery,
    useTiledTablePartitionAsJSONQuery,
} from '@blueskyproject/finch';

function RunBrowser() {
    const [selected, setSelected] = useState<string>();

    const runs = useTiledSearchBySpecsQuery(
        'experiments',
        { include: ['BlueskyRun'], exclude: [] },
        { sort: '-time', pageLimit: 20 },
    );
    // Both stay idle until a run is picked.
    const item = useTiledMetadataQuery(selected ?? '');
    const table = useTiledTablePartitionAsJSONQuery(selected ? `${selected}/primary` : '');

    if (runs.isPending) return <p>loading…</p>;
    if (runs.isError) return <p>{runs.error.message}</p>;

    return (
        <div>
            <ul>
                {runs.data.data.map((run) => (
                    <li key={run.id}>
                        <button onClick={() => setSelected(run.id)}>{run.id}</button>
                    </li>
                ))}
            </ul>
            <p>{item.data?.attributes.metadata.start?.plan_name}</p>
            <p>{Object.keys(table.data ?? {}).join(', ')}</p>
        </div>
    );
}
```

## Errors

| type                            | when                                                                     |
| ------------------------------- | ------------------------------------------------------------------------ |
| `TiledApiError`                 | the server answered 4xx/5xx, or the request never got there              |
| `TiledEndpointUnavailableError` | the client injected via `TiledApiProvider` does not implement the method |
| `FinchMissingArgumentError`     | a guarded hook was forced past its guard with its argument undefined     |

`TiledApiError` is new — previously a failure surfaced as a raw axios error, so reading a Tiled error
message meant knowing about `error.response.data`. It carries `status`, `method`, `path`,
`responseBody`, and for a 422 `isValidationError` plus parsed `validationErrors`. The message is
assembled from whichever error envelope Tiled used, so you get
`GET /metadata/x failed with 404: No such entry` rather than `Request failed with status code 404`.

```tsx
import { isTiledApiError } from '@blueskyproject/finch';

if (item.isError && isTiledApiError(item.error) && item.error.status === 404) {
    return <p>That run no longer exists.</p>;
}
```

The queue-server hooks fail the same way, with `QServerApiError` — same fields, same shape, so a
component handling one handles the other.
| a DOM `AbortError`              | the request was cancelled                                                |

Remember the two non-errors: `useTiledServerInfoQuery` resolves `null` for an unreachable server, and
`useTiledLoginMutation` resolves `null` for bad credentials. Neither sets `isError`.
