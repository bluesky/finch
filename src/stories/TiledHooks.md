# Tiled Query Hooks

Every operation in Tiled's API has a TanStack Query hook in `@/api/tiled` — **41 reads and 27 writes**.
They read their server URL and API key from `FinchConfigProvider`, so the common call takes nothing but
a path.

```tsx
useTiledSomethingQuery(...endpointArgs, queryOptions?, requestOptions?)
useTiledSomethingMutation(mutationOptions?, requestOptions?).mutate(variables)
```

The last two slots are the same on every hook and both are optional: **`queryOptions`** /
**`mutationOptions`** are the standard TanStack ones (`enabled`, `staleTime`, `select`, `onSuccess`, …)
and **`requestOptions`** is transport for this one call (`baseUrl`, `apiKey`, `initialPath`,
`pathMode`, `signal`, `client`, `headers`, `query`, `axiosConfig`). The tables below list only the
arguments that differ per hook.

---

## Reads

A query with a required argument **idles** until it has one — no request, `status: 'pending'`,
`fetchStatus: 'idle'`. So `useTiledMetadataQuery(selected ?? '')` is the whole pattern for "nothing is
selected yet".

### Server info

| hook                      | arguments | `data`                      |
| ------------------------- | --------- | --------------------------- |
| `useTiledServerInfoQuery` | —         | `TiledInfoResponse` or `null` |
| `useTiledAboutQuery`      | —         | `TiledInfoResponse`         |
| `useTiledHealthQuery`     | —         | `unknown`                   |
| `useTiledUiSettingsQuery` | —         | `unknown`                   |
| `useTiledMetricsQuery`    | —         | `unknown`                   |

### Search

All eight hit `GET /api/v1/search/{path}` and share one cache root. `searchPath: ''` is the root
container and is legal, so these have no path guard.

| hook                                      | arguments                                                                     | `data`                |
| ----------------------------------------- | ----------------------------------------------------------------------------- | --------------------- |
| `useTiledSearchQuery`                     | `searchPath, config?: TiledSearchConfig`                                      | `TiledSearchResult`   |
| `useTiledSearchBySpecsQuery`              | `searchPath, { include, exclude }, searchOptions?`                            | `TiledSearchResult`   |
| `useTiledSearchByFullTextQuery`           | `searchPath, { text }, searchOptions?`                                        | `TiledSearchResult`   |
| `useTiledSearchByMetadataEqualsQuery`     | `searchPath, { key, value }, searchOptions?`                                  | `TiledSearchResult`   |
| `useTiledSearchByMetadataComparisonQuery` | `searchPath, { operator, key, value }, searchOptions?`                        | `TiledSearchResult`   |
| `useTiledSearchByStructureFamilyQuery`    | `searchPath, { value }, searchOptions?`                                       | `TiledSearchResult`   |
| `useTiledSearchByRegexQuery`              | `searchPath, { key, pattern, caseSensitive? }, searchOptions?`                | `TiledSearchResult`   |
| `useTiledDistinctQuery`                   | `searchPath, config?: TiledDistinctConfig`                                    | `GetDistinctResponse` |

`searchOptions` is `{ sort?, pageOffset?, pageCursor?, pageLimit?, fields?, selectMetadata?, maxDepth?, omitLinks?, includeDataSources? }`.
`TiledSearchResult` is `{ data: TiledSearchItem[], error, links, meta: { count } }`.

### Metadata

| hook                    | arguments        | `data`               |
| ----------------------- | ---------------- | -------------------- |
| `useTiledMetadataQuery` | `path` (required) | `TiledSearchItem<S>` |

### Arrays

| hook                         | arguments                                   | `data`                     |
| ---------------------------- | ------------------------------------------- | -------------------------- |
| `useTiledArrayAsJSONQuery`   | `arrayPath, arrayOptions?`                  | `number[][]`               |
| `useTiledArrayAsPngQuery`    | `arrayPath, arrayOptions?`                  | `Blob`                     |
| `useTiledArrayAsBufferQuery` | `arrayPath, arrayOptions?`                  | `ArrayBuffer`              |
| `useTiledArrayAsQuery`       | `arrayPath, type, arrayOptions?`            | per `type`                 |
| `useTiledArrayBlockQuery`    | `arrayPath, { block, … }` (required)        | `ArrayBuffer`              |
| `useTiledArrayImagePath`     | `arrayPath, arrayOptions?, requestOptions?` | `string` — **not a query** |

