/**
 * Beam-shutter control anchored to the top-left of the beamline cartoon. Because it
 * lives inside the widget's Ophyd sim providers it drives the simulated beamline
 * directly; `absolute` positioning pins it to the top-left of the endstation graphic's
 * `relative` container. Drives bl531:LJT4:1:AO0; closing it (5 V) pauses the detector
 * and zeroes the diode current.
 */
export default function SimulatedBeamlineShutter(): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SimulatedBeamlineShutter.d.ts.map