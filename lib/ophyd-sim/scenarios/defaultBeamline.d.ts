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
export declare const defaultBeamline: import('..').OphydSim;
//# sourceMappingURL=defaultBeamline.d.ts.map