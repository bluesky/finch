export type EnergyVsCurrentPlotPVProps = {
    /** Writable beam-energy PV (x-axis of the plot). */
    energyPv: string;
    /** Beamstop diode current PV (y-axis of the plot). */
    currentPv: string;
    /** Beamstop X motor readback PV — positions the expected curve. */
    beamstopXRbvPv: string;
    /** Beamstop Y motor readback PV — positions the expected curve. */
    beamstopYRbvPv: string;
    /** Max measured points retained before the oldest is dropped. Defaults to 60. */
    numVisiblePoints?: number;
    /** Interval in ms between measured samples. Defaults to 500. */
    pollingIntervalMs?: number;
    /** Number of points in the theoretical expected curve. Defaults to 100. */
    expectedCurvePoints?: number;
    className?: string;
};
/**
 * Live "Beam Energy vs Beamstop Current" plot.
 *
 * Overlays two traces, mirroring the reference diagram:
 *  - Measured: live (energy, current) samples accumulating as the user sweeps
 *    energy, kept in a rolling window (markers).
 *  - Expected: the noise-free `beamstopCurrentModel` swept across the energy
 *    range at the *current* beamstop position (dashed line). It re-shapes when
 *    the beamstop moves.
 */
export default function EnergyVsCurrentPlotPV({ energyPv, currentPv, beamstopXRbvPv, beamstopYRbvPv, numVisiblePoints, pollingIntervalMs, expectedCurvePoints, className, }: EnergyVsCurrentPlotPVProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=EnergyVsCurrentPlotPV.d.ts.map