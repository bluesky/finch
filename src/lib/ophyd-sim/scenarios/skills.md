# beamstopBeamline

A self-contained Ophyd simulation scenario that models a beamstop-alignment
beamline: motors, a beam shutter, an energy-dependent diode-current signal, and a
simulated area detector. Defined in [beamstopBeamline.ts](beamstopBeamline.ts),
with the noise-free physics shared through [beamstopModel.ts](beamstopModel.ts).

It backs the `<Beamstop />` feature and the
[SimulatedBeamline](../../../features/SimulatedBeamline/SimulatedBeamline.tsx)
widget — every panel there reads and writes this same sim, so a move in the
device table updates the endstation graphic, detector, and current plot live.

## Devices & PVs

| PV | Kind | Range / units | Notes |
| --- | --- | --- | --- |
| `bl531_xps2:beamstop_x_mm` | motor | `[-10, 10]` mm, v=0.8 | Beamstop X. Also `.RBV` / `.MOVN`. Starts at −5. |
| `bl531_xps2:beamstop_y_mm` | motor | `[-10, 10]` mm, v=0.8 | Beamstop Y. Also `.RBV` / `.MOVN`. Starts at +5. |
| `bl531:sample_x_mm` | motor | `[-10, 10]` mm, v=2 | Sample-holder X (translates the graphic). Starts centered. |
| `bl531:sample_y_mm` | motor | `[-10, 10]` mm, v=2 | Sample-holder Y (translates the graphic). Starts centered. |
| `bl531:mono_energy_eV` | motor | `[2000, 7000]` eV, v=100 | Writable photon energy. Starts at 4500 eV (`ENERGY_REF_EV`). |
| `bl531:LJT4:1:AO0` | shutter | 0 V open / 5 V closed | Beam shutter. Driven by `<Shutter />`. Defaults to **open**. |
| `bl201-beamstop:current` | signal | A, 100 ms period | Diode current, derived from the two beamstop RBVs + energy + shutter. |

Exported constants: `SHUTTER_PV`, `simDetectorConfig` (the `13SIM1` detector from
[simDetector.json](simDetector.json)).

## Physics model

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

## Shutter coupling

Beam reaches the diode only when the shutter is open (`SHUTTER_OPEN_VALUE`). Any
other value — closed at 5 V, or mid-transit — makes `bl201-beamstop:current` read a
clean **zero** (no beam ⇒ no signal, no noise). In `SimulatedBeamline`, closing the
shutter also pauses the simulated detector stream.

## Usage

```ts
import { createOphydSimTransport } from '@/lib/ophyd-sim';
import { beamstopBeamline, simDetectorConfig } from '@/lib/ophyd-sim';

const transport = createOphydSimTransport(beamstopBeamline);
```

The scenario is a plain `createOphydSim({ devices: [...] })` result — pass it to a
transport or `OphydSimProvider` and drive the PVs above through the normal Ophyd
socket hooks.

## Registration-order gotchas

Device order in the `devices` array matters because derived values resolve their
`dependsOn` at registration:

1. The **shutter** is seeded before the diode signal so the signal's `dependsOn`
   on `SHUTTER_PV` resolves.
2. The **detector** is placed after the energy motor so its derived
   `image1:Opacity` computes from a seeded energy at registration, then tracks
   energy on every change.
