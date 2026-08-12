import { DetectorConfig } from '../devices/detector';
/** The detector defined in `simDetector.json` (prefix '13SIM1'). */
export declare const simDetectorConfig: DetectorConfig;
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
export declare const SHUTTER_PV = "bl531:LJT4:1:AO0";
export declare const beamstopBeamline: import('..').OphydSim;
//# sourceMappingURL=beamstopBeamline.d.ts.map