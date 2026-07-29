# ophyd-sim

A self-contained, browser-side simulator for [Ophyd](https://blueskyproject.io/ophyd/)
beamline devices. It models EPICS-style PVs — motors, shutters, detectors, and
derived signals — entirely in-process, so the app's normal Ophyd socket hooks
can be driven without a real IOC. It powers Storybook stories, tests, and the
[SimulatedBeamline](../../features/SimulatedBeamline/SimulatedBeamline.tsx) widget.

Everything is re-exported from the package root ([index.ts](index.ts)); import from
`@/lib/ophyd-sim` rather than reaching into subfolders.

## Mental model

A sim is a bag of named PVs over shared state, plus two update mechanisms:

- **Ticks** — a periodic loop (`tickMs`, default 100 ms) that advances
  time-based devices (motor motion, periodic signals).
- **Derived signals** — values declared with a `dependsOn` list that recompute,
  in dependency order, whenever an input PV changes.

Devices are just **factories** that wire themselves into a `SimRegistration` at
build time — they seed PVs, register derived signals, and attach tick/set
handlers. Devices never reference each other directly; they read and write the
same shared state through the same `get`/`set` API user code uses.

```ts
import {
    createOphydSim,
    motor,
    shutter,
    signal,
    createOphydSimTransport,
} from '@/lib/ophyd-sim';

const sim = createOphydSim({
    devices: [
        motor({ name: 'IOC:m1', limits: [-10, 10], velocity: 2 }),
        shutter({ name: 'IOC:shutter' }),
        signal({ name: 'IOC:reading', dependsOn: ['IOC:m1.RBV'], compute: (ctx) => ... }),
    ],
});

const transport = createOphydSimTransport(sim);
// or drive it directly:
sim.start();
sim.set('IOC:m1', 5); // motor animates its .RBV toward 5, sets .MOVN
sim.get('IOC:m1.RBV');
```

The sim does **not** tick until `start()` is called (usually by `OphydSimProvider`
on mount). In tests, skip the real loop and drive time by hand with
`sim.advance(deltaMs)`.

## Building blocks

Each subsystem lives in its own folder; the highlights:

| Folder | What's there |
| --- | --- |
| [core/](core/) | `createOphydSim`, the `SimState` store, `DependencyGraph` for derived values, the `Scheduler` tick loop, and all shared [types](core/types.ts) (`OphydSim`, `SimRegistration`, `SimValueContext`, …). |
| [devices/](devices/) | Device factories: [`motor`](devices/motor.ts) (setpoint + `.RBV` + `.MOVN`), [`shutter`](devices/shutter.ts) (`SHUTTER_OPEN_VALUE` / `SHUTTER_CLOSED_VALUE`), [`signal`](devices/signal.ts), [`hexapod`](devices/hexapod.ts), and [`detector`](devices/detector.ts) (image opacity/mode/overlay modulation). |
| [generators/](generators/) | Pure value functions for `compute`: `gaussian`, `gaussian2d`, `randomNoise`, `randomWalk`, `braggAngle`. |
| [transport/](transport/) | [`createOphydSimTransport`](transport/createOphydSimTransport.ts) — adapts a sim to the app's Ophyd transport interface so the normal PV socket hooks work against it. |
| [camera/](camera/) | `SimCameraSocket` and `createSimDetectorCameraSocketFactory` — render a detector's derived state to canvas frames over a camera-socket-shaped API. |
| [react/](react/) | `OphydSimProvider` plus hooks (`useOphydSim`, `useOphydSimOptional`, `useSimSignal`, `useSimSet`). |
| [storybook/](storybook/) | `withOphydSim` decorator for stories. |
| [scenarios/](scenarios/) | Prebuilt, ready-to-use sims (see below). |

## Writing a device or derived signal

Inside a `compute(ctx)` you get a `SimValueContext`:

- `ctx.get.number(pv)` / `.boolean(pv)` / `.string(pv)` / `.value(pv)` — read inputs.
- `ctx.time`, `ctx.dt` — current time and elapsed ms.
- `ctx.random()` — the sim's random source (override `random` in
  `createOphydSim` for deterministic tests).

`compute` runs once at registration to seed an initial value, so guard against
inputs that may not be seeded yet. Recomputation is best-effort: a `compute` (or
`onSet` handler) that throws is logged and skipped, not fatal.

