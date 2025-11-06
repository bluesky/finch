export function computeMonoAngleFromEnergy(energy_eV: number, mono_offset_deg?: number): number {
    // Physical constants
    const h_m2kgps: number = 6.6261e-34;
    const c_mps: number = 299792458;
    const e_eV: number = 6.2415e18;
  
    // Silicon crystal spacing and Bragg parameters
    const Si_m: number = 5.43e-10;
    const a_Si111_m: number = Si_m / Math.sqrt(1 ** 2 + 1 ** 2 + 1 ** 2); // = Si_m / sqrt(3)
    const default_mono_offset_deg: number = 12.787;
  
    // Calculate theta from energy using inverse Bragg's law
    // From: energy_eV = (h * c * e_eV) / (2 * a_Si111_m * sin(theta))
    // Solve for theta: sin(theta) = (h * c * e_eV) / (2 * a_Si111_m * energy_eV)
    const sin_theta: number = (h_m2kgps * c_mps * e_eV) / (2 * a_Si111_m * energy_eV);
    
    // Check if sin_theta is within valid range [-1, 1]
    if (Math.abs(sin_theta) > 1) {
        throw new Error(`Invalid energy value: ${energy_eV} eV results in sin(theta) = ${sin_theta}, which is outside [-1, 1]`);
    }
    
    // Calculate theta in radians, then convert to degrees
    const theta_rad: number = Math.asin(sin_theta);
    const theta_deg: number = (theta_rad * 180) / Math.PI;
    
    // Add the offset to get the monochromator angle
    const mono_angle_deg: number = theta_deg + (mono_offset_deg ?? default_mono_offset_deg);
  
    return mono_angle_deg;
}

export function computeEnergyFromMonoAngle(mono_deg_input: number, mono_offset_deg?: number): number {
    // Physical constants
    const h_m2kgps: number = 6.6261e-34;
    const c_mps: number = 299792458;
    const e_eV: number = 6.2415e18;
  
    // Silicon crystal spacing and Bragg parameters
    const Si_m: number = 5.43e-10;
    const a_Si111_m: number = Si_m / Math.sqrt(1 ** 2 + 1 ** 2 + 1 ** 2); // = Si_m / sqrt(3)
    const default_mono_offset_deg: number = 12.787;
  
    // Convert input angle to radians after subtracting offset
    const theta_rad: number = ((mono_deg_input - (mono_offset_deg ?? default_mono_offset_deg)) * Math.PI) / 180;

    // Energy in eV using Bragg's law
    const energy_eV: number = (h_m2kgps * c_mps * e_eV) / (2 * a_Si111_m * Math.sin(theta_rad));
  
    return energy_eV;
}

// Example usage
const targetEnergy: number = 10000; // 10 keV
const requiredAngle: number = computeMonoAngleFromEnergy(targetEnergy);
console.log(`Required mono angle for ${targetEnergy} eV: ${requiredAngle.toFixed(3)} degrees`);

// Verify with round-trip calculation
const verifyEnergy: number = computeEnergyFromMonoAngle(requiredAngle);
console.log(`Verification: ${requiredAngle.toFixed(3)} degrees gives ${verifyEnergy.toFixed(1)} eV`);