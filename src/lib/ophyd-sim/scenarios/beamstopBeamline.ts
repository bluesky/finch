import { createOphydSim } from '../core/createOphydSim';
import { motor } from '../devices/motor';
import { signal } from '../devices/signal';
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
 *  - bl201-beamstop:current          — beamstop diode current, derived from the
 *                                      two readbacks AND the energy via the shared
 *                                      beamstopCurrentModel. Peaks when the stop is
 *                                      centered on the (energy-dependent) beam,
 *                                      which is what the "best option" logic hunts.
 *
 * Motors start off the optimum so "Go To Best" has somewhere to move to.
 */
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
        motor({
            name: ENERGY_PV,
            initialPosition: ENERGY_REF_EV,
            velocity: 100,
            units: 'eV',
            limits: [ENERGY_MIN_EV, ENERGY_MAX_EV],
        }),
        signal({
            name: 'bl201-beamstop:current',
            units: 'A',
            periodMs: 100,
            dependsOn: ['bl531_xps2:beamstop_x_mm.RBV', 'bl531_xps2:beamstop_y_mm.RBV', ENERGY_PV],
            value: ({ get, random }) => {
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
