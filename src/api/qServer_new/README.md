# Queue Server API client (`qServer_new`)

A complete client for [bluesky-httpserver](https://github.com/bluesky/bluesky-httpserver):
all **70 operations** from `openapi.json`, the three websockets, and utilities for swapping
the API key, injecting your own axios instance, and registering interceptors.

Modelled on the Tiled API client in
[tiled-viewer-react](https://github.com/bluesky/tiled-viewer-react/tree/main/src/components/Tiled/api):
a `QServerApiClient` class plus a module-level default instance with a flat free-function
facade.

> This folder is the replacement for `src/api/qServer`, which stays in place and untouched
> until manual testing is finished. Nothing here imports from it.

## Quickstart

```ts
import { getStatus, setGlobalApiKey, setGlobalBaseUrl } from '@/api/qServer_new';

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
import { getQueue, setGlobalApiKey } from '@/api/qServer_new';
setGlobalApiKey('another-key');       // affects the very next request; no rebuild
await getQueue();

// 2. your own instance
import { createQServerApiClient, setDefaultQServerClient } from '@/api/qServer_new';
const client = createQServerApiClient({
    baseUrl: 'http://localhost:60610',
    apiKey: 'test',
    client: myAxiosInstance,          // optional: adopt an existing axios instance
    timeout: 10_000,
});
setDefaultQServerClient(client);      // optional: make it the app-wide one
await client.getQueue();

// 3. one call at a time
await getQueue(undefined, { client: otherAxios, apiKey: 'one-off', signal: controller.signal });
```

`resetDefaultQServerClient()` discards the singleton — call it in `beforeEach` so tests do
not leak configuration into one another.

### Authentication

| What | How |
| --- | --- |
| API key in a header | default; `Authorization: Apikey <key>` (the casing the spec documents) |
| API key in the query | `setGlobalApiKeyLocation('query')` → `?api_key=<key>` |
| Legacy header casing | `client.setApiKeyScheme('ApiKey')` — what `src/api/qServer` sends today |
| Bearer token | `setGlobalBearerToken(jwt)`; takes precedence over the API key |
| Refresh on 401 | set a `refreshToken`; one single-flight refresh against `/api/auth/session/refresh`, then one retry. On failure the client clears auth and calls `onAuthError` |

The key is read **at request time** by a built-in interceptor, which is why `setApiKey` takes
effect immediately without rebuilding anything.

### Interceptors

```ts
import { addRequestInterceptor, clearInterceptors, ejectInterceptor } from '@/api/qServer_new';

const handle = addRequestInterceptor((config) => {
    console.log(config.method, config.url);
    return config;
});

ejectInterceptor(handle);
clearInterceptors();          // removes only YOUR interceptors
clearInterceptors('request'); // one kind only
```

The built-in auth and refresh handlers are tracked separately and survive
`clearInterceptors()`. `client.setAxiosClient(next)` re-installs everything — built-ins
first, then yours in registration order.

One ordering caveat: axios runs request interceptors **last-registered-first**, and the
built-in auth interceptor is registered in the constructor. Your request interceptor
therefore sees the config *before* `Authorization` is attached.

## The payload-GET problem

18 operations are `GET`s that read their arguments from a **JSON request body**
(FastAPI's `payload: dict = {}`). Verified against RE Manager v0.0.19:
`curl -X GET -d '{"uid":"…"}'` works, `?uid=…` is ignored, and `POST` returns 405.

Browsers cannot send a body on a GET — `fetch` rejects it and `XMLHttpRequest` drops it
silently. Most of the 18 take an *optional* payload, so a bodiless call still works; the
table below covers the rest.

| Endpoint | In a browser |
| --- | --- |
| `getStatus`, `ping`, `getRoot`, `getConfig`, `getQueue`, `getQueueHistory`, `getPlansAllowed`, `getDevicesAllowed`, `getPlansExisting`, `getDevicesExisting`, `getREMetadata`, `getConsoleOutput`, `testServerSleep` | fine — arguments are optional, so the call goes out with no body |
| `getQueueItem({ uid })` | falls back to scanning `getQueue()` |
| `getLockInfo()` | falls back to the `lock` field of `getStatus()`; owner, time and note are unavailable |
| `getConsoleOutputUpdate({ last_msg_uid })` | falls back to `getConsoleOutput()` + `getConsoleOutputUID()`, which cannot deliver incrementally — prefer `useQServerConsoleSocket` |
| `getTaskStatus`, `getTaskResult` | **no viable path.** Both require a body even when empty. This also means the results of `executeFunction` and `uploadScript` cannot be collected browser-side |

Behaviour is governed by `getBodyStrategy`:

| Strategy | Effect when a browser needs to send a body |
| --- | --- |
| `'auto'` (default) | use the declared fallback if there is one, otherwise warn once and try anyway |
| `'body'` | always attempt the request; the body is dropped and the server sees `{}` |
| `'fallback'` | require a fallback; throw `QServerGetBodyUnsupportedError` without one |
| `'throw'` | never attempt; always throw |

Set it globally with `setGlobalGetBodyStrategy(…)`, per client via config, or per call via
`options.strategy`. Register `onFallback` (or `setGlobalFallbackCallback`) to be told
whenever a substitute answered.

Outside a browser — Node, vitest, SSR — the body is sent normally and all 18 behave exactly
as the API documents.

## Websockets

Three send-only sockets, none of which appear in `openapi.json`:

| Hook / factory | Path | Scope |
| --- | --- | --- |
| `useQServerConsoleSocket` / `createQServerConsoleSocket` | `/api/console_output/ws` | `read:console` |
| `useQServerStatusSocket` / `createQServerStatusSocket` | `/api/status/ws` | `read:monitor` |
| `useQServerInfoSocket` / `createQServerInfoSocket` | `/api/info/ws` | `read:monitor` |

```tsx
const { status, connectionStatus, frameCount, reconnect } = useQServerStatusSocket();
const { text, lines, clear } = useQServerConsoleSocket({ maxLines: 500 });
```

With no arguments the hooks read the base URL and key from `FinchConfigProvider` via
`useQueueServerApiUrls()`; pass `baseUrl` / `apiKey` to override, and `enabled: false` to
keep the socket closed.

**Auth matrix**

| Mode | How | Usable from a browser |
| --- | --- | --- |
| `Authorization` header | handshake header | no — browsers cannot set websocket headers |
| `'query'` (default) | `?api_key=…` or `?access_token=…` | yes |
| `'message'` | connect bare, then send `{"type":"auth","api_key":"…"}` within 10 s | yes |

In `'message'` mode the server **acknowledges a successful handshake with silence** — it only
responds by closing (4401/4001) if the credentials are bad. The status therefore reads
`'authenticating'` until either the first frame arrives or the 10 s window elapses with the
socket still up, whichever comes first; both mean authenticated. A quiet channel is not an
error.

**Servers without authentication reject credentials on the handshake.** Probed against
RE Manager v0.0.19 running in `UNAUTHENTICATED_SINGLE_USER` mode:

| Handshake | Result |
| --- | --- |
| no credentials | `101 Switching Protocols` |
| `?api_key=<a real key>` | `500 Internal Server Error` |
| `?access_token=…` / `Authorization: Bearer …` | `500` |
| `?api_key=<a wrong key>` | `101` |
| `Authorization: Apikey <real key>` | `101` |

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

## Errors

Every failure is a `QServerApiError` carrying `status`, `method`, `path`, `responseBody`,
and — for FastAPI's 422 — `isValidationError` plus parsed `validationErrors`.
`QServerGetBodyUnsupportedError` is thrown for the browser payload-GET cases above.

```ts
import { isQServerApiError } from '@/api/qServer_new';

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

| | `qServer` | `qServer_new` |
| --- | --- | --- |
| Coverage | 16 functions / 15 paths | 70 operations / 68 paths |
| Base URL | `.../api` | origin |
| Auth header | `ApiKey` | `Apikey` (spec casing; `ApiKey` selectable) |
| Key changes | rebuild the client | `setApiKey`, effective immediately |
| Interceptors | none | add / eject / clear / list, built-ins protected |
| Websockets | none | three, with reconnect and both auth modes |
| `getQueueItem` | `GET /queue/item/{uid}` — not a real path | `GET /api/queue/item/get` with a browser fallback |
| react-query hooks | yes | no — this folder is client + sockets only |
