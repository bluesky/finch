import { gaussian2d } from '../generators/gaussian';
import { braggAngle } from '../generators/bragg';

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
export const ENERGY_PV = 'bl531:mono_energy_eV';

// Energy sweep range (eV). Chosen so the Si(111) Bragg angle lands in a
// realistic spread and the resulting beam shift stays within motor travel.
export const ENERGY_MIN_EV = 2000;
export const ENERGY_MAX_EV = 7000;
/** Reference energy at which the beam sits exactly at CENTER_Y. */
export const ENERGY_REF_EV = 4500;

// Beam position (the magnitude of the current peaks when the stop sits here).
export const CENTER_X = 2.5;
export const CENTER_Y = 1.5;
export const SIGMA_X = 2;
export const SIGMA_Y = 4;
/** Full-strength beamstop current. */
export const PEAK_CURRENT = 100;

/**
 * How far (mm) the beam center travels vertically across the energy range.
 * Kept small enough that the swept beam center stays comfortably inside the
 * motors' [-10, 10] mm travel, so "Go To Best" can always reach the peak.
 */
export const BEAM_SHIFT_AMPLITUDE_MM = 4;

const COS_THETA_REF = Math.cos(braggAngle({ energyEV: ENERGY_REF_EV }));

/**
 * Vertical beam position (mm) for a given energy. Equals CENTER_Y at the
 * reference energy and shifts by cos(θ) — the cosine relationship from the
 * reference diagram — as energy moves away from it.
 */
export function beamYAtEnergy(energyEV: number): number {
    const cosTheta = Math.cos(braggAngle({ energyEV }));
    return CENTER_Y + BEAM_SHIFT_AMPLITUDE_MM * (cosTheta - COS_THETA_REF);
}

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
export function beamstopCurrentModel({ x, y, energyEV }: BeamstopCurrentModelOptions): number {
    const intercept = gaussian2d({
        x,
        y,
        centerX: CENTER_X,
        centerY: beamYAtEnergy(energyEV),
        sigmaX: SIGMA_X,
        sigmaY: SIGMA_Y,
    });
    return PEAK_CURRENT * intercept;
}
