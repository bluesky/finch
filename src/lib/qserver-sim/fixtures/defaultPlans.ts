import type { Plan } from '@/api/qServer/types/plansDevices';
import { plan } from '../factories/plan';
import { deviceAnnotation, deviceListAnnotation, parameter } from '../factories/parameter';

/**
 * Finch's default plan catalog: `count`, `scan` and `grid_scan`.
 *
 * Parameter names, kinds, descriptions and string-typed defaults are taken from real
 * `plans/allowed` output captured in `src/components/QServer/utils/qServerMockData.ts`, so a
 * form built against the sim renders what it would against a live server.
 *
 * The `annotation` blocks and `grid_scan`'s `mode` enum are **synthesized** — the captured
 * output has none, and without them there is nothing to exercise the device-dropdown and
 * enum-select widgets with.
 */

const DETECTORS = ['det', 'det1', 'det2'];
const MOTORS = ['motor', 'motor1', 'motor2'];

export const countPlan: Plan = plan({
    name: 'count',
    module: 'bluesky.plans',
    description: 'Take one or more readings from detectors.',
    parameters: [
        parameter({
            name: 'detectors',
            description: "list of 'readable' objects",
            annotation: deviceListAnnotation(DETECTORS), // synthesized
        }),
        parameter({
            name: 'num',
            description:
                'number of readings to take; default is 1\n\nIf None, capture data until canceled',
            default: '1',
        }),
        parameter({
            name: 'delay',
            description: 'Time delay in seconds between successive readings; default is 0.',
            default: 'None',
        }),
        parameter({
            name: 'md',
            kind: 'KEYWORD_ONLY',
            description: 'metadata',
            default: 'None',
        }),
    ],
});

export const scanPlan: Plan = plan({
    name: 'scan',
    module: 'bluesky.plans',
    description: 'Scan over one multi-motor trajectory.',
    parameters: [
        parameter({
            name: 'detectors',
            description: "list of 'readable' objects",
            annotation: deviceListAnnotation(DETECTORS), // synthesized
        }),
        parameter({
            name: 'motor',
            description: "any 'settable' object (motor, temp controller, etc.)",
            annotation: deviceAnnotation(MOTORS), // synthesized
            convertDeviceNames: true,
        }),
        parameter({ name: 'start', description: 'starting position of motor' }),
        parameter({ name: 'stop', description: 'ending position of motor' }),
        parameter({
            name: 'num',
            description: 'number of points',
            default: 'None',
        }),
        parameter({
            name: 'md',
            kind: 'KEYWORD_ONLY',
            description: 'metadata',
            default: 'None',
        }),
    ],
});

export const gridScanPlan: Plan = plan({
    name: 'grid_scan',
    module: 'bluesky.plans',
    description: 'Scan over a mesh; each motor is on an independent trajectory.',
    parameters: [
        parameter({
            name: 'detectors',
            description: "list of 'readable' objects",
            annotation: deviceListAnnotation(DETECTORS), // synthesized
        }),
        parameter({
            name: 'args',
            kind: 'VAR_POSITIONAL',
            description:
                'patterned like (``motor1, start1, stop1, num1, motor2, start2, stop2, num2,`` ...)',
        }),
        parameter({
            name: 'snake_axes',
            kind: 'KEYWORD_ONLY',
            description: 'which axes should be snaked',
            default: 'None',
        }),
        parameter({
            name: 'mode',
            kind: 'KEYWORD_ONLY',
            description: 'Synthesized enum parameter, so enum inputs have something to render.',
            default: 'fast',
            enums: ['fast', 'slow'], // synthesized
        }),
        parameter({
            name: 'md',
            kind: 'KEYWORD_ONLY',
            description: 'metadata',
            default: 'None',
        }),
    ],
});

/** The catalog `createQServerSim` uses when no `plans` option is supplied. */
export const defaultPlans: Record<string, Plan> = {
    count: countPlan,
    scan: scanPlan,
    grid_scan: gridScanPlan,
};