`arrayOptions`: `stack`, `slice`, `downSampleRatio`, `maxBytesAllowed`, `isRGB`, `channelFirst`,
`structure` / `arrayItem` (skip the metadata round-trip), `format`.

### Tables

Two axes: **format** — `JSON` is column-oriented, `JSON_SEQ` row-oriented — and **endpoint** —
`partition` reads one 0-based partition, `full` reads them all.

| hook                                        | arguments                                   | `data`                      |
| ------------------------------------------- | ------------------------------------------- | --------------------------- |
| `useTiledTablePartitionAsJSONQuery`         | `tablePath, tableOptions?`                  | `Record<string, unknown[]>` |
| `useTiledTablePartitionAsJSONSequenceQuery` | `tablePath, tableOptions?`                  | `TiledTableRow[]`           |
| `useTiledTableFullAsJSONQuery`              | `tablePath, tableOptions?`                  | `Record<string, unknown[]>` |
| `useTiledTableFullAsJSONSequenceQuery`      | `tablePath, tableOptions?`                  | `TiledTableRow[]`           |
| `useTiledTableFullAsQuery`                  | `tablePath, format, tableOptions?`          | per `format`                |
| `useTiledTableAsQuery`                      | `tablePath, type, endpoint, tableOptions?`  | per `type`                  |
| `useTiledPostTableFullQuery`                | `tablePath, columns, params?`               | `unknown`                   |
| `useTiledPostTablePartitionQuery`           | `tablePath, columns, { partition, … }`      | `unknown`                   |

`tableOptions`: `partition`, `column` (narrows the response — see below), `format`, `filename`.

### Containers, nodes, awkward and ragged arrays

| hook                             | arguments                      | reads                                          |
| -------------------------------- | ------------------------------ | ---------------------------------------------- |
| `useTiledContainerFullQuery`     | `path, nodeOptions?`           | a container's metadata and data together       |
| `useTiledPostContainerFullQuery` | `path, fields, params?`        | the same, with a long field selection          |
| `useTiledNodeFullQuery`          | `path, nodeOptions?`           | whichever of container or table the node is    |
| `useTiledAwkwardFullQuery`       | `path, awkwardOptions?`        | a whole awkward array                          |
| `useTiledAwkwardBuffersQuery`    | `path, awkwardOptions?`        | selected buffers, by form key                  |
| `useTiledPostAwkwardBuffersQuery`| `path, formKeys, params?`      | the same, with a long key list                 |
| `useTiledRaggedFullQuery`        | `path, raggedOptions?`         | a ragged array                                 |

### Revisions, assets, webhooks and identity

| hook                          | arguments                       | reads                                     |
| ----------------------------- | ------------------------------- | ----------------------------------------- |
| `useTiledRevisionsQuery`      | `path, params?`                 | a node's metadata revision history        |
| `useTiledAssetBytesQuery`     | `path, { id, relative_path? }`  | the raw bytes of one asset backing a node |
| `useTiledAssetManifestQuery`  | `path, { id }`                  | the file list of a directory-shaped asset |
| `useTiledWebhooksQuery`       | `path`                          | the webhooks registered on a node         |
| `useTiledWebhookHistoryQuery` | `webhookId, { limit? }?`        | recent delivery attempts for one webhook  |
| `useTiledWhoamiQuery`         | —                               | the current principal                     |

---

## Writes

Every write is a mutation and the variables go to `mutate`, so **one hook instance performs many
writes** — the path is part of the variables, not of the hook. Each one invalidates automatically,
awaited before `mutateAsync` resolves, so the affected queries have already refetched on the next line.

