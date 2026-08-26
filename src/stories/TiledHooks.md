# Tiled Query Hooks

Every method on `@blueskyproject/tiled`'s client has a TanStack Query hook in `@/api/tiled` —
**18 queries, one mutation and one URL helper**. This page lists all of them with the exact call shape.

These are the hooks over the client API introduced in `@blueskyproject/tiled` 0.0.33, and they back
every Tiled component Finch ships. The older, narrower set they replaced is documented on the
[Tiled API Hooks](?path=/docs/documentation-tiled-api-hooks--docs) page and is retired — its source is
kept for reference in `src/api/tiled_archive/hooks.ts`.

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
| `loginWithUsernamePassword` | `useTiledLoginMutation`             |

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
| `requestOptions`             | `baseUrl`, `apiKey`, `initialPath`, `pathMode`, `signal`, `client`                 |

**`requestOptions` is always last**, and it means the same thing here as on the queue-server hooks:
where this one call goes and who it is. Last because it is the rarest thing to pass, so the common
call needs no placeholder — `useTiledMetadataQuery(path, { staleTime: 60_000 })`.

**The array and table hooks take one extra slot**, for the endpoint's own parameters. The package
merges those with transport — `TiledArrayRequestOptions` extends `TiledRequestOptions`, so `stack` and
`baseUrl` arrive together — and the hooks split them back apart so that `requestOptions` does not mean
one thing on some hooks and something wider on others.

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
package's default client _and_ carried on every request, so the first fetch of the first render already
goes to the right server. **The URL must include `/api/v1`** — the package expects it, and nothing
appends it for you.

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

`string`, `number`, `boolean` and `null` all work, and `in` / `notin` encode each element of the list.
Watch out for this if you have ever written the raw API: numbers and booleans are valid JSON bare, so
forgetting to quote only ever broke _string_ values, which made it look like an intermittent fault
rather than a systematic one.

The remaining filters are deliberately **not** encoded — `fulltext.text`, `regex.pattern`,
`like.pattern`, `lookup.key` and `structureFamily.value` are plain strings server-side, and `specs` is
already handled by the package.

`useTiledSearchByFullTextQuery` stays **idle while `filter.text` is empty**, since an empty full-text
search matches everything and is rarely what a search box means on first render.

The package ships convenience functions for the first four filters only; regex and comparison exist here
because the legacy Finch hooks had them and `TiledSearchFilters` supports them. For the other nine
filters — `lookup`, `keysFilter`, `noteq`, `contains`, `in`, `notin`, `keyPresent`, `like`, `accessBlob`
— use `useTiledSearchQuery` and build the config yourself:

```tsx
const inList = useTiledSearchQuery('experiments', {
    searchFilters: { in: { key: 'start.plan_name', value: ['count', 'scan'] } },
});
```

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

| hook                         | returns `data`             | endpoint                        |
| ---------------------------- | -------------------------- | ------------------------------- |
| `useTiledArrayAsQuery`       | per `type`                 | `GET /api/v1/array/…`           |
| `useTiledArrayAsJSONQuery`   | `number[][]`               | `GET /api/v1/array/full/{path}` |
| `useTiledArrayAsPngQuery`    | `Blob`                     | `GET /api/v1/array/full/{path}` |
| `useTiledArrayAsBufferQuery` | `ArrayBuffer`              | `GET /api/v1/array/full/{path}` |
| `useTiledArrayImagePath`     | `string` — **not a query** | (no request)                    |

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

Column-oriented is usually what a plotting library wants; row-oriented is what a table wants.

```tsx
const columns = useTiledTablePartitionAsJSONQuery('scans/run1/primary', { partition: 0 });
const x = columns.data?.['motor'] ?? [];
const y = columns.data?.['I0'] ?? [];
```

## Server info

| hook                      | argument | returns `data`              | endpoint       |
| ------------------------- | -------- | --------------------------- | -------------- |
| `useTiledServerInfoQuery` | —        | `TiledInfoResponse \| null` | `GET /api/v1/` |

**`data` can be `null`.** The package catches an unreachable server or an unparseable response and
resolves `null` rather than throwing, so `isError` stays `false`:

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

