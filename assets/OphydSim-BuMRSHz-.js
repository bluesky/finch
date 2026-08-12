import{j as t}from"./jsx-runtime-Cf8x2fCZ.js";import{useMDXComponents as w}from"./index-DI2gBlDf.js";import"./blocks-CFMxLmy-.js";import{r as m}from"./index-BlmOqGMO.js";import{j as B,m as S,s as M,k as C,r as T,h as I,g as L,c as O,f as D}from"./beamstopBeamline-Ddl3iiSk.js";import{u}from"./useOphydPVSocket-Dd5zlKo0.js";import"./DeviceControllerBox-JiOhgqdA.js";import{T as R}from"./TableDeviceControllerWithRBV-CgYMBkzy.js";import{c as h}from"./utils-DuMXYCiK.js";import{S as E}from"./Shutter-yMcAe4a_.js";import{af as j,aq as A}from"./index-CBqEk1wQ.js";import"./index-yBjzXJbu.js";import"./apiUtils-0_WGNbDr.js";import"./OphydTransportContext-C-T3dDhJ.js";import"./Lock.es-BnV14fst.js";import"./IconBase.es-N0ZVnnNC.js";import"./Question.es-CT_as6BQ.js";import"./InputNumber-CJAomWwQ.js";import"./Button-BAZZxb_P.js";import"./icons-DhXjNaA5.js";import"./ControllerRelativeMove-Bj7BvnUb.js";import"./SelectDropdown-DQMB8TM5.js";import"./index-czWnIymw.js";import"./index-fNjTmf9T.js";import"./floating-ui.dom-rnI921Cb.js";import"./CaretDown.es-ew65DCpW.js";import"./iframe-XOSWbzr7.js";import"../sb-preview/runtime.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";const N=`# Ophyd Sim

A self-contained, browser-side simulator for [Ophyd](https://blueskyproject.io/ophyd/)
beamline devices. It models EPICS-style PVs — motors, shutters, detectors, and
derived signals — entirely in-process, so finch's normal Ophyd socket hooks can
be driven without a real IOC or WebSocket backend. It powers Storybook stories,
tests, and the [\`SimulatedBeamline\`](https://github.com/bluesky/finch/blob/main/src/features/SimulatedBeamline/SimulatedBeamline.tsx)
widget.

The **Live demo** at the top of this page is an example of multiple Finch components utilizing Ophyd Sim to mimic and actual beamline.

Everything is re-exported from the package root ([index.ts](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/index.ts));
import from \`@/lib/ophyd-sim\`, never from subfolders.

> This page is the usage / getting-started guide. For the architecture and the
> internals of the store, scheduler, and dependency graph, see
> [skills.md](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/skills.md).

---

## Getting started

The bare minimum: build a sim, wrap the tree in the two providers, and render a
single [\`DeviceControllerBox\`](https://github.com/bluesky/finch/blob/main/src/components/DeviceControllerBox.tsx) wired to
a simulated motor. Because \`DeviceControllerBox\` is a plain presentational
component, you connect it to the sim through the ordinary
[\`useOphydPVSocket\`](https://github.com/bluesky/finch/blob/main/src/api/ophyd/useOphydPVSocket.tsx) hook — the exact same
hook used against a real IOC.

\`\`\`tsx
import { useMemo } from 'react';
import {
    OphydSimProvider,
    createOphydSimTransport,
    createOphydSim,
    motor,
} from '@/lib/ophyd-sim';
import { OphydTransportProvider } from '@/api/ophyd/OphydTransportProvider';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import DeviceControllerBox from '@/components/DeviceControllerBox';

// 1. Build a sim. Keep it stable across renders (module scope or useMemo).
const sim = createOphydSim({
    devices: [motor({ name: 'IOC:m1', limits: [-10, 10], velocity: 2, units: 'mm' })],
});

// 2. A leaf that talks to the sim through the normal Ophyd PV hook.
function MotorControl() {
    const { devices, handleSetValueRequest, toggleDeviceLock } = useOphydPVSocket([
        'IOC:m1',
        'IOC:m1.RBV',
    ]);

    return (
        <DeviceControllerBox
            device={devices['IOC:m1']}
            deviceRBV={devices['IOC:m1.RBV']}
            handleSetValueRequest={handleSetValueRequest}
            handleLockClick={toggleDeviceLock}
        />
    );
}

// 3. Wrap the tree: OphydSimProvider starts/stops the tick loop;
//    OphydTransportProvider routes the PV hooks at the sim instead of a WebSocket.
export function Example() {
    const transport = useMemo(() => createOphydSimTransport(sim), []);
    return (
        <OphydSimProvider sim={sim}>
            <OphydTransportProvider transport={transport}>
                <MotorControl />
            </OphydTransportProvider>
        </OphydSimProvider>
    );
}
\`\`\`

Moving the motor from the box animates \`IOC:m1.RBV\` toward the setpoint and the
readback ticks live — no backend involved.

**In Storybook**, skip the boilerplate with the \`withOphydSim\` decorator, which
mounts both providers for you:

\`\`\`tsx
import { withOphydSim, defaultBeamline } from '@/lib/ophyd-sim';

export const decorators = [withOphydSim(defaultBeamline)];
\`\`\`

---

## Device catalog

Every device is a **factory** you drop into the \`devices\` array of
\`createOphydSim\`. Below is a comprehensive example of each supported type.

### Signal

A scalar PV. It can be a static literal, a periodically-recomputed function, a
value derived from other PVs, or any combination. Signals are **read-only by
default** — pass \`writeAccess: true\` to make them writable.

\`\`\`ts
import { createOphydSim, signal, randomNoise } from '@/lib/ophyd-sim';

createOphydSim({
    devices: [
        // Static, read-only scalar.
        signal({ name: 'IOC:temperature', initialValue: 21.5, units: 'C' }),

        // Writable enum (In / Out), used as a control input for other devices.
        signal({
            name: 'IOC:bs',
            initialValue: 0,
            writeAccess: true,
            enumStrs: ['Out', 'In'],
        }),

        // Periodic signal: recomputes every 100 ms with fresh noise.
        signal({
            name: 'IOC:pressure',
            units: 'mbar',
            periodMs: 100,
            value: ({ random }) => 1000 + randomNoise({ random, sigma: 3 }),
        }),
    ],
});
\`\`\`

Key \`SignalOptions\`: \`initialValue\`, \`value\` (literal or \`(ctx) => value\`),
\`dependsOn\`, \`periodMs\`, \`units\`, \`limits\`, \`writeAccess\`, \`precision\`,
\`enumStrs\`. (See [signal.ts](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/devices/signal.ts).)

### Motor

A linear-velocity motor. One factory seeds **three PVs** that share a single
motion state:

| PV | Meaning |
| --- | --- |
| \`name\` | setpoint (writable; clamps into \`limits\`) |
| \`name.RBV\` | readback — animates toward the setpoint at \`velocity\` units/s |
| \`name.MOVN\` | moving flag — \`1\` while moving, \`0\` once settled |

\`\`\`ts
import { createOphydSim, motor } from '@/lib/ophyd-sim';

createOphydSim({
    devices: [
        motor({
            name: 'IOC:m1',
            initialPosition: 0,
            velocity: 2, // units per second
            limits: [-10, 10], // soft limits clamp setpoint writes
            units: 'mm',
            // epsilon: 1e-4,          // settle tolerance (optional)
            // readbackName: 'IOC:m1.RBV',  // override defaults (optional)
            // movingName: 'IOC:m1.MOVN',
        }),
    ],
});
\`\`\`

Writing the setpoint (\`sim.set('IOC:m1', 5)\`) sets \`MOVN=1\` and advances \`.RBV\`
by \`velocity * dt\` each tick until it lands within \`epsilon\`, then snaps and
clears \`MOVN\`. (See [motor.ts](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/devices/motor.ts).)

### Detector

A simulated area detector. Unlike single-value devices, a detector seeds a
**cluster** of standard Area-Detector PVs from one \`prefix\` — \`cam1:SizeX\`,
\`cam1:SizeY\`, \`cam1:MinX\`, \`cam1:MinY\`, \`cam1:ColorMode\`, \`cam1:DataType\`,
\`cam1:Acquire\`, and the image \`image1:Mode\`. The image pixels themselves are not
a PV; they stream over the camera socket — but their scalar
parameters (opacity, overlay positions) are PVs that other devices can drive.

\`\`\`ts
import { createOphydSim, detector } from '@/lib/ophyd-sim';

createOphydSim({
    devices: [
        detector({
            prefix: '13SIM1',
            image: {
                mode: 'image_file', // or 'noisy' for random-noise frames
                sizeX: 1024,
                sizeY: 1024,
                file: '/images/diffraction.png',
                // files: ['/f0.png', '/f1.png'],  // round-robin per frame (optional)
                overlays: [
                    {
                        file: '/images/beamstop-dot.png',
                        width: 32,
                        height: 32,
                        x: 512, // center in pixels (fallback if unbound)
                        y: 512,
                    },
                ],
            },
            // Derived image parameters other devices drive — see next section.
            modulations: [],
        }),
    ],
});
\`\`\`

Detectors are usually loaded from JSON — see
[simDetector.json](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/scenarios/simDetector.json) and \`simDetectorConfig\`. To render
frames to a canvas, pair the detector with
\`createSimDetectorCameraSocketFactory\` (see [The camera socket](#the-camera-socket)).
(See [detector.ts](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/devices/detector.ts).)

### Bonus: shutter & hexapod

Two higher-level factories cover common beamline hardware:

\`\`\`ts
import { createOphydSim, shutter, hexapod } from '@/lib/ophyd-sim';

createOphydSim({
    devices: [
        // Beam shutter: one analog-output PV, 0 V open / 5 V closed. Defaults open.
        shutter({ name: 'bl531:LJT4:1:AO0' /*, initial: 'closed' */ }),

        // Symetrie six-axis hexapod: seeds *_RBV readbacks, MOVE_PTP setpoints,
        // and the MOVE_PTP execute/STOP command PVs under the given prefix.
        hexapod({ prefix: 'SYM:HEX01', translationVelocity: 4, rotationVelocity: 2 }),
    ],
});
\`\`\`

See [shutter.ts](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/devices/shutter.ts) and [hexapod.ts](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/devices/hexapod.ts) for
the full PV maps and options.

---

## Creating connected devices

The whole point of the simulator is that one device can react to the **current
value of another**. Devices never reference each other directly — they read and
write the same shared state. A device becomes "connected" by listing the PVs it
cares about in \`dependsOn\`; its \`compute\` function then re-runs, in dependency
order, whenever any of those inputs change.

Inside \`compute(ctx)\` you get a \`SimValueContext\`:

- \`ctx.get.number(pv)\` / \`.boolean(pv)\` / \`.string(pv)\` / \`.value(pv)\` — read inputs
- \`ctx.time\`, \`ctx.dt\` — current time (ms) and elapsed seconds since last tick
- \`ctx.random()\` — the sim's random source (override \`random\` in \`createOphydSim\`
  for deterministic tests)

> \`compute\` also runs **once at registration** to seed an initial value, so guard
> against inputs that may not be seeded yet. Order matters: a dependency must be
> registered *before* the device that depends on it. A \`compute\` that throws is
> logged and skipped, not fatal.

### Example 1 — a signal derived from a motor and a control input

A diode reading that peaks when a motor's readback is near 2, is attenuated when
a beamstop is inserted, and carries measurement noise:

\`\`\`ts
import { createOphydSim, motor, signal, gaussian, randomNoise } from '@/lib/ophyd-sim';

createOphydSim({
    devices: [
        motor({ name: 'IOC:m1', limits: [-10, 10], velocity: 1, units: 'mm' }),
        signal({ name: 'IOC:bs', initialValue: 0, writeAccess: true, enumStrs: ['Out', 'In'] }),

        // I0 recomputes whenever the motor readback OR the beamstop changes,
        // and also every 100 ms so the noise keeps moving.
        signal({
            name: 'I0',
            units: 'arb.',
            periodMs: 100,
            dependsOn: ['IOC:m1.RBV', 'IOC:bs'], // <-- the connection
            value: ({ get, random }) => {
                const beam = 1000 * gaussian({ x: get.number('IOC:m1.RBV'), center: 2, sigma: 0.5 });
                const attenuated = get.boolean('IOC:bs') ? beam * 0.01 : beam;
                return attenuated + randomNoise({ random, sigma: 5 });
            },
        }),
    ],
});
\`\`\`

Now \`sim.set('IOC:m1', 2)\` makes \`I0\` climb as the readback approaches the peak,
and \`sim.set('IOC:bs', 1)\` drops it ~99% — all automatically. This is exactly the
[\`defaultBeamline\`](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/scenarios/defaultBeamline.ts) scenario, and the
same coupling drives the diode readout under the Live demo above.

### Example 2 — chaining multiple derived signals

\`dependsOn\` targets can themselves be derived PVs, so you can build a coupling
chain. Here energy drives a Bragg angle, which drives a beam position:

\`\`\`ts
import { createOphydSim, motor, signal, braggAngle } from '@/lib/ophyd-sim';

createOphydSim({
    devices: [
        motor({ name: 'bl:mono_energy_eV', limits: [2000, 7000], velocity: 100, initialPosition: 4500 }),

        // theta derived from energy.
        signal({
            name: 'bl:bragg_deg',
            units: 'deg',
            dependsOn: ['bl:mono_energy_eV.RBV'],
            value: ({ get }) => braggAngle({ energyEV: get.number('bl:mono_energy_eV.RBV') }),
        }),

        // beam Y derived from theta — a second-order dependency.
        signal({
            name: 'bl:beam_y_mm',
            units: 'mm',
            dependsOn: ['bl:bragg_deg'],
            value: ({ get }) => 4 * Math.cos((get.number('bl:bragg_deg') * Math.PI) / 180),
        }),
    ],
});
\`\`\`

### Example 3 — a detector image driven by another device

A detector \`modulation\` is just a derived PV under the hood: it binds an image
parameter (e.g. \`image1:Opacity\`) to a source PV via a linear-clamped map. Here
beam energy dims the rendered image, and a beamstop motor's readback drives an
overlay marker's position:

\`\`\`ts
detector({
    prefix: '13SIM1',
    image: {
        mode: 'image_file',
        sizeX: 1024,
        sizeY: 1024,
        file: '/images/diffraction.png',
        overlays: [
            {
                file: '/images/beamstop-dot.png',
                width: 32,
                height: 32,
                x: 512,
                y: 512,
                // Bind the marker's X to a motor readback: -10..10 mm -> 0..1024 px.
                positionX: {
                    source: 'bl531_xps2:beamstop_x_mm.RBV',
                    from: { in: -10, out: 0 },
                    to: { in: 10, out: 1024 },
                },
            },
        ],
    },
    // Energy 2000..7000 eV maps to image opacity 1.0..0.2.
    modulations: [
        {
            source: 'bl:mono_energy_eV.RBV',
            effect: 'opacity',
            from: { in: 2000, out: 1.0 },
            to: { in: 7000, out: 0.2 },
        },
    ],
});
\`\`\`

The flagship [\`beamstopBeamline\`](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/scenarios/beamstopBeamline.ts) scenario wires
all of these patterns together (energy → Bragg → beam Y → 2D-Gaussian diode
current, gated by a shutter). It's worth reading as a full worked example — the
physics is documented in [skills.md](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/skills.md).

---

## How ophyd-sim works

A sim is a bag of named PVs over shared state, plus two update mechanisms:

- **Ticks** — a periodic loop (\`tickMs\`, ~33 ms ≈ 30 Hz) that advances time-based
  devices: motor motion, periodic signals.
- **Derived signals** — values with a \`dependsOn\` list that recompute, in
  dependency order, whenever an input PV changes.

The React app never talks to the sim directly. It uses its ordinary Ophyd PV
hooks, which read a **transport** from context. In production that transport is a
WebSocket to a real IOC; \`createOphydSimTransport\` swaps in an implementation of
the same interface that reads and writes the in-memory sim instead.

\`\`\`text
React component (e.g. DeviceControllerBox)
        |  handleSetValueRequest / devices
        v
useOphydPVSocket(['IOC:m1', ...])
        |  reads transport via useOphydPVTransport()
        v
OphydTransportProvider  ── production ──▶  WebSocket → real IOC
        |
        └─ simulation ──▶ createOphydSimTransport(sim)
                                |  subscribe / set / unsubscribe / refresh
                                v
                          OphydSim instance
                          ├─ SimState store (PV values + metadata)
                          ├─ DependencyGraph (derived recompute)
                          ├─ Scheduler (tick loop, tickMs)
                          └─ Device factories (motor / signal / detector / …)

OphydSimProvider ── start() on mount / stop() on unmount ──▶ Scheduler
\`\`\`

The two providers have distinct jobs:

- **\`OphydSimProvider\`** owns the sim's lifecycle — it calls \`sim.start()\` on
  mount and \`sim.stop()\` on unmount, and exposes the sim to the sim-specific
  hooks (\`useSimSignal\`, \`useSimSet\`).
- **\`OphydTransportProvider\`** installs the transport into context so the
  *generic* Ophyd hooks resolve to the sim instead of a WebSocket. (It can also
  wrap the sim with \`fallbackToReal\` so descendants fail over to a real backend
  if the override reports an error.)

---

## When & how ophyd-sim kicks in

ophyd-sim engages purely through the **transport seam**. finch's Ophyd hooks
never open a socket themselves — they pull a transport out of React context via
\`useOphydPVTransport()\`. Whichever transport is in context wins:

- **No \`OphydTransportProvider\`, or no override** → the hook lazily constructs a
  real WebSocket transport pointed at the configured backend. (Production.)
- **An \`OphydTransportProvider\` supplies \`transport={createOphydSimTransport(sim)}\`**
  → every descendant PV hook is transparently driven by the sim. Nothing else in
  the component changes; the same code runs against sim or IOC. (Storybook, tests,
  \`SimulatedBeamline\`.)

### What the sim transport speaks

\`createOphydSimTransport\` implements the \`OphydPVTransport\` wire protocol. The
hooks exercise it through these actions (see [createOphydSimTransport.ts](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/transport/createOphydSimTransport.ts)):

| Action sent by a hook | What the sim transport does |
| --- | --- |
| \`subscribe\` / \`subscribeSafely\` / \`subscribeReadOnly\` | Emits a synthesized \`meta\` message (so the device shows connected) then streams every value change for that PV |
| \`set\` | Writes to the sim (\`sim.set\`), triggering derived recompute + motor motion |
| \`unsubscribe\` | Drops the most recent listener for that PV |
| \`refresh\` | Replays the latest value of every active subscription |
| \`onStatus\` | Reports \`'open'\` synchronously — there's no real handshake |

### The Ophyd hooks that use the transport

These are the specific hooks that resolve their transport from context and are
therefore driven by ophyd-sim when a sim transport is provided:

- **[\`useOphydPVSocket(pvs, wsUrl?)\`](https://github.com/bluesky/finch/blob/main/src/api/ophyd/useOphydPVSocket.tsx)** — the
  primary PV-socket hook. Reads its transport via \`useOphydPVTransport()\`, sends
  \`subscribe\`/\`set\`/\`unsubscribe\`/\`refresh\`, and returns \`{ devices,
  handleSetValueRequest, toggleDeviceLock, toggleExpand }\`. **This is the hook the
  sim is built to serve** — and the one the Live demo above uses.
- **[\`useOphydSocket(pvs, wsUrl?)\`](https://github.com/bluesky/finch/blob/main/src/api/ophyd/useOphydSocket.ts)** — legacy
  alias kept for backwards compatibility; delegates to \`useOphydPVSocket\`, so it
  is sim-driven too.

The React-native sim hooks in [\`react/\`](https://github.com/bluesky/finch/blob/main/src/lib/ophyd-sim/react/) talk to the sim **directly**
(not through the transport), and are handy when you're already inside an
\`OphydSimProvider\` and don't need the full PV-socket abstraction:

- **\`useSimSignal(pv)\`** — subscribe to one PV's value; re-renders on change.
- **\`useSimSet()\`** — returns a stable \`(pv, value) => void\` writer.
- **\`useOphydSim()\` / \`useOphydSimOptional()\`** — grab the sim instance itself.

### The camera socket

Detector **image frames** don't travel over the PV transport — they stream over a
separate camera-socket seam. \`CameraCanvas\` reads its factory from
\`useCameraSocketFactory()\`, which \`OphydTransportProvider\` supplies via its
\`cameraSocketFactory\` prop. Pass
\`createSimDetectorCameraSocketFactory(sim, detectorConfig)\` there to render a
detector's live derived state (opacity, overlay positions) to canvas frames — see
[\`SimulatedBeamline\`](https://github.com/bluesky/finch/blob/main/src/features/SimulatedBeamline/SimulatedBeamline.tsx) for
the full wiring.

### Not backed by ophyd-sim

- **[\`useOphydDeviceSocket\`](https://github.com/bluesky/finch/blob/main/src/api/ophyd/useOphydDeviceSocket.ts)** uses the
  separate *device*-socket transport. \`createOphydSimTransport\` is a *PV*
  transport only, so this hook is not driven by ophyd-sim (it falls back to the
  real device backend unless you supply a \`deviceTransport\` override).
- **[\`useSimOphydPVSocket\`](https://github.com/bluesky/finch/blob/main/src/api/ophyd/useSimOphydPVSocket.tsx)** is an older,
  standalone mock (\`sineSignal\` / \`noisySignal\` keywords) that is **unrelated** to
  this package — it doesn't use a transport at all. Prefer \`useOphydPVSocket\` +
  a sim transport for new work.

### Driving the sim without React

The transport and providers are optional. You can drive a sim directly — useful
in tests, where you skip the real loop and step time by hand:

\`\`\`ts
const sim = createOphydSim({ devices: [motor({ name: 'IOC:m1', velocity: 2 })] });

sim.set('IOC:m1', 5); // command a move
sim.advance(1000); // step 1 s of simulated time (no real timers)
sim.get('IOC:m1.RBV'); // => 2  (moved velocity * dt)

// or run the real loop:
sim.start();
// ... later ...
sim.stop();
\`\`\`

\`advance(deltaMs)\` runs a single synthetic tick, so motor motion and periodic
recompute are fully deterministic when you also override \`random\` and \`now\` in
\`createOphydSim\`.
`;B({devices:[S({name:"demo:m1",initialPosition:0,velocity:2,limits:[-10,10],units:"mm"}),S({name:"demo:m2",initialPosition:-3,velocity:4,limits:[-10,10],units:"mm"}),M({name:"demo:I0",units:"arb.",periodMs:100,dependsOn:["demo:m1.RBV"],value:({get:e,random:n})=>1e3*C({x:e.number("demo:m1.RBV"),center:2,sigma:.5})+T({random:n,sigma:5})})]});const F=485,W=215,q=-16,H=-5,Y=3;function x(e,n){const s=e/F*100,o=n/W*100;return`translate(${s}%, ${o}%)`}function X({shutterPV:e="bl531:LJT4:1:AO0",shutterOpenValue:n=0,beamstopXPV:s="bl531_xps2:beamstop_x_mm.RBV",beamstopYPV:o="bl531_xps2:beamstop_y_mm.RBV",pxPerMm:a=2,shutterOpenOffset:l=24}={}){const y=m.useMemo(()=>[e,s,o],[e,s,o]),{devices:i}=u(y),r=m.useMemo(()=>{var p;return parseFloat((p=i[e])==null?void 0:p.value)===n},[i,e,n]),c=m.useMemo(()=>{var f,k;const v=parseFloat((f=i[s])==null?void 0:f.value)||0,p=parseFloat((k=i[o])==null?void 0:k.value)||0;return x(H+v*a,Y-p*a)},[i,s,o,a]),_=m.useMemo(()=>x(0,q+(r?l:0)),[r,l]);return{lightLayer:r?"unblocked":"blocked",monoVisible:r,shutterTransform:_,beamstopTransform:c}}const z="/finch/assets/0_base-CY619hDJ.svg",Z="data:image/svg+xml,%3csvg%20width='485'%20height='215'%20viewBox='0%200%20485%20215'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M0%20131H57.6403L58%20132L57.9101%20133L0%20134V131Z'%20fill='%23FFAFF6'%20fill-opacity='0.8'/%3e%3c/svg%3e",$="data:image/svg+xml,%3csvg%20width='485'%20height='215'%20viewBox='0%200%20485%20215'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M205.556%20110.89L190.5%20131L192.5%20132L208.145%20110.027L205.556%20110.89Z'%20fill='%23FFAFF6'%20fill-opacity='0.8'/%3e%3cpath%20d='M0%20131H191.803L193%20132L192.701%20133L0%20134V131Z'%20fill='%23FFAFF6'%20fill-opacity='0.8'/%3e%3c/svg%3e",G="data:image/svg+xml,%3csvg%20width='485'%20height='215'%20viewBox='0%200%20485%20215'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M66%20138L58%20143.5V162.5L66%20157V138Z'%20stroke='white'/%3e%3c/svg%3e",U="data:image/svg+xml,%3csvg%20width='485'%20height='215'%20viewBox='0%200%20485%20215'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M352.286%2098L360%2098.4722V150.649L355.714%20156L348%20155.361V101.148L352.286%2098Z'%20fill='%23142E48'/%3e%3cpath%20d='M348%20101.148L355.714%20101.463M355.714%20156L360%20150.649V98.4722L352.286%2098L348%20101.148V155.361L355.714%20156ZM355.714%20101.463L360%2098.4722M355.714%20101.463V156'%20stroke='white'/%3e%3cpath%20d='M353%20117.5H350.5V119H353V117.5Z'%20fill='white'%20stroke='white'%20stroke-width='0.5'/%3e%3c/svg%3e",J="data:image/svg+xml,%3csvg%20width='485'%20height='215'%20viewBox='0%200%20485%20215'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M352.5%20115L225.25%20106.547L223.642%20107.383L352.5%20123C352.5%20123%20355.586%20121.652%20355.5%20118.5C355.414%20115.348%20352.5%20115%20352.5%20115Z'%20fill='%23FFAFF6'%20fill-opacity='0.8'/%3e%3c/svg%3e",K="data:image/svg+xml,%3csvg%20width='33'%20height='29'%20viewBox='0%200%2033%2029'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M32.0205%2012.5232L23.5205%2017.5232M23.5205%2010.0232L32.0205%2012.5232V22.0232L23.5205%2027.5232L0.520508%2021.0232L1.02051%2011.5232L9.52051%207.02324L12.5205%207.52324M23.5205%2017.5232V27.5232M23.5205%2017.5232L1.02051%2011.5232'%20stroke='white'/%3e%3cpath%20d='M23.5205%201.02324L12.5205%200.523239V12.5232L23.5205%2014.0232V1.02324Z'%20stroke='white'/%3e%3c/svg%3e",Q=485,ee=215,te={left:"53.2%",top:"50%",width:"6.8%"};function ne(e,n){const s=e/Q*100,o=n/ee*100;return`translate(${s}%, ${o}%)`}function b({sampleXPV:e="bl531:sample_x_mm.RBV",sampleYPV:n="bl531:sample_y_mm.RBV",pxPerMm:s=2}={}){const o=m.useMemo(()=>[e,n],[e,n]),{devices:a}=u(o),l=m.useMemo(()=>{var r,c;const y=parseFloat((r=a[e])==null?void 0:r.value)||0,i=parseFloat((c=a[n])==null?void 0:c.value)||0;return ne(y*s,-i*s)},[a,e,n,s]);return t.jsx("div",{className:h("pointer-events-none absolute inset-0 h-full w-full select-none","transition-transform duration-300"),style:{transform:l},children:t.jsx("img",{src:K,alt:"Sample holder",className:"absolute",style:te})})}try{b.displayName="SampleHolder",b.__docgenInfo={description:`Sample-holder graphic that tracks its X/Y motor readbacks. Subscribes to the
sample stage PVs and slides the holder proportionally across the endstation
canvas. Mirrors the beamstop tracking in [useEndstationDisplay]; render it as
a stacked layer inside [EndstationDisplay].`,displayName:"SampleHolder",props:{sampleXPV:{defaultValue:{value:"bl531:sample_x_mm.RBV"},description:"Sample X readback PV (mm). Defaults to the `beamstopBeamline` motor.",name:"sampleXPV",required:!1,type:{name:"string"}},sampleYPV:{defaultValue:{value:"bl531:sample_y_mm.RBV"},description:"Sample Y readback PV (mm). Defaults to the `beamstopBeamline` motor.",name:"sampleYPV",required:!1,type:{name:"string"}},pxPerMm:{defaultValue:{value:"2"},description:`SVG units the holder travels per mm of motor motion. Calibrate visually;
defaults to 2.`,name:"pxPerMm",required:!1,type:{name:"number"}}}}}catch{}const d="pointer-events-none absolute inset-0 h-full w-full select-none";function g({className:e,...n}){const{lightLayer:s,monoVisible:o,shutterTransform:a,beamstopTransform:l}=X(n);return t.jsxs("div",{className:h("bg-sky-950 relative w-full overflow-hidden",e),style:{aspectRatio:"485 / 215"},children:[t.jsx("img",{src:z,alt:"Endstation diagram",className:d}),t.jsx("img",{src:s==="blocked"?Z:$,alt:"",className:d}),t.jsx("img",{src:G,alt:"",className:h(d,"transition-transform duration-300"),style:{transform:a}}),t.jsx("img",{src:U,alt:"",className:h(d,"transition-transform duration-300"),style:{transform:l}}),o&&t.jsx("img",{src:J,alt:"",className:d}),t.jsx(b,{})]})}try{g.displayName="EndstationDisplay",g.__docgenInfo={description:`Layered SVG graphic of the endstation. Stacks the beamline assets and drives
the light, shutter, and beamstop layers from live ophyd device state via
[useEndstationDisplay]. Purely presentational — all logic lives in the hook.`,displayName:"EndstationDisplay",props:{shutterPV:{defaultValue:null,description:"Shutter analog-output PV. Defaults to the `beamstopBeamline` shutter.",name:"shutterPV",required:!1,type:{name:"string"}},shutterOpenValue:{defaultValue:null,description:"PV value that means the shutter is open (beam passes). Defaults to 0.",name:"shutterOpenValue",required:!1,type:{name:"number"}},beamstopXPV:{defaultValue:null,description:"Beamstop X readback PV (mm). Defaults to the `beamstopBeamline` motor.",name:"beamstopXPV",required:!1,type:{name:"string"}},beamstopYPV:{defaultValue:null,description:"Beamstop Y readback PV (mm). Defaults to the `beamstopBeamline` motor.",name:"beamstopYPV",required:!1,type:{name:"string"}},pxPerMm:{defaultValue:null,description:`SVG units the beamstop layer travels per mm of motor motion. Calibrate
visually; defaults to 2.`,name:"pxPerMm",required:!1,type:{name:"number"}},shutterOpenOffset:{defaultValue:null,description:`SVG units the shutter layer slides out of the beam when open. Calibrate
visually; defaults to 24.`,name:"shutterOpenOffset",required:!1,type:{name:"number"}},className:{defaultValue:null,description:"Classes applied to the root container — use this to set the background\ncolor and/or sizing (e.g. `bg-white w-[485px]`).",name:"className",required:!1,type:{name:"string"}}}}}catch{}const P=["bl531_xps2:beamstop_x_mm","bl531_xps2:beamstop_y_mm","bl531:sample_x_mm","bl531:sample_y_mm"],se=P.map(e=>`${e}.RBV`);function oe(){const{devices:e,handleSetValueRequest:n,toggleDeviceLock:s,toggleExpand:o}=u(P),{devices:a}=u(se);return t.jsxs("div",{className:"flex w-full max-w-[600px] flex-col gap-4",children:[t.jsx(E,{className:"w-full"}),t.jsx(R,{devices:e,devicesRBV:a,handleSetValueRequest:n,toggleDeviceLock:s,toggleExpand:o,collapsibleRelativeMove:!0})]})}function ae(){const e=m.useMemo(()=>I(O),[]);return t.jsx(L,{sim:O,children:t.jsx(D,{transport:e,children:t.jsxs("div",{className:"flex flex-col items-center gap-4",children:[t.jsx(g,{className:"w-full max-w-[600px] rounded"}),t.jsx(oe,{})]})})})}function V(e){const n={h1:"h1",p:"p",...w(),...e.components};return t.jsxs(t.Fragment,{children:[t.jsx(j,{title:"Documentation/Ophyd Sim"}),`
`,t.jsx(n.h1,{id:"ophyd-sim",children:"Ophyd Sim"}),`
`,t.jsx(n.p,{children:`A browser-side simulator for Ophyd beamline devices — motors, shutters,
detectors, and derived signals — that drives finch's normal Ophyd hooks without
a real IOC or WebSocket backend.`}),`
`,t.jsx("div",{style:{display:"flex",justifyContent:"center",margin:"1rem 0 2rem"},children:t.jsx(ae,{})}),`
`,t.jsx(A,{children:N})]})}function Ee(e={}){const{wrapper:n}={...w(),...e.components};return n?t.jsx(n,{...e,children:t.jsx(V,{...e})}):V(e)}export{Ee as default};
