# QServer Sim

A self-contained, browser-side simulator for the Bluesky
[queue server](https://blueskyproject.io/bluesky-queueserver/). It models the queue, history, Run
Engine states, environment lifecycle and console output entirely in-process, so Finch's normal
queue-server API client can be driven without an RE Manager, an HTTP server, or a network. It
powers Storybook stories and tests, and it is the fastest way to develop queue UI.

It is the sibling of [Ophyd Sim](?path=/docs/documentation-ophyd-sim--docs): ophyd-sim simulates
the devices, qserver-sim simulates the thing that runs plans against them. The two compose — mount
both sets of providers and a story has live device values *and* a working queue.

The **live demo** at the top of this page is the real
[`QServerSimDemo`](https://github.com/bluesky/finch/blob/main/src/components/QServerSimDemo/QServerSimDemo.tsx)
component talking to a simulator built with a *custom* plan and device catalog — exactly what
[Bringing your own plans and devices](#bringing-your-own-plans-and-devices) walks through. Pick a
plan, press **Run plan**, and watch it move from the queue to history.

Everything is re-exported from the package root
([index.ts](https://github.com/bluesky/finch/blob/main/src/lib/qserver-sim/index.ts)); import from
`@/lib/qserver-sim`, never from subfolders.

> This page is the usage / getting-started guide. For the state machine, the uid bump rules and
> the rest of the internals, see
> [skills.md](https://github.com/bluesky/finch/blob/main/src/lib/qserver-sim/skills.md).

---

## Getting started

The bare minimum: build a sim, wrap the tree in the two providers, and let a component talk to it
through the ordinary queue-server client.

```tsx
import {
    QServerSimProvider,
    createQServerSimClient,
    defaultQServer,
} from '@/lib/qserver-sim';
import { QServerApiProvider, useQServerApiClient } from '@/api/qServerRuntime';

// 1. Build a sim. Keep it stable across renders (module scope, or useMemo).
const sim = defaultQServer();

// 2. Wrap it in a client. This is what components actually call.
const client = createQServerSimClient(sim);

// 3. A leaf that talks to the queue server through the provider — no sim knowledge at all.
function QueueLength() {
    const qserver = useQServerApiClient();
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        void qserver.getQueue().then((queue) => setCount(queue.items.length));
    }, [qserver]);

    return <p>{count ?? '…'} items queued</p>;
}

// 4. Mount both providers: QServerSimProvider owns the tick loop (so runs progress),
//    QServerApiProvider supplies the client every descendant will use.
export function Example() {
    return (
        <QServerSimProvider sim={sim}>
            <QServerApiProvider client={client}>
                <QueueLength />
            </QServerApiProvider>
        </QServerSimProvider>
    );
}
```

Two things are worth understanding about that arrangement, because they are the whole design:

- **`QServerApiProvider` is not part of the simulator.** It lives in
  [`@/api/qServerRuntime`](https://github.com/bluesky/finch/blob/main/src/api/qServerRuntime/QServerApiProvider.tsx)
  and takes anything satisfying `QServerClientLike` — a simulator client here, a real
  [`QServerApiClient`](https://github.com/bluesky/finch/blob/main/src/api/qServer_new/README.md)
  in production. Components never know which they got, which is exactly why a story and the real
  app can share them.
- **`QServerSimProvider` only owns the simulator**: it starts the tick loop on mount and stops it
  on unmount, and puts the sim in context for story-only controls. Skip it and everything still
  works, but nothing progresses on its own — you would have to call `sim.advance(ms)` yourself.

### Going live later

Swapping in a real server is a one-line change at the top of your tree, and nothing below it
moves:

```tsx
import { createQServerApiClient } from '@/api/qServer_new';

const client = createQServerApiClient({ baseUrl: 'http://localhost:60610', apiKey: 'test' });

<QServerApiProvider client={client}>
    <YourQueueUi />
</QServerApiProvider>;
```

### In Storybook

Skip all the boilerplate with the `withQServerSim` decorator, which builds a fresh simulator and
mounts both providers for you:

```tsx
import { withQServerSim, defaultQServer, runningQServer } from '@/lib/qserver-sim';

const meta = {
    title: 'Bluesky Components/MyQueueWidget',
    component: MyQueueWidget,
    decorators: [withQServerSim(defaultQServer)],
} satisfies Meta<typeof MyQueueWidget>;

// A story that opens mid-run instead:
export const Running: Story = {
    decorators: [withQServerSim(runningQServer)],
};

// …or the default scenario with an override:
export const SlowRuns: Story = {
    decorators: [withQServerSim(defaultQServer, { runDurationMs: 8000 })],
};
```

The decorator takes a **scenario function**, not a simulator, and builds one per story — so no two
stories share queue state. See
[QServerSimDemo](?path=/docs/bluesky-components-qserversimdemo--docs) for a worked set.

---

## Scenarios

Five ready-made starting states. Each is a function returning a fresh simulator, and each accepts
per-field overrides.

| Scenario | Environment | Manager / RE | Queue | History |
| --- | --- | --- | --- | --- |
| `defaultQServer()` | open, idle | idle / idle | 3 | 2 |
| `emptyQServer()` | closed | idle / — | 0 | 0 |
| `runningQServer()` | executing | executing_queue / running | 2 | 2 |
| `pausedQServer()` | executing | paused / paused | 2 | 2 |
| `errorQServer()` | open, idle | idle / idle | 1 | 3, next run fails |

```ts
defaultQServer();                                 // the everyday baseline
defaultQServer({ runDurationMs: 500 });           // faster runs
defaultQServer({ queue: [], history: [] });       // empty, but environment still open
pausedQServer();                                  // the only state where abort/stop/halt work
```

`emptyQServer()` starts with the environment **closed**, which is the honest cold-start state: any
attempt to start the queue is refused until something calls `openEnvironment()`, exactly as a real
server refuses it.

---

## Bringing your own plans and devices

The defaults (`count`, `scan`, `grid_scan` and a handful of `ophyd.sim` devices) exist so
`defaultQServer()` is useful immediately. Your beamline has different ones. Pass them to
`createQServerSim` and they **replace** the defaults entirely:

```ts
import {
    createQServerSim,
    createQServerSimClient,
    plan,
    parameter,
    device,
    deviceAnnotation,
    deviceListAnnotation,
    queueItem,
} from '@/lib/qserver-sim';

const sim = createQServerSim({
    plans: {
        xafs_scan: plan({
            name: 'xafs_scan',
            module: 'mybeamline.plans',
            description: 'Mock XAFS scan',
            parameters: [
                parameter({ name: 'energy_start', description: 'eV', default: '7000' }),
                parameter({ name: 'energy_stop', description: 'eV', default: '7200' }),
                parameter({ name: 'num', description: 'number of points', default: '101' }),
                parameter({ name: 'detector', annotation: deviceAnnotation(['I0', 'diode']) }),
            ],
        }),
    },
    devices: {
        I0: device({ name: 'I0', type: 'detector' }),
        diode: device({ name: 'diode', type: 'detector' }),
        energy: device({ name: 'energy', type: 'motor' }),
    },
    queue: [
        queueItem({
            name: 'xafs_scan',
            kwargs: { energy_start: 7000, energy_stop: 7200, num: 101, detector: 'I0' },
        }),
    ],
    runDurationMs: 1500,
});

const client = createQServerSimClient(sim);
```

That is the entire setup for a custom beamline — it is what the demo at the top of this page does.

### Plans

`plan({ name, module?, description?, parameters?, isGenerator? })` produces the same shape
`GET /api/plans/allowed` returns. Parameters are where the detail lives, because form widgets are
built from them:

```ts
parameter({ name: 'num', default: '101' });                              // plain value
parameter({ name: 'md', kind: 'KEYWORD_ONLY', default: 'None' });        // keyword-only
parameter({ name: 'mode', default: 'fast', enums: ['fast', 'slow'] });   // enum → select
parameter({ name: 'detector', annotation: deviceAnnotation(['I0']) });   // one device → dropdown
parameter({ name: 'detectors', annotation: deviceListAnnotation(['I0', 'diode']) }); // many
```

Defaults are **strings**, including `'None'` — that is how the queue server reports Python
defaults, and copying the quirk means a form rendered against the sim looks like one rendered
against a real server. `kind` accepts the Python parameter kinds (`POSITIONAL_OR_KEYWORD` is the
default; also `POSITIONAL_ONLY`, `VAR_POSITIONAL`, `KEYWORD_ONLY`, `VAR_KEYWORD`).

### Devices

`device({ name, type })` covers the common cases with one word — `'detector'`, `'motor'`,
`'signal'` or `'flyer'` — each setting the readable/movable/flyable flags and a plausible
classname:

```ts
device({ name: 'I0', type: 'detector' });
device({ name: 'energy', type: 'motor' });
```

Override any flag when a device is unusual, and nest `component()` calls when UI inspects a
device's internals:

```ts
import { device, component } from '@/lib/qserver-sim';

device({
    name: 'sample_stage',
    type: 'motor',
    classname: 'SampleStage',
    module: 'mybeamline.devices',
    components: {
        readback: component({ classname: '_ReadbackSignal', module: 'ophyd.sim' }),
        setpoint: component({ classname: '_SetpointSignal', module: 'ophyd.sim' }),
    },
});
```

Device names in `annotation` are just strings — the simulator does not check that a plan's
annotated devices exist. Plan *names*, by contrast, are validated on `addQueueItem` (turn that off
with `validatePlanNames: false`).

### Queue and history

`queueItem({ name, args?, kwargs?, itemUid? })` seeds the queue; `historyItem({ ..., exitStatus,
runUids, scanIds, msg, traceback })` seeds history, including failures:

```ts
import { historyItem, queueItem } from '@/lib/qserver-sim';

createQServerSim({
    queue: [queueItem({ name: 'xafs_scan', itemUid: 'seed-1', kwargs: { num: 51 } })],
    history: [
        historyItem({ name: 'xafs_scan', exitStatus: 'completed', scanIds: [1] }),
        historyItem({
            name: 'xafs_scan',
            exitStatus: 'failed',
            msg: "Device 'I0' timed out.",
            traceback: 'Traceback (most recent call last): ...',
        }),
    ],
});
```

Give seeded items a fixed `itemUid` so tests can address them without reading the queue first;
anything added at runtime gets a minted uid (`sim-item-1`, `sim-item-2`, …).

---

## Behaviour options

Everything about *how* the simulator behaves is one flat set of options, passed to
`createQServerSim` or any scenario, and changeable at runtime with `sim.setBehavior({ … })`:

| Option | Default | Effect |
| --- | --- | --- |
| `runDurationMs` | `3000` | Simulated length of one run |
| `runDurationByPlan` | `{}` | Per-plan overrides, e.g. `{ count: 500 }` |
| `autoCompleteRuns` | `true` | When false, runs start but never finish |
| `failNextRun` | `false` | Arms the next run to fail; consumed when it starts |
| `failMessage` | — | Message recorded in the failed result |
| `latencyMs` | `0` | Delays the response, never the state change |
| `consoleOutput` | `true` | Emit console lines on transitions |
| `environmentOpenMs` | `500` | Time `openEnvironment()` takes (scenarios use `0`) |
| `tickMs` | `100` | Live tick interval |
| `validatePlanNames` | `true` | Reject items whose plan is not in the catalog |
| `user` / `userGroup` | `UNAUTHENTICATED_SINGLE_USER` / `primary` | Stamped on accepted items |

Arming a failure from a story button, for instance:

```tsx
const sim = useQServerSim();
<button onClick={() => sim.setBehavior({ failNextRun: true })}>Make the next run fail</button>;
```

---

## What the simulator models

Behaviour, not canned responses. Every read is computed from live state, so the queue, history and
status can never disagree with each other.

- **Queue lifecycle** — add (with `pos` / `before_uid` / `after_uid`), update, move, remove, batch
  variants, clear; items validated against the plan catalog exactly as the server validates them.
- **Run lifecycle** — start the queue, the front item moves onto the Run Engine, progresses over
  simulated time, then lands in history with a real `result` (`exit_status`, `run_uids`,
  `scan_ids`, `time_start`/`time_stop`) and the next item begins.
- **Run Engine control** — pause, resume, and the three terminal ones: `stop` finishes cleanly,
  `abort` and `halt` mark the run failed and return the item to the front of the queue. All three
  stop the queue, as user-initiated interventions do.
- **Queue control** — stop-after-current-plan and cancelling it, autostart, loop mode and
  `ignore_failures`.
- **Environment lifecycle** — open, close (refused while a plan is running), and destroy (allowed
  mid-plan, failing the run).
- **Console output** — the exact lines the real server emits, including the substrings existing
  Finch console UI watches for.
- **Failures** — `failNextRun` for the next run, or `sim.panic()` to fail immediately.

### Not simulated

Deliberate omissions, so the gaps are visible rather than surprising. These endpoints answer
**501**, and they are left out of `QServerClientLike`, so calling one is a compile error rather
than a runtime surprise in a story:

authentication and API keys, permissions, admin (`manager/stop`, `kernel/interrupt`),
`function/execute`, `script/upload`, spreadsheet upload, `environment/update`, `config/get`,
`re/metadata`, and the streaming console endpoint.

Also: a run is a timer, so there is **no real plan execution** — no documents, no data, no Tiled
writes. Deferred pause is collapsed to immediate, since nothing in Finch observes
`pause_pending`.

---

## Websockets

The queue server pushes status and console output over websockets. The simulator can serve those
too, through the `socketFactory` seam the real hooks already accept — so no production code
changes:

```tsx
import { buildQServerSimStoryContext, defaultQServer } from '@/lib/qserver-sim';
import { useQServerStatusSocket, useQServerConsoleSocket } from '@/api/qServer_new';

const { sim, client, socketFactory } = buildQServerSimStoryContext(defaultQServer);

function LiveStatus() {
    const { status, connectionStatus } = useQServerStatusSocket({
        baseUrl: 'http://sim.local:60610',
        socketFactory,
    });
    const { text } = useQServerConsoleSocket({
        baseUrl: 'http://sim.local:60610',
        socketFactory,
    });

    return (
        <>
            <p>{connectionStatus}: {status?.manager_state}</p>
            <pre>{text}</pre>
        </>
    );
}
```

Status frames are pushed on every real status change and **never** for a run merely progressing.
Console frames stream as lines are emitted, with the recent backlog replayed on connect. Setting
`requireAuth` or `expectApiKey` on the factory closes with 4401 / 4001, so auth-failure UI is
demoable with no server.

---

## Driving the sim without React

Nothing ticks until `start()` is called — which `QServerSimProvider` does for you. In a test, skip
`start()` entirely and step time by hand, which keeps everything synchronous and deterministic:

```ts
import { defaultQServer } from '@/lib/qserver-sim';

const sim = defaultQServer();

sim.startQueue();
expect(sim.getStatus().manager_state).toBe('executing_queue');

sim.advance(3000);                                   // exactly one run completes
expect(sim.getState().history).toHaveLength(3);
expect(sim.getState().running?.item.name).toBe('scan');   // the next one already started
```

`advance(ms)` is **one** tick, not a subdivision, and surplus time is not carried past a
transition — so `advance(runDurationMs)` reliably means "finish one run". Two runs need two calls.

Useful handles when driving directly: `getState()`, `getStatus()`, `subscribeStatus(fn)`,
`subscribeConsole(fn)`, `setBehavior({...})`, `reset()`, and `panic()`.

---

## Testing against the real client

There are two ways to point code at the simulator, and they share one internal request handler, so
they always produce identical payloads.

**`createQServerSimClient(sim)`** — the in-memory client used everywhere above. Fast, no axios.

**`createQServerSimAdapter(sim)`** — an axios adapter, so the **real** `QServerApiClient` runs
against the simulator with its interceptors, auth handling and error normalization intact. Use it
when you want to exercise the production code path:

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

await client.getStatus();   // real client, real interceptors, no network
```

Either way, failures are the real `QServerApiError`, so component error handling behaves the same
under the simulator as it does against a live server.