| hook                                | `mutate(…)`                                                        | invalidates          |
| ----------------------------------- | ------------------------------------------------------------------ | -------------------- |
| `useTiledCreateNodeMutation`        | `{ parentPath, body }`                                             | `structure`          |
| `useTiledUpdateMetadataMutation`    | `{ path, body, drop_revision? }`                                   | `metadata`, `search` |
| `useTiledPatchMetadataMutation`     | `{ path, mode?, metadata?, specs?, access_blob?, drop_revision? }` | `metadata`, `search` |
| `useTiledDeleteNodeMutation`        | `{ path, recursive?, external_only? }`                             | `structure`, `data`  |
| `useTiledPutArrayFullMutation`      | `{ path, data, persist? }`                                         | `data`, `metadata`   |
| `useTiledPutArrayBlockMutation`     | `{ path, data, block, persist? }`                                  | `data`, `metadata`   |
| `useTiledPatchArrayFullMutation`    | `{ path, data, offset, shape, extend?, persist? }`                 | `data`, `metadata`   |
| `useTiledPutTableFullMutation`      | `{ path, data, mimetype }`                                         | `data`, `metadata`   |
| `useTiledPutTablePartitionMutation` | `{ path, data, partition, mimetype }`                              | `data`, `metadata`   |
| `useTiledPatchTablePartitionMutation` | `{ path, data, partition, mimetype }`                            | `data`, `metadata`   |
| `useTiledPutNodeFullMutation`       | `{ path, data, mimetype }`                                         | `data`, `metadata`   |
| `useTiledPutRaggedFullMutation`     | `{ path, data, persist? }`                                         | `data`, `metadata`   |
| `useTiledPutRaggedBlockMutation`    | `{ path, data, block, persist? }`                                  | `data`, `metadata`   |
| `useTiledPatchRaggedFullMutation`   | `{ path, data, offset, shape, extend?, persist? }`                 | `data`, `metadata`   |
| `useTiledPutAwkwardFullMutation`    | `{ path, form, length, container }`                                | `data`, `metadata`   |
| `useTiledRegisterMutation`          | `{ parentPath, body }`                                             | `structure`          |
| `useTiledPutDataSourceMutation`     | `{ path, body, patch_shape?, patch_offset? }`                      | `structure`, `data`  |
| `useTiledDeleteRevisionMutation`    | `{ path, number }`                                                 | `metadata`           |
| `useTiledCloseStreamMutation`       | `{ path }`                                                         | `data`, `metadata`   |
| `useTiledRegisterWebhookMutation`   | `{ path, body }`                                                   | `webhooks`           |
| `useTiledDeleteWebhookMutation`     | `{ webhookId }`                                                    | `webhooks`           |
| `useTiledLoginMutation`             | `{ username, password, url?, provider? }`                          | `all`                |
| `useTiledLogoutMutation`            | — (`void`)                                                         | `all`                |
| `useTiledRefreshSessionMutation`    | — (`void`)                                                         | `all`                |
| `useTiledRevokeSessionMutation`     | `{ sessionId }`                                                    | `all`                |
| `useTiledCreateApiKeyMutation`      | `{ expires_in?, scopes?, note? }`                                  | `auth`               |
| `useTiledRevokeApiKeyMutation`      | `{ firstEight }`                                                   | `auth`               |

---

## Minimal examples

```tsx
// Setup — once, at the root. The URL must include /api/v1.
<FinchConfigProvider config={{ tiledApiUrl: 'http://localhost:8000/api/v1' }}>
    <QueryClientProvider client={queryClient}>
        <YourApp />
    </QueryClientProvider>
</FinchConfigProvider>;
```

```tsx
// Server info
const info = useTiledServerInfoQuery();
const needsLogin = Boolean(info.data?.authentication?.required);

// Search — every Bluesky run in a container, newest first, 25 at a time
const runs = useTiledSearchBySpecsQuery(
    'experiments',
    { include: ['BlueskyRun'], exclude: [] },
    { sort: '-time', pageLimit: 25 },
);
runs.data?.data.map((run) => run.id);

// Faceted counts over the same filters, in one request
const facets = useTiledDistinctQuery('', { metadata: ['start.plan_name'], counts: true });

// Metadata — idles until something is selected; pass the structure to narrow `data`
const item = useTiledMetadataQuery<ArrayStructure>(selected ?? '');
item.data?.attributes.structure.shape;

// Array — one frame of a 3-D stack, downsampled to stay under 2 MB
const frame = useTiledArrayAsJSONQuery('scans/run1/detector', {
    stack: [frameIndex],
    maxBytesAllowed: 2_000_000,
});

// Array as an <img> src — synchronous, so not a query
const src = useTiledArrayImagePath('scans/run1/detector', { stack: [frameIndex], structure });

// Table — column-oriented is what a plotting library wants; `column` narrows the response
const columns = useTiledTablePartitionAsJSONQuery('scans/run1/primary', {
    partition: 0,
    column: ['motor', 'I0'],
});
const [x, y] = [columns.data?.motor ?? [], columns.data?.I0 ?? []];

// Transport override — probe a server the app is not configured for
const other = useTiledSearchQuery('', undefined, undefined, { baseUrl: OTHER_SERVER });
```

