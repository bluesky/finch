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
 *  - IOC:bs            — beamstop, writable In/Out (defaults to Out)
 *  - I0                — derived scalar peaked near readback=2 with noise,
 *                        attenuated ~99% while the beamstop is In
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
        // Beamstop: binary In/Out, writable. 0 = Out, 1 = In. Defaults to Out
        // so I0 is unchanged unless something deliberately inserts the stop.
        signal({
            name: 'IOC:bs',
            initialValue: 0,
            writeAccess: true,
            enumStrs: ['Out', 'In'],
        }),
        signal({
            name: 'I0',
            units: 'arb.',
            periodMs: 100,
            dependsOn: ['IOC:m1.RBV', 'IOC:bs'],
            value: ({ get, random }) => {
                const beam =
                    1000 *
                    gaussian({
                        x: get.number('IOC:m1.RBV'),
                        center: 2,
                        sigma: 0.5,
                    });
                // Beamstop attenuates the direct beam ~99% when In.
                const attenuated = get.boolean('IOC:bs') ? beam * 0.01 : beam;
                return attenuated + randomNoise({ random, sigma: 5 });
            },
        }),
    ],
});