The only mutation: this version of the package exposes no write endpoints.

```tsx
const login = useTiledLoginMutation();

const submit = async () => {
    const tokens = await login.mutateAsync({ username, password });
    if (!tokens) setError('Login failed'); // null, NOT a rejection
};
```

`mutate({ username, password, url?, provider? })` — `url` overrides the server, and `provider` lets you
pass one from `useTiledServerInfoQuery().data?.authentication?.providers` instead of letting the package
pick the first password provider.

On success the package stores the tokens in `localStorage`, sets the bearer token on the client, and
refreshes it automatically on a later 401. The hook then invalidates **every** Tiled query: what you are
allowed to see changes with your identity, so every cached read is suspect — including a search that
legitimately returned nothing.

---

## Query keys

Keys are `['tiled', <resource>, <args | null>, { baseUrl, initialPath }]` — the scope goes **last**, so
prefix matching still works:

```ts
queryClient.invalidateQueries({ queryKey: ['tiled', 'search'] }); // every search
```

Five resources: `search`, `metadata`, `array`, `table`, `serverInfo`.

**All seven search hooks share the `search` root**, because they are the same endpoint with different
filters. Two hooks that build identical filters correctly share one cache entry.

**The scope carries `initialPath` as well as `baseUrl`.** Tiled prepends the client's initial path to
relative request paths, so the same relative path under two prefixes is two different pieces of data. A
per-call `requestOptions.baseUrl` or `initialPath` overrides the scope, and `pathMode: 'absolute'`
resolves the prefix to `''` because such a request ignores it.

**Array and table keys hold a projection of the options, not the object.** Only the fields that change
the response take part — `stack`, `downSampleRatio`, `maxBytesAllowed`, `format`, `isRGB`,
`channelFirst`, `partition`. `signal`, `client`, `structure` and `arrayItem` are excluded, which is what
makes it safe to pass a fresh options object (and a fresh `AbortSignal`) on every render.

The API key is deliberately not part of any key: it would put a secret into the Devtools cache
inspector, and because auth is applied at request time a credential change invalidates everything rather
than one entry. Use `invalidateAllTiledQueries(queryClient)` after rotating it.

Build keys with the exported factory rather than by hand — `tiledQueryKeys.search(scope, args)`,
`tiledQueryRoots.metadata`, and so on.

## Invalidation bundles

| bundle     | resources refreshed |
| ---------- | ------------------- |
| `search`   | search              |
| `metadata` | metadata            |
| `data`     | array, table        |
| `info`     | serverInfo          |
| `all`      | all five            |

```tsx
const invalidate = useTiledInvalidate();
await invalidate.roots('search', 'metadata'); // individual resources
await invalidate.bundles('data'); // a named bundle
await invalidate.all(); // everything — after a login or a key change
```

## Guarded queries

`enabled` is applied after your options with `??`, so an options object carrying `enabled: undefined`
falls through to the guard instead of clobbering it.

| hook                                            | idle until                 |
| ----------------------------------------------- | -------------------------- |
| `useTiledMetadataQuery`                         | `path` is non-empty        |
| the four array hooks + `useTiledArrayImagePath` | `arrayPath` is non-empty   |
| the five table hooks                            | `tablePath` is non-empty   |
| `useTiledSearchByFullTextQuery`                 | `filter.text` is non-empty |

Pass `enabled` in the last parameter to override either way.

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

Everything rejects with an `Error`, surfaced through `error`. `@blueskyproject/tiled` ships no error
class of its own, so what you get is:

| type                            | when                                                                     |
| ------------------------------- | ------------------------------------------------------------------------ |
| an axios error                  | the server answered 4xx/5xx — narrow with axios's `isAxiosError`         |
| `TiledEndpointUnavailableError` | the client injected via `TiledApiProvider` does not implement the method |
| a DOM `AbortError`              | the request was cancelled                                                |

Remember the two non-errors: `useTiledServerInfoQuery` resolves `null` for an unreachable server, and
`useTiledLoginMutation` resolves `null` for bad credentials. Neither sets `isError`.
