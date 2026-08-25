# Tiled query layer (`tiled`)

TanStack Query hooks over [`@blueskyproject/tiled`](https://www.npmjs.com/package/@blueskyproject/tiled)
— **18 queries, one mutation and one URL helper** — plus a provider for injecting a client and
re-exports of the package's own client and configuration functions.

> This replaced the hand-rolled hooks now parked in `src/api/tiled_archive/hooks.ts`. That file is kept
> for reference only: nothing imports it, and `tsconfig.json` excludes it because it cannot compile
> against `@blueskyproject/tiled` 0.0.33. See the bottom of `SKILLS.md` for the old-to-new hook map.

## Quickstart

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinchConfigProvider } from '@/app/FinchConfigProvider';
import { useTiledSearchBySpecsQuery, useTiledMetadataQuery } from '@/api/tiled';

const queryClient = new QueryClient();

<FinchConfigProvider config={{ tiledApiUrl: 'http://localhost:8000/api/v1' }}>
    <QueryClientProvider client={queryClient}>
        <RunBrowser />
    </QueryClientProvider>
</FinchConfigProvider>;

function RunBrowser() {
    const runs = useTiledSearchBySpecsQuery('', { include: ['BlueskyRun'], exclude: [] });
    const [selected, setSelected] = useState<string>();
    const item = useTiledMetadataQuery(selected ?? ''); // idle until something is selected

    if (runs.isPending) return <p>loading…</p>;
    if (runs.isError) return <p>{runs.error.message}</p>;
    return (
        <ul>
            {runs.data.data.map((run) => (
                <li key={run.id}>{run.id}</li>
            ))}
        </ul>
    );
}
```

The base URL must include the API version segment — `http://host:8000/api/v1` — because that is what
the package expects. Nothing here appends it: guessing would silently point a misconfigured app at a
URL it never asked for.

## Positional arguments

Every hook takes its arguments positionally, always in the same order:

```ts
useTiledSomethingQuery(...endpointArgs, queryOptions?, requestOptions?);
useTiledSomethingMutation(mutationOptions?, requestOptions?);
```

| position                     | what it is                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------- |
| the endpoint's own arguments | a path, a filter, a format — named and typed, so hover tells you what is required |
| TanStack options             | `FinchQueryOptions` for queries, `FinchMutationOptions` for mutations             |
| `requestOptions`             | `baseUrl`, `apiKey`, `initialPath`, `pathMode`, `signal`, `client`                |

**`requestOptions` is always last**, and means exactly the same thing on every Finch backend — where
this one call goes and who it is. The queue-server hooks use the identical order; the convention is
stated in full, once, in [`src/api/shared/queryOptions.ts`](../shared/queryOptions.ts). Transport goes
last because it is the rarest thing to pass, so the common call needs no placeholder:

```ts
useTiledMetadataQuery('scan/detector', { staleTime: 60_000 });
useTiledSearchQuery('', undefined, undefined, { baseUrl: 'http://other:8000/api/v1' });
```

**The array and table hooks take one extra slot** for the endpoint's own parameters, because the
package merges them with transport — its `TiledArrayRequestOptions` extends `TiledRequestOptions`, so
`stack` and `baseUrl` arrive in one object. The hooks split them apart (`TiledArrayJSONEndpointOptions`
is `Omit<TiledArrayJSONOptions, keyof TiledRequestOptions>`) and recombine before calling through, so
that `requestOptions` does not mean two different things depending on which hook you are looking at:

```ts
useTiledArrayAsJSONQuery('scan/detector', { stack: [4], maxBytesAllowed: 2_000_000 });
useTiledTablePartitionAsJSONQuery('scan/primary', { partition: 0 }, { refetchInterval: 1000 });
useTiledTablePartitionAsJSONQuery('scan/primary', { partition: 0 }, undefined, { baseUrl });
```

`hooks/typeTests.ts` asserts that no transport key survives in the endpoint types, so a future package
version that moves `stack` into `TiledRequestOptions` breaks the build rather than the split.

`queryKey`, `queryFn` and `mutationFn` are omitted from the TanStack option types — the hook owns them,
and overriding the key would detach the entry from the invalidation map. `hooks/typeTests.ts` pins this
at compile time.