```tsx
// Write — create a node, then fill it
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
// Reads of `processed` have already refetched by here.

// Patch metadata — merge sets keys, json-patch is how you remove one
const patch = useTiledPatchMetadataMutation();
patch.mutate({ path: 'scan/1', metadata: { comment: 'calibration run' } });
patch.mutate({ path: 'scan/1', mode: 'json-patch', metadata: [{ op: 'remove', path: '/comment' }] });

// Login — resolves null for bad credentials; it does NOT reject
const login = useTiledLoginMutation();
const tokens = await login.mutateAsync({ username, password });
if (!tokens) setError('Login failed');
```

---

Everything below is detail you can reach for when you need it.

## Naming

Every hook starts with **`useTiled`**, so the Tiled family never collides with the `useQueue…` and
`useOphyd…` families for the other two backends. After the prefix comes the client method's own name —
`getSearch` → `useTiledSearchQuery`, `putArrayFull` → `useTiledPutArrayFullMutation`.

**`Query` reads and `Mutation` writes**, with four deliberate exceptions: the POST endpoints that are
reads with a request body (`useTiledPostTableFullQuery` and friends). They take a selection list too
long for a query string and change nothing, so they are queries.

## Why `requestOptions` is last

It means the same thing here as on the queue-server hooks: where this one call goes and who it is.
Last because it is the rarest thing to pass, so the common call needs no placeholder.

**The array, table and node hooks take one extra slot** for the endpoint's own parameters. The client's
option types merge those with transport — `TiledArrayRequestOptions` extends `TiledRequestOptions`, so
`stack` and `baseUrl` arrive together — and the hooks split them back apart, so `requestOptions` does
not mean one thing on some hooks and something wider on others.

The two TanStack option types are exported as `FinchQueryOptions<TResponse, TData>` and
`FinchMutationOptions<TResponse, TVariables>`, shared with the queue-server hooks. `queryKey`, `queryFn`
and `mutationFn` are omitted because the hook owns those; overriding the key would detach the entry from
the invalidation map.

## Pointing at a different client

`FinchConfigProvider`'s URL and key are applied to the default client _and_ carried on every request, so
the first fetch of the first render already goes to the right server. **The URL must include `/api/v1`**
— nothing appends it, because guessing would silently point a misconfigured app somewhere it never asked
for.

For a second server, or a stub in a test, wrap the tree in `TiledApiProvider`:

```tsx
const client = new TiledApiClient({ baseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1' });

<TiledApiProvider client={client}>
    <YourApp />
</TiledApiProvider>;
```

An injected client is never redirected by Finch config, and must be stable across renders (module scope
or a `useMemo`).

## Search filters

**Filter values are values, not JSON.** Six filters — `eq`, `noteq`, `comparison`, `contains`, `in`,
`notin` — have a `value` that Tiled reads with `json.loads` server-side, so the raw API wants a string to
arrive with its quotes: `'"xas_scan"'`. The hooks encode for you; pass the value itself. Watch for this
if you have written the raw API: numbers and booleans are valid JSON bare, so forgetting to quote only
ever broke _string_ values, which reads as an intermittent fault rather than a systematic one.

`fulltext.text`, `regex.pattern`, `like.pattern`, `lookup.key` and `structureFamily.value` are
deliberately **not** encoded — they are plain strings server-side. `specs`, `keysFilter`, `in` and
`notin` are encoded as whole JSON arrays, which is a different rule the client also handles.

