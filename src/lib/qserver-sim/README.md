# qserver-sim

A browser-side simulator for the Bluesky **queue server** (bluesky-httpserver) — queue, history,
Run Engine states, environment lifecycle and console output — that drives Finch's normal
queue-server client without an RE Manager, a network, or a backend of any kind.

It is a sibling of [`src/lib/ophyd-sim`](../ophyd-sim/README.md): ophyd-sim simulates devices,
qserver-sim simulates the thing that runs plans against them.

> **Import from the package root only.** Everything public is re-exported from
> [`index.ts`](./index.ts); reaching into subfolders will break when the internals move.
> For internals and gotchas, see [skills.md](./skills.md).

## Table of contents

1. [Getting started](#getting-started)
2. [Scenarios](#scenarios)
3. [Custom setups](#custom-setups)
4. [Behaviour options](#behaviour-options)
5. [Driving time](#driving-time)
6. [The two client seams](#the-two-client-seams)
7. [Storybook](#storybook)
8. [Websockets](#websockets)
9. [What it does not simulate](#what-it-does-not-simulate)

## Getting started

```ts
import { defaultQServer, createQServerSimClient } from '@/lib/qserver-sim';

const sim = defaultQServer();                    // three queued plans, two in history
const client = createQServerSimClient(sim);

await client.getQueue();                          // { items: [...], running_item: {} }
await client.startQueue();                        // first item moves onto the Run Engine
sim.advance(3000);                                // one simulated run's worth of time
await client.getQueueHistory();                   // the plan is now in history
```

In React, wire the provider once and components use their normal client:

```tsx
import { QServerSimProvider, createQServerSimClient, defaultQServer } from '@/lib/qserver-sim';
import { QServerApiProvider } from '@/api/qServerRuntime';

const sim = defaultQServer();
const client = createQServerSimClient(sim);

<QServerSimProvider sim={sim}>
    <QServerApiProvider client={client}>
        <YourQueueUi />
    </QServerApiProvider>
</QServerSimProvider>;
```

`QServerSimProvider` owns the tick loop (started on mount, stopped on unmount), so runs progress
on their own. In Storybook, `withQServerSim` does all of this in one line.

## Scenarios

Five ready-made states. Each is a **function returning a fresh simulator**, so two stories or two
tests can never share mutable queue state:

| Scenario | Environment | Manager / RE | Queue | History |
| --- | --- | --- | --- | --- |
| `defaultQServer()` | open, idle | idle / idle | 3 | 2 |
| `emptyQServer()` | closed | idle / — | 0 | 0 (catalogs still populated) |
| `runningQServer()` | executing | executing_queue / running | 2 | 2 |
| `pausedQServer()` | executing | paused / paused | 2 | 2 |
| `errorQServer()` | open, idle | idle / idle | 1 | 3 (one failed), next run fails |

Every scenario takes per-field overrides:

```ts
defaultQServer({ runDurationMs: 500 });          // faster runs
defaultQServer({ queue: [], history: [] });      // replace collections, not merge them
runningQServer({ runDurationByPlan: { count: 10_000 } });
```

`pausedQServer()` is the only one where `resumeRE`, `stopRE`, `abortRE` and `haltRE` succeed —
all four require a paused Run Engine.

## Custom setups

Another beamline supplies its own catalog, queue and timings. The factories keep that readable:

```ts
import {
    createQServerSim,
    createQServerSimClient,
    plan,
    parameter,
    deviceAnnotation,
    device,
    queueItem,
} from '@/lib/qserver-sim';

const sim = createQServerSim({
    plans: {
        xafs_scan: plan({
            name: 'xafs_scan',
            description: 'Mock XAFS scan',
            parameters: [
                parameter({ name: 'energy_start', default: '7000' }),
                parameter({ name: 'energy_stop', default: '7200' }),
                parameter({ name: 'num', default: '101' }),
                parameter({ name: 'detector', annotation: deviceAnnotation(['I0']) }),
            ],
        }),
    },
    devices: {
        I0: device({ name: 'I0', type: 'detector' }),
        energy: device({ name: 'energy', type: 'motor' }),
    },
    queue: [
        queueItem({
            name: 'xafs_scan',
            kwargs: { energy_start: 7000, energy_stop: 7200, num: 101, detector: 'I0' },
        }),
    ],
    runDurationMs: 1500,
    autoCompleteRuns: true,
});

const client = createQServerSimClient(sim);
```

`plans` and `devices` **replace** the defaults rather than merging, so the catalog is exactly what
you passed. With `validatePlanNames` on (the default), adding an item whose plan is not in the
catalog is rejected exactly as a real server rejects it.

## Behaviour options

Passed to `createQServerSim` / any scenario, and changeable at runtime with
`sim.setBehavior({ ... })` — handy for arming a failure mid-story.

| Option | Default | Effect |
| --- | --- | --- |
| `runDurationMs` | `3000` | Simulated length of a run |
| `runDurationByPlan` | `{}` | Per-plan overrides |
| `autoCompleteRuns` | `true` | When false, runs never finish on their own |
| `failNextRun` | `false` | Arms the next run to fail; consumed on dequeue |
| `failMessage` | — | Message recorded in the failed result |
| `latencyMs` | `0` | Delays the *response*, never the mutation |
| `consoleOutput` | `true` | Emit console lines on transitions |
| `consoleBufferSize` | `1000` | Ring-buffer bound, matching the server |
| `environmentOpenMs` / `environmentCloseMs` | `500` / `250` | Environment transition times (scenarios use `0`) |
| `tickMs` | `100` | Live tick interval |
| `validatePlanNames` | `true` | Reject items whose plan is not in the catalog |
| `user` / `userGroup` | `UNAUTHENTICATED_SINGLE_USER` / `primary` | Stamped on accepted items |

## Driving time

Nothing ticks until `start()` is called — which `QServerSimProvider` does for you. Tests should
skip `start()` entirely and step time by hand:

```ts
const sim = defaultQServer();
sim.startQueue();
sim.advance(3000);   // exactly one run completes; the next one starts at zero
```

`advance(ms)` is **one** tick, not a subdivision, and surplus time is not carried across a
transition — so `advance(runDurationMs)` reliably means "finish one run".

`latencyMs` never interferes: the state change happens synchronously inside the request, and only
the returned promise is delayed. Under fake timers, pass `delay: () => Promise.resolve()` to
resolve latency without a real timer.

## The two client seams

Both run through one dispatcher, so they produce identical payloads. A shared test suite asserts
exactly that.

**`createQServerSimClient(sim)`** — a direct, in-memory client implementing
[`QServerClientLike`](../../api/qServerRuntime/clientLike.ts) (the ~44 operations Finch's UI
calls). Fast, no axios involved, and it exposes `.sim` for stories that want to drive the
simulator. Errors are the real `QServerApiError`.

**`createQServerSimAdapter(sim)`** — an axios adapter, so the **real** `QServerApiClient` runs
against the simulator with its interceptors, auth handling and error normalization intact:

```ts
import axios from 'axios';
import { QServerApiClient } from '@/api/qServer_new';
import { createQServerSimAdapter, defaultQServer } from '@/lib/qserver-sim';

const sim = defaultQServer();
const client = new QServerApiClient({
    baseUrl: 'http://sim.local:60610',
    apiKey: 'test',
    client: axios.create({ adapter: createQServerSimAdapter(sim) }),
});
```

Pass `{ expectApiKey: 'secret' }` to make the adapter answer 401 for a wrong key, which exercises
the real client's auth path. Endpoints the simulator does not model answer **501**, surfacing as a
`QServerApiError` — "extend the sim", not "fix your URL".

## Storybook

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { withQServerSim, defaultQServer, runningQServer } from '@/lib/qserver-sim';

const meta = {
    title: 'Bluesky Components/QServerSimDemo',
    component: QServerSimDemo,
    tags: ['autodocs'],
    decorators: [withQServerSim(defaultQServer)],
} satisfies Meta<typeof QServerSimDemo>;

export const Running: Story = {
    decorators: [withQServerSim(runningQServer)],
};

export const SlowRuns: Story = {
    decorators: [withQServerSim(defaultQServer, { runDurationMs: 8000 })],
};
```

The decorator takes a **scenario function** and builds one simulator per application, so each
story is isolated. Need the simulator or a socket factory inside a story? Use
`buildQServerSimStoryContext(scenario)`.

## Websockets

`createQServerSimSocketFactory(sim)` returns the `(url) => WebSocketLike` function that the real
socket hooks already accept, so no production code changes:

```tsx
const { sim, socketFactory } = buildQServerSimStoryContext(defaultQServer);

const { status } = useQServerStatusSocket({ baseUrl: 'http://sim.local:60610', socketFactory });
const { text } = useQServerConsoleSocket({ baseUrl: 'http://sim.local:60610', socketFactory });
```

- **status** pushes a frame on connect and on every real status change — never for a progress
  tick, because status pushes are change-gated.
- **console** streams every emitted line, and by default replays the last 50 on connect.
- **info** emits one frame on connect.
- `requireAuth` / `expectApiKey` close with **4401** / **4001**, the codes the real transport
  treats as non-retryable — so an auth-failure UI is demoable with no server.
- `socketFactory.closeAll()` tears down every socket it produced, which HMR needs.

## What it does not simulate

Deliberate omissions, so the gaps are visible rather than surprising:

- **Not implemented at all** (these answer 501): auth and API keys, permissions, admin
  (`manager/stop`, `kernel/interrupt`), `function/execute`, `script/upload`,
  `queue/upload/spreadsheet`, `environment/update`, `config/get`, `re/metadata`, and the
  streaming console endpoint. `QServerClientLike` omits them too, so calling one is a compile
  error rather than a runtime surprise.
- **Tasks** exist in state and the task endpoints answer, but nothing creates a task — the two
  endpoints that would (`function/execute`, `script/upload`) are not modelled.
- **Deferred pause is collapsed to immediate.** Pausing at the next checkpoint is not observable
  to any UI in this repo, so `pause_pending` is never left true.
- **No real plan execution.** A run is a timer: no data, no documents, no Tiled writes. Pair with
  ophyd-sim if you need live device values on screen at the same time.
- **Console replay on connect** is a deviation from the real server, which replays nothing. It
  exists so a story mounted after setup shows a populated console; turn it off with
  `replayConsoleOnOpen: false`.