## The hooks

### Search — `searchHooks.ts`

All seven call `GET /api/v1/search/{path}`; the six conveniences just build the filter for you. Shape:
`(searchPath, filter, searchOptions?, queryOptions?, requestOptions?)`.

| hook                                      | filter type                               |
| ----------------------------------------- | ----------------------------------------- |
| `useTiledSearchQuery`                     | a whole `TiledSearchConfig` (second slot) |
| `useTiledSearchBySpecsQuery`              | `{ include, exclude }`                    |
| `useTiledSearchByFullTextQuery`           | `{ text }`                                |
| `useTiledSearchByMetadataEqualsQuery`     | `{ key, value }`                          |
| `useTiledSearchByStructureFamilyQuery`    | `{ value: 'array' \| … }`                 |
| `useTiledSearchByRegexQuery`              | `{ key, pattern, caseSensitive? }`        |
| `useTiledSearchByMetadataComparisonQuery` | `{ operator, key, value }`                |

`searchPath: ''` is the **root container**, and legal — so unlike the data hooks these have no path
guard. The first four mirror functions the package ships; regex and comparison do not exist in the
package but did in the legacy Finch hooks, and `TiledSearchFilters` supports them. For the other nine
filters (`lookup`, `keysFilter`, `noteq`, `contains`, `in`, `notin`, `keyPresent`, `like`, `accessBlob`)
use `useTiledSearchQuery` directly.

### Metadata, data and info

| hook                                              | reads                                           |
| ------------------------------------------------- | ----------------------------------------------- |
| `useTiledMetadataQuery(path)`                     | one item's metadata, specs, links and structure |
| `useTiledArrayAsQuery(path, type)`                | an array in any of the four formats             |
| `useTiledArrayAsJSONQuery(path)`                  | `number[][]` by default; override the shape     |
| `useTiledArrayAsPngQuery(path)`                   | a PNG `Blob`                                    |
| `useTiledArrayAsBufferQuery(path)`                | a raw `ArrayBuffer`                             |
| `useTiledArrayImagePath(path)`                    | **not a query** — a URL for `<img src>`         |
| `useTiledTableAsQuery(path, type, endpoint)`      | a table in either format, either endpoint       |
| `useTiledTablePartitionAsJSONQuery(path)`         | one partition, column-oriented                  |
| `useTiledTablePartitionAsJSONSequenceQuery(path)` | one partition, row-oriented                     |
| `useTiledTableFullAsJSONQuery(path)`              | every partition, column-oriented                |
| `useTiledTableFullAsJSONSequenceQuery(path)`      | every partition, row-oriented                   |
| `useTiledServerInfoQuery()`                       | the `/api/v1/` root document                    |
| `useTiledLoginMutation()`                         | username/password login (the only mutation)     |

Narrow a metadata structure by passing it: `useTiledMetadataQuery<ArrayStructure>(path)` types
`data.attributes.structure.shape`. Or use the re-exported `isArrayStructure` / `isTableStructure` /
`isContainerStructure` guards.

Two return values that surprise people, both the package's behaviour rather than ours:

- **`useTiledServerInfoQuery().data` can be `null`** — an unreachable server resolves `null` instead of
  throwing, so `isError` stays `false`.
- **`useTiledLoginMutation()` resolves `null` on a wrong password** rather than rejecting. Check the
  resolved value, not `isError`.

## Where the client comes from

1. the client injected via `TiledApiProvider`, if there is one — the seam that lets a stub drive
   hook-based components in tests and Storybook;
2. otherwise the package's module-level singleton, `getDefaultTiledApiClient()`.

Setting `tiledApiUrl` / `tiledApiKey` on `FinchConfigProvider` is enough: those values are applied to
the default client _and_ carried on every request, so even the first fetch of the first render uses the
configured server. Absent Finch config the client's own configuration stands, so
`setDefaultTiledApiClient` and `setDefaultTiledUrl` keep working. An **injected client is never
redirected** — it is the caller's explicit choice, so Finch config is ignored for that subtree.

A partial injected client (a hand-written stub missing some methods) makes the affected hooks reject
with `TiledEndpointUnavailableError` rather than silently falling through to the network.

