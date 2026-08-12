export interface BraggAngleOptions {
    /** Photon energy in electron-volts. */
    energyEV: number;
    /**
     * Crystal 2d-spacing in Ångström. Defaults to Si(111) ≈ 6.271 Å, the most
     * common monochromator crystal.
     */
    twoD?: number;
}
/**
 * Bragg angle for a double-crystal monochromator selecting `energyEV`.
 *
 * From Bragg's law (nλ = 2d·sinθ, n = 1) and E = hc/λ:
 *   sinθ = hc / (2d · E)
 * Higher energy → smaller angle. The sin argument is clamped to [-1, 1] so
 * energies outside the physically reachable range saturate at θ = π/2 instead
 * of returning NaN.
 *
 * @returns the Bragg angle θ in radians, within (0, π/2].
 */
export declare function braggAngle({ energyEV, twoD }: BraggAngleOptions): number;
//# sourceMappingURL=bragg.d.ts.map