**Three filters used to silently do nothing.** `keysFilter`, `keyPresent` and `accessBlob` were sent
under parameter names the server does not have. FastAPI drops an unknown query parameter rather than
rejecting it, so those filters never applied and the search came back **unfiltered** — which reads as
"the filter matched everything" rather than as a bug. All three now use the names in Tiled's OpenAPI
schema, verified against a live server. If you have code working around one of them, it can go.

The six conveniences cover the common filters. For the other nine — `lookup`, `keysFilter`, `noteq`,
`contains`, `in`, `notin`, `keyPresent`, `like`, `accessBlob` — build the config yourself:

```tsx
useTiledSearchQuery('experiments', {
    searchFilters: { in: { key: 'start.plan_name', value: ['count', 'scan'] } },
});
```

## Reading arrays and tables

`useTiledArrayImagePath` is **not a query** — `getArrayAsImagePath` is synchronous, so caching it would
only cache string concatenation. It resolves the client (and therefore the configured base URL and key)
and memoizes the URL; the browser does the fetching. Because it is synchronous it cannot fetch the array
structure, so pass `structure` or `arrayItem` if you want downsampling applied.

**`column` narrows a table read.** New — no `column` parameter was sent before, so every read returned
the whole table. On a wide table that is the difference between a few columns and a few hundred.

**`useTiledTableFullAsQuery` reads any representation** — `'CSV'`, `'PARQUET'`, `'ARROW'`, `'XLSX'`,
`'HDF5'` — which is what a download button wants. The format decides the return type, and the server's
own `About.formats.table` says what a given deployment supports. `useTiledContainerFullQuery` with
`format: 'HDF5'` or `'ZIP'` packages a whole subtree as one download, which is the usual reason to reach
for it over a search plus per-child reads.

## Three things to get right when writing

All verified against a live server:

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

## Auth

**The auth routes are not in Tiled's OpenAPI schema.** The server generates it without its auth router,
so the client resolves every auth URL from `GET /api/v1/`'s `authentication.links` at call time. A
server with authentication disabled reports `links: null`, and those hooks then fail with a
`TiledApiError` saying so — check `useTiledServerInfoQuery().data?.authentication?.required` before
offering a login UI at all.

On success the tokens are persisted — `localStorage` in a browser, memory elsewhere — set as the
client's bearer token, and refreshed automatically on a later 401. That refresh is skipped for any call
that chose its own credentials (`apiKey: null`, a one-off key, an explicit `Authorization` header) or
that was sent elsewhere with `requestOptions.baseUrl`, so it can never substitute the stored session for
an identity you picked, or offer the refresh token to a server that did not issue it.

Login invalidates **every** Tiled query: what you are allowed to see changes with your identity, so
every cached read is suspect, including a search that legitimately returned nothing.
`useTiledLogoutMutation` **always clears local credentials**, including when the server is unreachable or
advertises no logout endpoint; the mutation still rejects so you can report the failure.

The storage keys are shared with the `<Tiled>` viewer component, so a login through either is a login for
both.

## Query keys

Keys are `['tiled', <resource>, <args | null>, { baseUrl, initialPath }]` — the scope goes **last**, so
prefix matching still works:

```ts
queryClient.invalidateQueries({ queryKey: ['tiled', 'search'] }); // every search
```

Fourteen resources: `search`, `distinct`, `metadata`, `array`, `table`, `container`, `node`, `awkward`,
`ragged`, `revisions`, `asset`, `webhooks`, `serverInfo`, `auth`. They are named after **resources, not
transports**: when a websocket eventually pushes an update for a node, it will invalidate `metadata`
through this same surface.

**All eight search hooks share the `search` root**, because they are the same endpoint with different
filters — two hooks that build identical filters correctly share one entry.

**The scope carries `initialPath` as well as `baseUrl`.** Tiled prepends the client's initial path to
relative request paths, so the same relative path under two prefixes is two different pieces of data. A
per-call `requestOptions.baseUrl` or `initialPath` overrides the scope, and `pathMode: 'absolute'`
resolves the prefix to `''` because such a request ignores it.

