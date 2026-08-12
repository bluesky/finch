# SKILLS — working in `src/api/qServer_new`

Terse map for anyone (human or agent) changing this folder. Prose docs are in `README.md`.

## File map

```
openapi.json               fetched from http://<host>:60610/openapi.json
generated/schema.d.ts      openapi-typescript output; never hand-edit
index.ts                   public barrel — the only thing consumers import
endpointRegistry.ts        QSERVER_ENDPOINTS: 70 descriptors (data, not logic)
README.md / SKILLS.md      docs

types/
  paths.ts                 QSERVER_PATHS table + buildPath() + completeness assertion
  generatedAliases.ts      readable names over components['schemas']
  common.ts                request options, payload/body aliases, interceptor types
  errors.ts                QServerApiError, QServerGetBodyUnsupportedError
  registry.ts              descriptor types + payloadAs()
  clientSurface.ts         QServerEndpoints — the composite the class implements
  <domain>.ts              hand-written request/response shapes (13 files)
  index.ts                 barrel

endpoints/
  <domain>Endpoints.ts     method signatures (interface) + descriptor fragments (13 files)

client/
  QServerApiClient.ts      the class: config, interceptors, funnels, 70 methods in #regions
  defaultClient.ts         singleton + setGlobal*/interceptor free functions
  facade.ts                70 free functions delegating to the singleton
  fallbacks.ts             browser substitutes for payload-GETs
  getBodySupport.ts        payload-GET id lists + environment detection
  interceptorRegistry.ts   built-in vs user interceptor bookkeeping
  urlUtils.ts              base-URL normalization, ws URL building

sockets/
  types.ts                 transport contract, WebSocketLike seam
  socketPaths.ts           the three ws paths + close codes
  messageTypes.ts          frame envelope + tolerant guards
  createQServerSocket.ts   generic factory: auth, reconnect, parse, fanout
  channelSockets.ts        typed per-channel wrappers
  useQServerSocket.ts      generic React binding
  useQServerChannelSockets.ts  the three channel hooks
```

## Adding an endpoint

1. Confirm the path and method in `openapi.json`.
2. Add it to `QSERVER_PATHS` in `types/paths.ts` (the completeness assertion fails until you do).
3. Add request/response types to `types/<domain>.ts`.
4. Add the signature to `endpoints/<domain>Endpoints.ts`.
5. Add the method to the matching `#region` in `client/QServerApiClient.ts`.
6. Add a descriptor (with `call`) to the same endpoints file, and a delegating function to
   `client/facade.ts`.

`QServerNewRegistry.test.tsx` fails if any of steps 2, 4, 5 or 6 is missed.

## Invariants the tests enforce

- registry ↔ spec: exactly the same 70 `(METHOD, path)` pairs.
- every descriptor's `fn` exists on the prototype *and* is exported from `facade.ts`.
- `payloadGet` descriptors == the 18 spec GETs carrying a `requestBody`, and match
  `PAYLOAD_GET_ENDPOINT_IDS`.
- `bodyRequired` descriptors match `BODY_REQUIRED_GET_ENDPOINT_IDS`, and each is either
  `browserSafe: false` or declares a fallback.
- `browserSafe: false` is exactly `tasks.status` and `tasks.result`.
- auth header is `Apikey`; `setApiKey` changes the next request with no rebuild.
- `clearInterceptors()` leaves the built-in auth interceptor working.
- auth close codes 4401/4001 produce zero reconnect attempts.

## Gotchas

- **Base URL is the origin.** Spec paths include `/api/`; `setBaseUrl` strips a trailing
  `/api` because the rest of Finch stores it with one.
- **Axios request interceptors are LIFO.** User interceptors see the config before auth.
- **Four GETs need a body even when empty** (`tasks.status`, `tasks.result`, `lock.info`,
  `console.outputUpdate`) — hence `BODY_REQUIRED_GET_ENDPOINT_IDS`, which makes
  `getWithBody` skip its "empty payload → bodiless GET" shortcut.
- **A server with auth disabled 500s the websocket handshake when credentials are present.**
  Verified against RE Manager v0.0.19 in `UNAUTHENTICATED_SINGLE_USER` mode: no credentials
  and a *wrong* `?api_key` both get 101, a real key or any token gets 500. Use
  `authMode: 'none'` there. The client never drops credentials on its own.
- **Successful first-message auth is silent.** Do not treat "no frames yet" as a failure:
  promote to `'open'` when the auth window elapses with the socket still up. Only a close
  (4401/4001) means rejection.
- **Do not send websocket keepalives.** The server ignores client frames and has no
  application-level ping/pong.
- **`re/metadata` answers 400** on RE Manager v0.0.19; the method is correct, the server is
  older than the route.
- **Do not touch `src/api/qServer` or `src/components/QServer`** until the swap phase.
- Type-only imports of `QServerApiClient` inside `types/registry.ts` keep the
  registry ↔ client cycle erased at runtime; keep them `import type`.