## Scenarios

Ready-made sims exported from the root, defined in [scenarios/](scenarios/):

- [`defaultBeamline`](scenarios/defaultBeamline.ts) — a basic motor/signal beamline.
- [`hexapodBeamline`](scenarios/hexapodBeamline.ts) — a hexapod-focused sim.
- [`beamstopBeamline`](scenarios/beamstopBeamline.ts) — the flagship scenario (below).

### beamstopBeamline

Models a beamstop-alignment beamline: motors, a beam shutter, an
energy-dependent diode-current signal, and a simulated area detector. Defined in
[beamstopBeamline.ts](scenarios/beamstopBeamline.ts), with the noise-free physics
shared through [beamstopModel.ts](scenarios/beamstopModel.ts). It backs the
`<Beamstop />` feature and the
[SimulatedBeamline](../../features/SimulatedBeamline/SimulatedBeamline.tsx) widget —
every panel there reads and writes this same sim, so a move in the device table
updates the endstation graphic, detector, and current plot live.

#### Devices & PVs

| PV | Kind | Range / units | Notes |
| --- | --- | --- | --- |
| `bl531_xps2:beamstop_x_mm` | motor | `[-10, 10]` mm, v=0.8 | Beamstop X. Also `.RBV` / `.MOVN`. Starts at −5. |
| `bl531_xps2:beamstop_y_mm` | motor | `[-10, 10]` mm, v=0.8 | Beamstop Y. Also `.RBV` / `.MOVN`. Starts at +5. |
| `bl531:sample_x_mm` | motor | `[-10, 10]` mm, v=2 | Sample-holder X (translates the graphic). Starts centered. |
| `bl531:sample_y_mm` | motor | `[-10, 10]` mm, v=2 | Sample-holder Y (translates the graphic). Starts centered. |
| `bl531:mono_energy_eV` | motor | `[2000, 7000]` eV, v=100 | Writable photon energy. Starts at 4500 eV (`ENERGY_REF_EV`). |
| `bl531:LJT4:1:AO0` | shutter | 0 V open / 5 V closed | Beam shutter. Driven by `<Shutter />`. Defaults to **open**. |
| `bl201-beamstop:current` | signal | A, 100 ms period | Diode current, derived from the two beamstop RBVs + energy + shutter. |

Also exports `simDetectorConfig` (the `13SIM1` detector from
[simDetector.json](scenarios/simDetector.json)).

#### Physics model

The coupling chain (deterministic, noise-free) lives in `beamstopCurrentModel`:

```
energy → DCM Bragg angle θ → beam Y shifts as cos(θ)
       → 2D-Gaussian intercept of beam and beamstop → diode current
```

- The current peaks at `PEAK_CURRENT` (100) when the stop sits at
  `(CENTER_X = 2.5, beamYAtEnergy(energy))` and falls off as a 2D Gaussian
  (`SIGMA_X = 2`, `SIGMA_Y = 4`) away from it.
- Energy changes shift the beam **vertically**, so the optimal beamstop Y depends
  on energy. At `ENERGY_REF_EV` (4500) the beam sits exactly at `CENTER_Y = 1.5`.
- The scenario adds Gaussian measurement noise (`sigma: 2e-8`) on top of the model;
  the Energy-vs-Current plot draws the bare model as the "expected" curve.

Motors start **off** the optimum so the feature's "Go To Best" logic has somewhere
to move to, and `BEAM_SHIFT_AMPLITUDE_MM` (4) is kept inside motor travel so the
peak is always reachable.

#### Shutter coupling

Beam reaches the diode only when the shutter is open (`SHUTTER_OPEN_VALUE`). Any
other value — closed at 5 V, or mid-transit — makes `bl201-beamstop:current` read a
clean **zero** (no beam ⇒ no signal, no noise). In `SimulatedBeamline`, closing the
shutter also pauses the simulated detector stream.

#### Registration-order gotchas

Device order in the `devices` array matters because derived values resolve their
`dependsOn` at registration:

1. The **shutter** is seeded before the diode signal so the signal's `dependsOn`
   on the shutter PV resolves.
2. The **detector** is placed after the energy motor so its derived
   `image1:Opacity` computes from a seeded energy at registration, then tracks
   energy on every change.
