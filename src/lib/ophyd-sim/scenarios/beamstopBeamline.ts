import { createOphydSim } from '../core/createOphydSim';
import { motor } from '../devices/motor';
import { signal } from '../devices/signal';
import { shutter, SHUTTER_OPEN_VALUE } from '../devices/shutter';
import { detector, type DetectorConfig } from '../devices/detector';
import { randomNoise } from '../generators/noise';
import {
    beamstopCurrentModel,
    ENERGY_PV,
    ENERGY_REF_EV,
    ENERGY_MIN_EV,
    ENERGY_MAX_EV,
} from './beamstopModel';
import rawSimDetectorConfig from './simDetector.json';

/** The detector defined in `simDetector.json` (prefix '13SIM1'). */
export const simDetectorConfig = rawSimDetectorConfig as DetectorConfig;

/**
 * Beamstop scenario backing the <Beamstop /> feature. Provides the exact PV
 * names that component references on TestPage:
 *
 * Devices:
 *  - bl531_xps2:beamstop_x_mm        — X motor setpoint (+ .RBV / .MOVN)
 *  - bl531_xps2:beamstop_y_mm        — Y motor setpoint (+ .RBV / .MOVN)
 *  - bl531:mono_energy_eV            — writable beam energy. Selecting an energy
 *                                      sets the DCM Bragg angle, which shifts the
 *                                      beam vertically and therefore changes the
 *                                      current at a fixed beamstop position.
 *  - bl531:LJT4:1:AO0                — beam shutter analog output (writable; the
 *                                      PV the <Shutter /> component controls).
 *                                      0 V = Open, 5 V = Closed. Defaults to Open.
 *  - bl201-beamstop:current          — beamstop diode current, derived from the
 *                                      two readbacks AND the energy via the shared
 *                                      beamstopCurrentModel. Peaks when the stop is
 *                                      centered on the (energy-dependent) beam,
 *                                      which is what the "best option" logic hunts.
 *                                      Reads 0 (plus noise) unless the shutter is
 *                                      open, since no beam reaches the diode while
 *                                      it is closed.
 *
 * Motors start off the optimum so "Go To Best" has somewhere to move to.
 */
export const SHUTTER_PV = 'bl531:LJT4:1:AO0';
export const beamstopBeamline = createOphydSim({
    devices: [
        motor({
            name: 'bl531_xps2:beamstop_x_mm',
            initialPosition: -5,
            velocity: 2,
            limits: [-10, 10],
            units: 'mm',
        }),
        motor({
            name: 'bl531_xps2:beamstop_y_mm',
            initialPosition: 5,
            velocity: 2,
            limits: [-10, 10],
            units: 'mm',
        }),
        // Sample-holder stage: two independent linear axes that translate the
        // sample-holder graphic in <EndstationDisplay />. Start centered so the
        // holder sits on the beam by default.
        motor({
            name: 'bl531:sample_x_mm',
            initialPosition: 0,
            velocity: 2,
            limits: [-10, 10],
            units: 'mm',
        }),
        motor({
            name: 'bl531:sample_y_mm',
            initialPosition: 0,
            velocity: 2,
            limits: [-10, 10],
            units: 'mm',
        }),
        motor({
            name: ENERGY_PV,
            initialPosition: ENERGY_REF_EV,
            velocity: 100,
            units: 'eV',
            limits: [ENERGY_MIN_EV, ENERGY_MAX_EV],
        }),
        // Beam shutter: writable analog output (0 V Open / 5 V Closed). Defaults
        // to Open so the diode reads the modelled current unless something
        // deliberately blocks the beam. Seeded before the diode so its dependsOn
        // resolves at registration.
        shutter({ name: SHUTTER_PV, initial: 'open' }),
        signal({
            name: 'bl201-beamstop:current',
            units: 'A',
            periodMs: 100,
            dependsOn: [
                'bl531_xps2:beamstop_x_mm.RBV',
                'bl531_xps2:beamstop_y_mm.RBV',
                ENERGY_PV,
                SHUTTER_PV,
            ],
            value: ({ get, random }) => {
                // Beam reaches the diode only when the shutter is open; any other
                // value (closed at 5 V, or mid-transit) reads a clean zero — no
                // beam means no signal and no measurement noise.
                if (get.number(SHUTTER_PV) !== SHUTTER_OPEN_VALUE) return 0;
                const current = beamstopCurrentModel({
                    x: get.number('bl531_xps2:beamstop_x_mm.RBV'),
                    y: get.number('bl531_xps2:beamstop_y_mm.RBV'),
                    energyEV: get.number(ENERGY_PV),
                });
                return current + randomNoise({ random, sigma: 2e-8 });
            },
        }),

        // Detector defined from a JSON file (prefix '13SIM1'). Placed after the
        // energy signal so its derived image1:Opacity computes from a seeded
        // energy at registration; opacity then tracks energy on every change.
        detector(simDetectorConfig),
    ],
});
