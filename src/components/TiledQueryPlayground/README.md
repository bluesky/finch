# TiledQueryPlayground

A manual testbed for the **41 Tiled query hooks**: pick one, edit its inputs, watch what the hook
does. Mounted as the "Tiled Queries" tab of `/test`.

## It is not `TestTiled`

|  | `TestTiled` | `TiledQueryPlayground` |
| --- | --- | --- |
| Drives | `endpoint.call(client, input)` from the registry | the `useTiled…Query` hooks |
| Exercises | the client, the wire format, auth | TanStack: keys, cache, staleness, guards, invalidation |
| Covers | all 55 endpoints, reads **and writes** | the 40 queries + `useTiledArrayImagePath` |
| Answers | "does the request work" | "does the hook layer behave" |

`TestTiled` never calls a hook, so it cannot show a cache collision, a guard that fails to idle, or
a key that forks on the wrong field. Both of the P1 cache bugs found in review were invisible from
a client-level harness — which is why this one exists.

## The constraint that shapes it

**A hook cannot be called dynamically.** `catalog[selected].hook(...args)` is illegal: React
identifies hooks by call order within a component, so the call site has to be fixed.

So each query gets its own small component — a **Runner** — created at module scope, calling exactly
one hook, and rendering its own result panel:

```tsx
function SearchRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledSearchQuery(
        str(values, 'searchPath'),
        json<TiledSearchConfig>(values, 'config'),
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" />;
}
```

Two decisions inside that, both load-bearing:

- **The Runner renders, rather than reporting state upward.** An effect lifting hook state to a
  parent would add a render cascade and a frame of lag to every status change, in a tool whose job
  is showing status changes accurately.
- **Runners are at module scope, never built during render.** A component identity created in
  render remounts every render, which would refetch forever.

`QueryRunnerProps.queryOptions` is a narrow `PlaygroundQueryOptions` (`enabled`, `staleTime`,
`refetchInterval`) rather than `FinchQueryOptions<…>` — the latter is parameterised by each hook's
response and key types, so one value could not be passed to all 41 without a cast. These three are
assignable to every hook's options as-is, which keeps the **endpoint argument** slots — where drift
actually happens — fully type-checked.

## Connection

The bar at the top owns the server and the credentials: base URL, initial path, API key (with scheme
and location), access token and refresh token.

**It binds through `TiledApiProvider`, not per-call `requestOptions`.** Not interchangeable: a
per-call `apiKey` marks a request `__tiledCallerCredentials`, which deliberately disables the 401
refresh, so a playground built that way could never exercise refresh at all. The provider holds the
bearer and refresh token together, like a real app's client, and means this also exercises the
injection seam.

**Apply is explicit.** Committing on every keystroke would rebuild the client and remount every
mounted query, firing a request per character.

**Token storage is memory by default.** The browser keys (`tiledAccessToken` / `tiledRefreshToken`)
are shared with the `<Tiled>` viewer component, so an experimental refresh token typed here would
otherwise change its session too. The opt-in checkbox says so.

## What the result panel shows

Beyond the response: `status` and `fetchStatus` **separately**, because a guarded query reads
`pending`/`idle` and is *not* loading — it is waiting for an argument. Conflating them is why an
idled hook looks broken. Plus `isFetching`, `isStale`, `dataUpdatedAt`, `failureCount`, and a
`TiledApiError`'s `status` and `validationErrors` broken out.

Results render by kind: a PNG as a picture (with the object URL revoked on unmount), CSV as text,
an `ArrayBuffer` as a size, hex head and download, and `useTiledArrayImagePath`'s URL as both.

## The cache inspector

A live view of the playground's own `QueryCache`. With **pinning** — keeping several queries mounted
— it demonstrates the behaviours this layer has got wrong before:

- two searches whose filters build the same config share **one** entry;
- two table reads differing only in `column` get **two** (the P1 collision, now fixed);
- `useTiledServerInfoQuery` and `useTiledAboutQuery` get **two** (the other P1);
- changing the base URL forks the scope and doubles everything;
- unpinning leaves an entry with `observers: 0`, which is what `gcTime` counts down.

### Its own `QueryClient`

So invalidating and clearing cannot touch the host app's cache, and the inspector shows only
playground entries. Defaults tuned for manual testing:

- `retry: false` — three attempts on a 404 makes the status flicker through states that did not happen
- `refetchOnWindowFocus: false` — alt-tabbing back would refetch and make every timing on screen a lie
- `gcTime: 60_000` — short enough to keep the inspector readable, long enough to watch an entry
  outlive its observer

## Inputs are debounced

Field values feed hook arguments and therefore query keys, so without debouncing, typing a
53-character node path minted 53 cache entries and fired a request for each. `useDebouncedValues`
settles them at 250ms; the editors hold their own text locally, so typing stays instant.

## Adding a query

1. Write a Runner in the matching `catalog/*.tsx`, calling exactly one hook.
2. Add a descriptor beside it: `id`, `group` (the endpoint registry's groups), `hookName`, `summary`,
   `fields`, `guardedBy`, `resultKind`.
3. Export it from the group's array; `catalog/index.ts` picks it up.

`TiledQueryCatalog.test.ts` diffs the catalog against the hooks `@/api/tiled` exports, so a new hook
fails CI until it has a descriptor — the same arrangement that keeps the endpoint registry honest.

## Not covered

**Mutations.** `TestTiled` already runs all 26 writes behind a confirm. The same catalog shape would
extend to them; it was scoped out deliberately.

**Not exported from `src/index.ts`**, matching `TestQserver` and `TestTiled`. One line to change if
it should ship as a debugging tool for downstream apps.
