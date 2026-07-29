import { createOphydSim } from '../core/createOphydSim';
import { hexapod } from '../devices/hexapod';

/**
 * Standalone scenario backing the <Hexapod /> feature. Provides the single
 * Symetrie hexapod device at the default prefix 'SYM:HEX01', matching the PV
 * names hexapodUtils.ts generates when no prefix is supplied.
 *
 *  - Translation axes (tx/ty/tz): [-10, 10] mm
 *  - Rotation axes (rx/ry/rz):    [-5, 5] deg
 *
 * Starts at the all-zero home pose. See {@link hexapod} for the full PV list
 * and move semantics.
 */
export const hexapodBeamline = createOphydSim({
    devices: [
        hexapod({
            prefix: 'SYM:HEX01',
            translationLimits: [-10, 10],
            rotationLimits: [-5, 5],
        }),
    ],
});