**Array and table keys hold a projection of the options, not the object.** Only the fields that change
the response take part — `stack`, `downSampleRatio`, `maxBytesAllowed`, `format`, `isRGB`,
`channelFirst`, `partition`, `column`. `signal`, `client`, `structure` and `arrayItem` are excluded,
which is what makes it safe to pass a fresh options object (and a fresh `AbortSignal`) every render.

The API key is deliberately **not** part of any key: it would put a secret into the Devtools cache
inspector, and because auth is applied at request time a credential change invalidates everything rather
than one entry. Use `invalidateAllTiledQueries(queryClient)` after rotating it.

Build keys with the exported factory rather than by hand — `tiledQueryKeys.search(scope, args)`,
`tiledQueryRoots.metadata`, and so on.

## Invalidation bundles

| bundle      | resources refreshed                                    |
| ----------- | ------------------------------------------------------ |
| `search`    | search, distinct                                       |
| `metadata`  | metadata, revisions                                    |
| `data`      | array, table, container, node, awkward, ragged         |
| `structure` | search, distinct, metadata, revisions, container, node |
| `webhooks`  | webhooks                                               |
| `info`      | serverInfo                                             |
| `auth`      | auth                                                   |
| `all`       | all fourteen                                           |

Three rules decide which bundle a write uses: a **metadata write** refreshes that node and the searches
that could have matched on what changed; a **data write** refreshes the data _and_ the metadata, because
a write can change a structure (`patchArrayFull` with `extend: true` grows the shape); a **create,
delete or register** uses `structure`, which also covers the parent container's contents.

```tsx
const invalidate = useTiledInvalidate();
await invalidate.roots('search', 'metadata'); // individual resources
await invalidate.bundles('data'); // a named bundle
await invalidate.all(); // everything — after a login or a key change
```

## Guards

`enabled` is applied after your options with `??`, so an options object carrying `enabled: undefined`
falls through to the guard instead of clobbering it.

| hook                                                                      | idle until                         |
| ------------------------------------------------------------------------- | ---------------------------------- |
| every path-addressed query                                                | its path is non-empty              |
| `useTiledSearchByFullTextQuery`                                           | `filter.text` is non-empty         |
| `useTiledDistinctQuery`                                                   | the config asks for a facet        |
| `useTiledArrayBlockQuery`, the asset hooks, `useTiledWebhookHistoryQuery`  | its required argument is defined   |

Pass `enabled` in the options to override either way. Forcing one of the last group past its guard raises
`FinchMissingArgumentError` — named, before any request goes out — rather than sending `undefined` where
the server expects an identifier.

## Cancelling

Queries are cancelled on unmount and by `queryClient.cancelQueries`. To cancel from your own code as
well, pass a signal; the two compose, so either one aborts the request:

```tsx
const runs = useTiledSearchQuery('', undefined, undefined, { signal: controller.signal });
```

## Errors

| type                            | when                                                                     |
| ------------------------------- | ------------------------------------------------------------------------ |
| `TiledApiError`                 | the server answered 4xx/5xx, or the request never got there              |
| `TiledEndpointUnavailableError` | the client injected via `TiledApiProvider` does not implement the method |
| `FinchMissingArgumentError`     | a guarded hook was forced past its guard with its argument undefined     |
| a DOM `AbortError`              | the request was cancelled                                                |

`TiledApiError` carries `status`, `method`, `path`, `responseBody`, and for a 422 `isValidationError`
plus parsed `validationErrors`. Its message is assembled from whichever error envelope Tiled used, so you
get `GET /metadata/x failed with 404: No such entry` rather than `Request failed with status code 404`.

```tsx
if (item.isError && isTiledApiError(item.error) && item.error.status === 404) {
    return <p>That run no longer exists.</p>;
}
```

The queue-server hooks fail the same way, with `QServerApiError` — same fields, same shape, so a
component handling one handles the other.

**Two non-errors:** `useTiledServerInfoQuery` resolves `null` for an unreachable or unparseable server,
and `useTiledLoginMutation` resolves `null` for bad credentials. Neither sets `isError`. That asymmetry is
deliberate — a login screen probes servers it knows nothing about and needs an answer rather than an
exception. Use `useTiledAboutQuery` when you want the error instead.

## Worked example

```tsx
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
