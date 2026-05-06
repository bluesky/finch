import { Device } from '../../../types/deviceControllerTypes';
type UseBeamEnergyPVProps = {
    pv?: string;
    thetaOffsetDeg?: number;
    wsUrl?: string;
    /** When true, skips the WebSocket connection and holds the angle at the 3000 eV position until a move command is issued. */
    demo?: boolean;
};
/**
 * Custom hook for managing beam energy calculation based on monochromator angle.
 * Utilizes ophyd socket for device communication and retrieves monochromator angle PV.
 *
 * @param props - Configuration options for the beam energy hook
 * @param props.pv - PV name for the monochromator angle (default: 'bl531_xps1:mono_angle_deg')
 * @param props.thetaOffsetDeg - Angle offset in degrees to account for mechanical offsets (default: 12.787)
 * @param props.wsUrl - Optional WebSocket URL for device communication
 * @param props.demo - When true, simulates a connected monochromator held at 3000 eV, moving only on explicit commands
 * @returns Object containing beam energy value and related device data
 */
export default function useBeamEnergyPV(props?: UseBeamEnergyPVProps): {
    currentValueDegrees: number;
    currentValueEV: number;
    device: Device;
    handleAbsoluteMove: (targetEnergy: number) => void;
    handleRelativeMove: (deltaEnergy: number) => void;
    handleStop: () => void;
    showController: boolean;
    showPlot: boolean;
    showAbout: boolean;
    handleToggleController: () => void;
    handleTogglePlot: () => void;
    handleToggleAbout: () => void;
    isLocked: boolean;
    handleToggleLock: () => void;
};
export {};
//# sourceMappingURL=useBeamEnergyPV.d.ts.map