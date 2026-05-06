export type UseBeamEnergyOphydProps = {
    deviceName?: string;
    wsUrl?: string;
};
/**
 * Custom hook for managing beam energy calculation based on monochromator angle.
 * Utilizes ophyd socket for device communication and retrieves monochromator angle PV.
 *
 * @param props - Configuration options for the beam energy hook
 * @param props.deviceName - Name of the ophyd device (default: "mono")
 * @param props.wsUrl - Optional WebSocket URL for device communication
 * @returns Object containing beam energy value and related device data
 */
export default function useBeamEnergyOphyd({ deviceName, wsUrl }: UseBeamEnergyOphydProps): {
    currentValueEV: number;
    device: import('../../../types/deviceControllerTypes').OphydDevice;
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
//# sourceMappingURL=useBeamEnergyOphyd.d.ts.map