## Keys and invalidation

Keys are `['tiled', <resource>, <args | null>, { baseUrl, initialPath }]`, with five resources:
`search`, `metadata`, `array`, `table`, `serverInfo`. The scope is last so prefixes like
`['tiled','search']` still match — including the ones existing code already invalidates with.

Three things worth knowing:

**All seven search hooks share the `search` root.** They call one endpoint, and the built
`TiledSearchConfig` fully determines the response, so two hooks that produce identical filters
correctly share one cache entry and `['tiled','search']` refreshes every search however it was written.
The legacy hooks had eight separate search roots; of their keys only `['tiled','search']` and
`['tiled','serverInfo']` still match here.

**The scope carries `initialPath`, not just `baseUrl`.** Tiled prepends the client's initial path to
relative request paths, so the same relative path under two prefixes is two different pieces of data.
A per-call `requestOptions.baseUrl` or `initialPath` overrides the scope; `pathMode: 'absolute'`
resolves the prefix to `''`, because such a request ignores it entirely.

**Args are projections, never raw option objects** — see [`hooks/internal/keyParts.ts`](./hooks/internal/keyParts.ts).
An array/table options object carries a `signal` (a fresh identity most renders), possibly a `client`,
and possibly a whole `arrayItem`. Keying on it directly would rewrite the key every render and refetch
forever, so only the fields that change the response take part: `stack`, `downSampleRatio`,
`maxBytesAllowed`, `format`, `isRGB`, `channelFirst` for arrays; `partition` and `format` for tables.
`structure` / `arrayItem` are excluded on purpose — they only let the client skip a metadata round-trip
on the way to identical bytes.

The API key is deliberately absent from every key: it would put a secret in the Devtools cache
inspector, and a credential change invalidates everything rather than one entry. `useTiledLoginMutation`
therefore invalidates all five roots, and `invalidateAllTiledQueries(queryClient)` is the hook-free way
to do the same after rotating a key.

```ts
const invalidate = useTiledInvalidate();
await invalidate.roots('search'); // one resource
await invalidate.bundles('data'); // array + table
await invalidate.all(); // everything
```

## Guarded queries

`enabled` is applied **after** the caller's options, with `??` — so an options object carrying
`enabled: undefined` (trivially produced by spreading props) falls through to the guard instead of
clobbering it. That is a real bug in the legacy hooks.

| hook                                            | idle until                 |
| ----------------------------------------------- | -------------------------- |
| `useTiledMetadataQuery`                         | `path` is non-empty        |
| the four array hooks + `useTiledArrayImagePath` | `arrayPath` is non-empty   |
| the five table hooks                            | `tablePath` is non-empty   |
| `useTiledSearchByFullTextQuery`                 | `filter.text` is non-empty |

So `useTiledMetadataQuery(selected ?? '')` makes no request until something is selected. Pass
`enabled` in the last parameter to override.

## Notes

- **Cancellation composes.** TanStack's signal and any `requestOptions.signal` are merged, so
  unmounting or `cancelQueries` aborts the in-flight request whether or not you passed one.
- **The hooks call client methods, not the package's free functions.** `getTiledSearch(…)` and friends
  are hard-wired to the package's own singleton, so there would be no way to inject a client. The
  methods are what those functions call anyway.
- **`useTiledArrayImagePath` is not a query.** `getArrayAsImagePath` is synchronous — it composes a URL
  and makes no request — so caching it would only cache string concatenation. Being synchronous it
  cannot fetch the array structure either: pass `structure` or `arrayItem` if you want downsampling.
- **Some package types are derived, not imported.** `TiledInfoResponse`, the array/table format unions
  and the option maps are not exported from the package index, and its `exports` map forbids deep
  imports — so [`types/packageAliases.ts`](./types/packageAliases.ts) derives them from the public
  method signatures. Watch out for `TiledTableJSONResponse` in particular: the package exports that
  name from two modules with two different definitions, and only the one beside the table methods
  matches what they resolve to. Use `TiledTableJSONData` from here instead.
- **No write hooks.** This version of the package has no POST endpoints. The invalidation bundles are
  already shaped for them.
