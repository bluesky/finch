# Queue Server API client (`qServer`)

A complete client for [bluesky-httpserver](https://github.com/bluesky/bluesky-httpserver):
all **70 operations** from `openapi.json`, the three websockets, and utilities for swapping
the API key, injecting your own axios instance, and registering interceptors.

Modelled on the Tiled API client in
[tiled-viewer-react](https://github.com/bluesky/tiled-viewer-react/tree/main/src/components/Tiled/api):
a `QServerApiClient` class plus a module-level default instance with a flat free-function
facade.

> This replaced the hand-rolled client and hooks now parked in `src/api/qServer_archive`. That folder is
> kept for reference only — nothing imports it. Every Finch component reads the queue server through
> this layer; see the bottom of `SKILLS.md` for the old-to-new hook map.

## Quickstart

```ts
import { getStatus, setGlobalApiKey, setGlobalBaseUrl } from '@/api/qServer';

setGlobalBaseUrl('http://localhost:60610'); // origin — NOT .../api
setGlobalApiKey('test');

const status = await getStatus();
console.log(status.manager_state); // 'idle'
```

### Base URL is the origin

Every path in the spec already starts with `/api/`, so the client's base URL must be the bare
origin. `setBaseUrl` strips a trailing `/api` for you, because `useQueueServerApiUrls()` and
most existing Finch config hand out `http://host:60610/api`:

```ts
client.setBaseUrl('http://host:60610/api'); // stored as 'http://host:60610'
```

## Three levels of control

```ts
// 1. the app-wide client
import { getQueue, setGlobalApiKey } from '@/api/qServer';
setGlobalApiKey('another-key'); // affects the very next request; no rebuild
await getQueue();

// 2. your own instance
import { createQServerApiClient, setDefaultQServerClient } from '@/api/qServer';
const client = createQServerApiClient({
    baseUrl: 'http://localhost:60610',
    apiKey: 'test',
    client: myAxiosInstance, // optional: adopt an existing axios instance
    timeout: 10_000,
});
setDefaultQServerClient(client); // optional: make it the app-wide one
await client.getQueue();

// 3. one call at a time
await getQueue(undefined, {
    baseUrl: 'http://other-host:60610', // a different server, just this once
    apiKey: 'one-off',
    client: otherAxios,
    signal: controller.signal,
});
```

Per-request options never touch client state: the next call goes back to the configured base URL and
key. `baseUrl` is normalized like `setBaseUrl` (a trailing `/api` is stripped), and it does not
redirect the built-in 401 refresh, which always talks to the client's own server.

`resetDefaultQServerClient()` discards the singleton — call it in `beforeEach` so tests do
not leak configuration into one another.

### Authentication

| What                 | How                                                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API key in a header  | default; `Authorization: Apikey <key>` (the casing the spec documents)                                                                                         |
| API key in the query | `setGlobalApiKeyLocation('query')` → `?api_key=<key>`                                                                                                          |
| Legacy header casing | `client.setApiKeyScheme('ApiKey')` — what `src/api/qServer` sends today                                                                                        |
| Bearer token         | `setGlobalBearerToken(jwt)`; takes precedence over the API key                                                                                                 |
| Refresh on 401       | set a `refreshToken`; one single-flight refresh against `/api/auth/session/refresh`, then one retry. On failure the client clears auth and calls `onAuthError` |

The key is read **at request time** by a built-in interceptor, which is why `setApiKey` takes
effect immediately without rebuilding anything.

### Interceptors

```ts
import { addRequestInterceptor, clearInterceptors, ejectInterceptor } from '@/api/qServer';

const handle = addRequestInterceptor((config) => {
    console.log(config.method, config.url);
    return config;
});

ejectInterceptor(handle);
clearInterceptors(); // removes only YOUR interceptors
clearInterceptors('request'); // one kind only
```

The built-in auth and refresh handlers are tracked separately and survive
`clearInterceptors()`. `client.setAxiosClient(next)` re-installs everything — built-ins
first, then yours in registration order.

One ordering caveat: axios runs request interceptors **last-registered-first**, and the
built-in auth interceptor is registered in the constructor. Your request interceptor
therefore sees the config _before_ `Authorization` is attached.

## The payload-GET problem

18 operations are `GET`s that read their arguments from a **JSON request body**
(FastAPI's `payload: dict = {}`). Verified against RE Manager v0.0.19:
`curl -X GET -d '{"uid":"…"}'` works, `?uid=…` is ignored, and `POST` returns 405.

Browsers cannot send a body on a GET — `fetch` rejects it and `XMLHttpRequest` drops it
silently. Most of the 18 take an _optional_ payload, so a bodiless call still works; the
table below covers the rest.

| Endpoint                                                                                                                                                                                                             | In a browser                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getStatus`, `ping`, `getRoot`, `getConfig`, `getQueue`, `getQueueHistory`, `getPlansAllowed`, `getDevicesAllowed`, `getPlansExisting`, `getDevicesExisting`, `getREMetadata`, `getConsoleOutput`, `testServerSleep` | fine — arguments are optional, so the call goes out with no body                                                                                              |
| `getQueueItem({ uid })`                                                                                                                                                                                              | falls back to scanning `getQueue()`                                                                                                                           |
| `getLockInfo()`                                                                                                                                                                                                      | falls back to the `lock` field of `getStatus()`; owner, time and note are unavailable                                                                         |
| `getConsoleOutputUpdate({ last_msg_uid })`                                                                                                                                                                           | falls back to `getConsoleOutput()` + `getConsoleOutputUID()`, which cannot deliver incrementally — prefer `useQServerConsoleSocket`                           |
| `getTaskStatus`, `getTaskResult`                                                                                                                                                                                     | **no viable path.** Both require a body even when empty. This also means the results of `executeFunction` and `uploadScript` cannot be collected browser-side |

Behaviour is governed by `getBodyStrategy`:

| Strategy           | Effect when a browser needs to send a body                                    |
| ------------------ | ----------------------------------------------------------------------------- |
| `'auto'` (default) | use the declared fallback if there is one, otherwise warn once and try anyway |
| `'body'`           | always attempt the request; the body is dropped and the server sees `{}`      |
| `'fallback'`       | require a fallback; throw `QServerGetBodyUnsupportedError` without one        |
| `'throw'`          | never attempt; always throw                                                   |

Set it globally with `setGlobalGetBodyStrategy(…)`, per client via config, or per call via
`options.strategy`. Register `onFallback` (or `setGlobalFallbackCallback`) to be told
whenever a substitute answered.

Outside a browser — Node, vitest, SSR — the body is sent normally and all 18 behave exactly
as the API documents.

## Websockets

Three send-only sockets, none of which appear in `openapi.json`:

| Hook / factory                                           | Path                     | Scope          |
| -------------------------------------------------------- | ------------------------ | -------------- |
| `useQServerConsoleSocket` / `createQServerConsoleSocket` | `/api/console_output/ws` | `read:console` |
| `useQServerStatusSocket` / `createQServerStatusSocket`   | `/api/status/ws`         | `read:monitor` |
| `useQServerInfoSocket` / `createQServerInfoSocket`       | `/api/info/ws`           | `read:monitor` |

```tsx
const { status, connectionStatus, frameCount, reconnect } = useQServerStatusSocket();
const { text, lines, clear } = useQServerConsoleSocket({ maxLines: 500 });
```

With no arguments the hooks read the base URL and key from `FinchConfigProvider` via
`useQueueServerApiUrls()`; pass `baseUrl` / `apiKey` to override, and `enabled: false` to
keep the socket closed.

**Auth matrix**

| Mode                   | How                                                                 | Usable from a browser                      |
| ---------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| `Authorization` header | handshake header                                                    | no — browsers cannot set websocket headers |
| `'query'` (default)    | `?api_key=…` or `?access_token=…`                                   | yes                                        |
| `'message'`            | connect bare, then send `{"type":"auth","api_key":"…"}` within 10 s | yes                                        |

In `'message'` mode the server **acknowledges a successful handshake with silence** — it only
responds by closing (4401/4001) if the credentials are bad. The status therefore reads
`'authenticating'` until either the first frame arrives or the 10 s window elapses with the
socket still up, whichever comes first; both mean authenticated. A quiet channel is not an
error.

**Servers without authentication reject credentials on the handshake.** Probed against
RE Manager v0.0.19 running in `UNAUTHENTICATED_SINGLE_USER` mode:

| Handshake                                     | Result                      |
| --------------------------------------------- | --------------------------- |
| no credentials                                | `101 Switching Protocols`   |
| `?api_key=<a real key>`                       | `500 Internal Server Error` |
| `?access_token=…` / `Authorization: Bearer …` | `500`                       |
| `?api_key=<a wrong key>`                      | `101`                       |
| `Authorization: Apikey <real key>`            | `101`                       |

So on a server with authentication disabled you must pass `authMode: 'none'`; the default
`'query'` is correct once a provider is configured. The client does not guess — it will not
silently drop credentials — so if a socket fails to connect while a key is set, try
`'none'`. The `TestQserver` socket panes say the same thing inline when a socket errors.

**Other behaviour worth knowing**

- Frames are one JSON object per text frame, shaped `{ time, msg }`. Unparseable or
  wrong-shaped frames are counted (`getDroppedCount()`) and dropped, never fatal.
- Close codes `4401` (auth required) and `4001` (invalid token) set the status to `'error'`
  and **do not** trigger a reconnect — retrying with a bad key just hammers the server. Any
  other unexpected close backs off 500 ms → 15 s (×2, ±20 % jitter), resetting after a
  successful connection.
- There is **no** `send`: after the optional auth frame the server ignores client traffic and
  performs no application-level ping/pong, so the transport never invents keepalives.
- The server's per-client queue holds 1000 messages and drops the oldest on overflow, so
  consumers must tolerate gaps.

## React Query hooks

One hook per endpoint — 29 queries and 41 mutations — in [`hooks/`](./hooks). Every name starts with
`useQueue` so the queue-server family cannot collide with the eventual `useTiled...` and
`useOphyd...` families; after the prefix the client method's own name follows, minus the first
`Queue` it already contains (no stutter):

| client method  | hook                      |
| -------------- | ------------------------- |
| `getStatus`    | `useQueueGetStatusQuery`  |
| `getQueue`     | `useQueueGetQuery`        |
| `addQueueItem` | `useQueueAddItemMutation` |
| `startQueue`   | `useQueueStartMutation`   |
| `pauseRE`      | `useQueuePauseREMutation` |
| `whoami`       | `useQueueWhoamiQuery`     |

The helper and socket hooks keep their `useQServer...` names — they are infrastructure, not
endpoints: `useQServerClient`, `useQServerInvalidate`, `useQServerSocket`,
`useQServerStatusSocket`, `useQServerConsoleSocket`, `useQServerInfoSocket`.

```tsx
import { useQueueGetQuery, useQueueGetStatusQuery, useQueueAddItemMutation } from '@/api/qServer';

function QueueWidget() {
    const status = useQueueGetStatusQuery(undefined, {}, { refetchInterval: 1000 });
    const queue = useQueueGetQuery();
    const add = useQueueAddItemMutation();

    return (
        <button
            disabled={add.isPending}
            onClick={() => add.mutate({ item: { name: 'count', item_type: 'plan' } })}
        >
            {queue.data?.items.length ?? 0} queued - {status.data?.manager_state}
        </button>
    );
}
```

### Positional arguments

Every hook takes its arguments positionally, always in the same order:

```ts
useQueueSomethingQuery(arg?, requestOptions?, queryOptions?);
useQueueSomethingMutation(requestOptions?, mutationOptions?);
```

| position             | what it is                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — the argument     | the endpoint's own argument, forwarded to the client method and part of the query key. Present only where the endpoint really takes one |
| 2 — `requestOptions` | transport overrides: `baseUrl`, `apiKey`, `headers`, `query`, `signal`, `axiosConfig`, plus `strategy`/`fallback` on the payload-GETs   |
| 3 — TanStack options | `FinchQueryOptions` for queries, `FinchMutationOptions` for mutations                                                                   |

Positional rather than one options bag, so the endpoint's own argument is the first thing you see on
hover, named and typed — including whether it is required:

```ts
useQueueGetStatusQuery({}, { refetchInterval: 1000 }); // no argument slot at all
useQueueGetItemQuery({ uid }); // required argument, first
useQueueGetItemQuery(undefined); // ...explicitly idle
```

A GET that needs no arguments gets **no argument parameter**. Several of them (`status`, `ping`,
`queue`, `history`, `re/metadata`, `config`, `lock/info`) do accept an optional payload server-side,
but it can only travel in a GET request body, which no browser will send — offering the parameter
would only invite a silent no-op, so the hooks omit it. Use the client directly from Node if you
genuinely need one.

`queryKey`, `queryFn` and `mutationFn` are omitted from the TanStack option types — the hook owns
them, and overriding the key would detach the entry from the invalidation map.
`hooks/typeTests.ts` pins this at compile time.

Mutation bodies go to `mutate`, so one hook can perform many writes:

```ts
const move = useQueueMoveItemMutation();
move.mutate({ uid, pos_dest: 'front' });
```

The three endpoints taking positional scalars use object variables: `{ uuid, body }`,
`{ firstEight }`, `{ sessionId }`.

Four queries hold themselves idle until addressed — `useQueueGetItemQuery` (needs `uid` or `pos`),
`useQueueGetTaskStatusQuery` and `useQueueGetTaskResultQuery` (need `task_uid`), and
`useQueueGetPrincipalQuery` (needs `uuid`). Their argument is a _required_ parameter that accepts
`undefined`, so the idle case is written out at the call site rather than being implied by omission.

### Where the client comes from

1. the client injected via `QServerApiProvider` (`@/api/qServerRuntime`), if there is one — this is
   what lets [qserver-sim](../../lib/qserver-sim/README.md) drive hook-based components in Storybook;
2. otherwise the app-wide default client.

Setting `qServerApiUrl` / `qServerApiKey` on `FinchConfigProvider` is enough: those values are applied
to the default client _and_ carried on every request, so even the first fetch of the first render uses
the configured server. Absent Finch config the client's own configuration stands, so
`setDefaultQServerClient` and `setGlobalBaseUrl` keep working.

`QServerClientLike` — the type the provider accepts — covers 44 of the 70 operations, because that is
what the simulator implements. Hooks for the other 26 (auth, permissions, admin, `executeFunction`,
`uploadScript`, `uploadQueueSpreadsheet`, `streamConsoleOutput`, `getConfig`, `updateEnvironment`,
`getREMetadata`, `moveQueueItemBatch`) reject with `QServerEndpointUnavailableError` when a partial
client is injected, rather than silently falling through to the network.

### Keys and invalidation

Keys are `['qserver', <resource>, <args | null>, { baseUrl }]`, where the scope is the server the
hook talks to — a `requestOptions.baseUrl` overrides it, so two instances aimed at different servers
keep separate entries. The scope is last so prefixes like
`['qserver','queue']` still match — including the ones existing code already invalidates with. The
API key is deliberately absent: it would put a secret in the Devtools cache inspector, and a
credential change invalidates everything rather than one entry (`invalidateAllQServerQueries`).

Mutations invalidate named bundles automatically, awaited before `mutateAsync` resolves — so the queue
is already refreshed on the next line. Bundles: `status`, `queue`, `history`, `runs`, `catalogs`,
`permissions`, `lock`, `auth`; see `QSERVER_MUTATION_INVALIDATIONS` for the full map and
`useQServerInvalidate()` for imperative refreshes.

### Things to know

- **Four queries are guarded**: `useQueueGetItemQuery` (needs a `uid` or `pos`),
  `useQueueGetTaskStatusQuery` / `useQueueGetTaskResultQuery` (need a `task_uid`) and `useQueueGetPrincipalQuery`
  (needs a `uuid`) stay idle until their argument is present. `enabled` overrides.
- **Cancellation composes**: TanStack's signal and any `requestOptions.signal` are merged, so
  unmounting or `cancelQueries` aborts the in-flight request whether or not you passed one.
- **`useQueueStreamConsoleOutputMutation` is a mutation**, not a query — the response never ends on its
  own. Bound it with an `axiosConfig.timeout` in `requestOptions`, or prefer `useQServerConsoleSocket`.
- **`useQueueGetRunsQuery` is a query** even though the endpoint is a POST.
- The browser caveats from the payload-GET section apply unchanged, so `useQueueGetTaskStatusQuery` and
  `useQueueGetTaskResultQuery` cannot work in a browser at all.
- Stories and tests must supply their own `QueryClientProvider` — there is none in
  `.storybook/preview.ts` or the vitest setup.

## Errors

Every failure is a `QServerApiError` carrying `status`, `method`, `path`, `responseBody`,
and — for FastAPI's 422 — `isValidationError` plus parsed `validationErrors`.
`QServerGetBodyUnsupportedError` is thrown for the browser payload-GET cases above.

```ts
import { isQServerApiError } from '@/api/qServer';

try {
    await startQueue();
} catch (error) {
    if (isQServerApiError(error) && error.status === 400) console.warn(error.message);
}
```

## Types

`openapi-typescript` output lives in `generated/schema.d.ts` (see `generated/README.md` for
the regeneration command). The spec declares every domain body and response as an untyped
object, so the generated file is authoritative only for the path/operation unions and the 12
auth schemas. Domain response shapes are hand-written in `types/`, verified against a live
RE Manager v0.0.19.

## Manual testing

`src/components/QServerTest/TestQserver.tsx` renders every registry entry with an editable
payload, runs the three sockets in both auth modes, and exercises the interceptor utilities.
It is wired into `src/app/pages/TestPage.tsx`.

## Differences from `src/api/qServer`

|                   | `qServer`                                 | `qServer`                                                                          |
| ----------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| Coverage          | 16 functions / 15 paths                   | 70 operations / 68 paths                                                           |
| Base URL          | `.../api`                                 | origin                                                                             |
| Auth header       | `ApiKey`                                  | `Apikey` (spec casing; `ApiKey` selectable)                                        |
| Key changes       | rebuild the client                        | `setApiKey`, effective immediately                                                 |
| Interceptors      | none                                      | add / eject / clear / list, built-ins protected                                    |
| Websockets        | none                                      | three, with reconnect and both auth modes                                          |
| `getQueueItem`    | `GET /queue/item/{uid}` — not a real path | `GET /api/queue/item/get` with a browser fallback                                  |
| react-query hooks | 15 hooks / 15 endpoints                   | **70 hooks, one per endpoint**, with keys, invalidation and Finch-config awareness |
