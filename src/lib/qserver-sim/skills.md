# SKILLS — working in `src/lib/qserver-sim`

Architecture and gotchas for anyone (human or agent) changing this package. Usage docs are in
[README.md](./README.md).

## Mental model

One mutable `QServerSimState` object, one state machine that moves items through it, and three
thin translation layers on top (HTTP dispatcher, client seams, sockets). Nothing is a fixture:
`GET /api/status` is computed from state every time it is asked for.

```
QServerSim (state + transitions + scheduler)
   ├── client/routes.ts  ──►  handleRequest  ──►  QServerSimClient   (direct, in-memory)
   │                                        └──►  QServerSimAdapter  (axios → the real client)
   ├── sockets/  ─── subscribeStatus / subscribeConsole ──► WebSocketLike fakes
   └── react/    ─── QServerSimProvider owns start()/stop()
```

Rules that keep it coherent:

- **Every mutation goes through a `QServerSim` method.** The routes are one-liners that call
  them; they never touch state directly. That is what makes "drive the sim from a story" and
  "call the client" behave identically.
- **One dispatcher, two seams.** If a payload differs between `QServerSimClient` and
  `QServerSimAdapter`, something has bypassed `handleRequest`.
- **Dependency direction is one-way:** `qserver-sim` → `api/qServer_new`. Never the reverse.
  Wire shapes are imported from `@/api/qServer_new/types/*`, never redeclared.
- **`QServerClientLike` lives in `@/api/qServerRuntime`**, not here — it is production code that
  the real client also satisfies, and the provider must not import from a sim package.

## Building blocks

| File                      | Contents                                                                    |
| ------------------------- | --------------------------------------------------------------------------- |
| `core/types.ts`           | `QServerSimState`, options, sim-internal bookkeeping types                  |
| `core/status.ts`          | `deriveStatus()` + `STATUS_KEYS` (the field contract)                       |
| `core/consoleMessages.ts` | Console strings, logger names, prefix formatting, multi-line sequences      |
| `core/uid.ts`             | Counter (default) and uuid identifier factories                             |
| `core/events.ts`          | `SimEmitter`: replay-on-subscribe, per-listener try/catch                   |
| `core/scheduler.ts`       | `setInterval` loop + `advance(ms)`                                          |
| `core/QServerSim.ts`      | The state machine: transitions, subscriptions, `request()`                  |
| `client/routes.ts`        | `SIM_ROUTES` keyed `` `${METHOD} ${path}` `` + `SIM_SUPPORTED_ENDPOINT_IDS` |
| `client/handleRequest.ts` | Lookup, 500 on throw, 501 on unknown                                        |
| `sockets/`                | `WebSocketLike` fakes for the three channels                                |

## Adding an endpoint

1. Add or extend the transition on `QServerSim` (returning the real response type).
2. Add a route to `SIM_ROUTES`, and its id to `SIM_SUPPORTED_ENDPOINT_IDS`.
3. Add the method name to `QSERVER_CLIENT_LIKE_METHODS` and the `Pick` in
   `@/api/qServerRuntime/clientLike.ts`.
4. Add the delegating method to `QServerSimClient`.
5. Export anything new from `index.ts`.

`clientSeams.test.ts` fails if steps 2–4 disagree with each other or with the real endpoint
registry, so a half-finished addition cannot pass CI.

## Invariants the tests enforce

- Only **transitions** bump uids. A progress tick bumps nothing (`uids.test.ts`) — otherwise the
  legacy UI refetches the queue several times a second.
- A rejected add, and starting an empty queue, bump nothing but the console uid.
- `re_state` is `null` exactly when the environment is closed.
- `deriveStatus` produces exactly `STATUS_KEYS`.
- Both client seams return identical payloads for the same shared assertion block.
- `SIM_SUPPORTED_ENDPOINT_IDS` ⊆ the real registry, has a route each, and matches
  `QSERVER_CLIENT_LIKE_METHODS` exactly.
- Status sockets emit nothing for a progress tick; closing a socket releases its sim listener.
- Every legacy console prefix is reachable from some transition.
- Two scenario calls share no mutable state.

## Gotchas

- **`advance(ms)` is one tick.** It does not subdivide and does not carry surplus time past a
  transition, so `advance(runDurationMs)` finishes exactly one run. Two runs need two calls.
- **Latency delays the response, never the mutation.** `handleRequest` is synchronous by design;
  breaking that would let a fake-timer test observe a request that "has not happened yet".
- **Fixtures are deep-cloned at construction.** Skip that and two sims built from `defaultQueue`
  mutate one shared array — the exact cross-story bleed that scenarios-as-functions prevents.
- **Socket fakes must defer every callback to a `queueMicrotask`.** `createQServerSocket` assigns
  `onopen`/`onmessage` _after_ the factory returns, so a synchronous emit is lost. A microtask
  (not a timer) keeps fake-timer tests simple.
- **Do not emit an initial status frame in the socket.** `subscribeStatus` already replays
  synchronously on subscribe; doing both double-emits.
- **`stopRun`/`abortRun`/`haltRun` all stop the queue** (`continueQueue: false`). They are
  user-initiated interventions; only a naturally completed run rolls on to the next item.
- **`failNextRun` is one-shot**, consumed at dequeue, so a requeued item succeeds on retry.
- **State is mutated in place.** `useQServerSimState` therefore re-renders off a version counter,
  not off object identity; do not `memo` on the state object.
- **`environmentOpenMs: 0` makes opening synchronous.** Scenarios use it so a test need not
  `advance()` just to open the environment; the non-zero default exists for visible transitions.
- **Console lines end with `\n`**, matching the server, so `getConsoleText()` concatenates rather
  than joins. `getConsoleText(nlines)` counts _rendered lines_, not messages — the item dictionary
  logged at plan start is one message spanning several lines.
- **Console wording is copied from real traffic** captured in
  `src/api/qServer_new/references/console_output_ws.txt`. Lines carry an
  `[I <timestamp> <logger>]` prefix (suppressible with `consolePrefix: false`), and bluesky's own
  output — scan ids, stream names, the `generator …` summary — is emitted `bare`, with no prefix.
  Consumers that match on text must strip the bracket block first, which is what `QSConsole` does
  and what `consoleMessages.test.ts` mirrors.
- Prefer `subscribeStatus` over `subscribeState` for anything user-visible — state fires on every
  tick, status only on real change.
