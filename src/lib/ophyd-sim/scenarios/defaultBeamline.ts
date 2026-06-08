import { createOphydSim } from '../core/createOphydSim';
import { motor } from '../devices/motor';
import { signal } from '../devices/signal';
import { gaussian } from '../generators/gaussian';
import { randomNoise } from '../generators/noise';

/**
 * A default beamline scenario used by Storybook and TestPage when no
 * specific scenario is provided. Mirrors the PV names finch components
 * already reference (IOC:m1 / IOC:m1.RBV) so existing stories work without
 * code changes.
 *
 * Devices:
 *  - IOC:m1            — motor setpoint (limits -10..10, velocity 1)
 *  - IOC:m1.RBV        — readback, animates toward setpoint
 *  - IOC:m1.MOVN       — moving flag
 *  - I0                — derived scalar peaked near readback=2 with noise
 */
export const defaultBeamline = createOphydSim({
    devices: [
        motor({
            name: 'IOC:m1',
            initialPosition: 0,
            velocity: 1,
            limits: [-10, 10],
            units: 'mm',
        }),
        signal({
            name: 'I0',
            units: 'arb.',
            periodMs: 100,
            dependsOn: ['IOC:m1.RBV'],
            value: ({ get, random }) =>
                1000 *
                    gaussian({
                        x: get.number('IOC:m1.RBV'),
                        center: 2,
                        sigma: 0.5,
                    }) +
                randomNoise({ random, sigma: 5 }),
        }),
    ],
});
