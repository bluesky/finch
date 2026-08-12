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
export declare const hexapodBeamline: import('..').OphydSim;
//# sourceMappingURL=hexapodBeamline.d.ts.map