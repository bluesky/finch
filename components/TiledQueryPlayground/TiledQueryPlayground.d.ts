/**
 * A manual testbed for the Tiled **query hooks**.
 *
 * Not to be confused with `TestTiled`, which drives the client and the endpoint registry directly
 * and never calls a hook. That one answers "does the request work"; this one answers "does the hook
 * layer behave" — keys, cache sharing, staleness, guards, invalidation. Both of the cache bugs
 * found in review were invisible from a client-level harness.
 *
 * It covers **reads and writes**: 41 query hooks and 27 mutation hooks. The writes are here for one
 * reason, since `TestTiled` already fires every one of them with better binary handling —
 * invalidation. `useTiledMutation` awaits a hand-written bundle map before `mutateAsync` resolves,
 * and pinning a query while running a mutation against the same node is the only way to see whether
 * the right entries actually refetched.
 *
 * ## Two things it deliberately owns
 *
 * **Its own `QueryClient`.** Invalidating and clearing here cannot touch the host app's cache, and
 * the inspector shows only playground entries. `retry: false` because three attempts on a 404 makes
 * the status flicker through states that did not happen, and `refetchOnWindowFocus: false` because
 * alt-tabbing back would refetch and make every timing on screen a lie.
 *
 * **Its own client, through `TiledApiProvider`.** Not per-call `requestOptions` — a per-call
 * `apiKey` marks a request `__tiledCallerCredentials`, which deliberately disables the 401 refresh,
 * so a playground built that way could never exercise refresh at all. The provider also means this
 * exercises the injection seam itself, and an injected client is never redirected by Finch config,
 * so the bar is authoritative.
 */
export default function TiledQueryPlayground(): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TiledQueryPlayground.d.ts.map