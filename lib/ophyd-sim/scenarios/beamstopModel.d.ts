/**
 * Shared, noise-free physics model for the beamstop diode current.
 *
 * Pulled out of `beamstopBeamline.ts` so two consumers stay in sync:
 *  - the simulator scenario, which adds measurement noise on top, and
 *  - the Energy-vs-Current plot, which draws this as the "expected" curve.
 *
 * Coupling chain (see the "Physical Beam Shift vs DCM Angle" reference plot):
 *   energy → DCM Bragg angle θ → beam vertical position shifts as cos(θ)
 *          → the 2D-Gaussian intercept of beam and beamstop → diode current.
 */
/** Writable PV the user sets to choose photon energy. */
export declare const ENERGY_PV = "bl531:mono_energy_eV";
export declare const ENERGY_MIN_EV = 2000;
export declare const ENERGY_MAX_EV = 7000;
/** Reference energy at which the beam sits exactly at CENTER_Y. */
export declare const ENERGY_REF_EV = 4500;
export declare const CENTER_X = 2.5;
export declare const CENTER_Y = 1.5;
export declare const SIGMA_X = 2;
export declare const SIGMA_Y = 4;
/** Full-strength beamstop current. */
export declare const PEAK_CURRENT = 100;
/**
 * How far (mm) the beam center travels vertically across the energy range.
 * Kept small enough that the swept beam center stays comfortably inside the
 * motors' [-10, 10] mm travel, so "Go To Best" can always reach the peak.
 */
export declare const BEAM_SHIFT_AMPLITUDE_MM = 4;
/**
 * Vertical beam position (mm) for a given energy. Equals CENTER_Y at the
 * reference energy and shifts by cos(θ) — the cosine relationship from the
 * reference diagram — as energy moves away from it.
 */
export declare function beamYAtEnergy(energyEV: number): number;
export interface BeamstopCurrentModelOptions {
    /** Beamstop X position (mm). */
    x: number;
    /** Beamstop Y position (mm). */
    y: number;
    /** Photon energy (eV). */
    energyEV: number;
}
/**
 * Deterministic beamstop diode current for a given stop position and energy.
 * Peaks at PEAK_CURRENT when the stop sits at (CENTER_X, beamYAtEnergy) and
 * falls off as a 2D Gaussian away from it.
 */
export declare function beamstopCurrentModel({ x, y, energyEV }: BeamstopCurrentModelOptions): number;
//# sourceMappingURL=beamstopModel.d.ts.map