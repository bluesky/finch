export function computeEnergyFromMonoAngle(mono_deg_input: number): number {
    // Physical constants
    const h_m2kgps: number = 6.6261e-34;
    const c_mps: number = 299792458;
    const e_eV: number = 6.2415e18;
  
    // Silicon crystal spacing and Bragg parameters
    const Si_m: number = 5.43e-10;
    const a_Si111_m: number = Si_m / Math.sqrt(1 ** 2 + 1 ** 2 + 1 ** 2); // = Si_m / sqrt(3)
    const mono_offset_deg: number = 12.787;
  
    // Convert input angle to radians after subtracting offset
    const theta_rad: number = ((mono_deg_input - mono_offset_deg) * Math.PI) / 180;
  
    // Energy in eV using Bragg's law
    const energy_eV: number = (h_m2kgps * c_mps * e_eV) / (2 * a_Si111_m * Math.sin(theta_rad));
  
    return energy_eV;
  }
  
  // Example usage
  const currentMonoAngle: number = 15.0; // replace with actual angle reading
  const energy: number = computeEnergyFromMonoAngle(currentMonoAngle);
  console.log(`Energy: ${energy.toFixed(1)} eV`);
  