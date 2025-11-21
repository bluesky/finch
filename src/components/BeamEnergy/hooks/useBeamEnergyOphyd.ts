import { useMemo, useState } from "react";

import useOphydDeviceSocket from "@/hooks/useOphydDeviceSocket"


type UseBeamEnergyOphydProps = {
    deviceName?: string;
    wsUrl?: string;
}
/**
 * Custom hook for managing beam energy calculation based on monochromator angle.
 * Utilizes ophyd socket for device communication and retrieves monochromator angle PV.
 * 
 * @param props - Configuration options for the beam energy hook
 * @param props.pv - PV name for the monochromator angle (default: 'bl531_xps1:mono_angle_deg')
 * @param props.thetaOffsetDeg - Angle offset in degrees to account for mechanical offsets (default: 12.787)
 * @param props.wsUrl - Optional WebSocket URL for device communication
 * @returns Object containing beam energy value and related device data
 */
export default function useBeamEnergyOphyd({deviceName="mono", wsUrl}:UseBeamEnergyOphydProps) {

    const [ showController, setShowController ] = useState(true);
    const [ showPlot, setShowPlot ] = useState(false);
    const [ showAbout, setShowAbout ] = useState(false);
    const [ isLocked, setIsLocked ] = useState(false);

    const deviceList = useMemo(() => [deviceName], [deviceName]);
    const { devices, handleSetValueRequest } = useOphydDeviceSocket(deviceList, wsUrl);
    const device = devices[deviceName];
    const currentValueEV = device ? (device.value !== "" ? device.value as number : NaN) : NaN;

    const handleAbsoluteMove = (targetEnergy: number) => {
        handleSetValueRequest(deviceName, targetEnergy);
    };

    const handleRelativeMove = (deltaEnergy: number) => {
        if (!isNaN(currentValueEV)) {
            const targetEnergy = currentValueEV + deltaEnergy;
            handleSetValueRequest(deviceName, targetEnergy);
        } else {
            console.log('Cannot perform relative move: current value is NaN');
        }
    };

    const handleStop = () => {
        //There is no true 'stop' PV for the monochromator at 531
        //we will attempt to stop by setting the current RBV as the target
        console.log('Stopping monochromator move, setting target to current readback value');
        if (!isNaN(currentValueEV)) {
            handleSetValueRequest(deviceName, currentValueEV);
        } else {
            console.log('Cannot stop monochromator move: current value is NaN');
        }
    }


    const handleToggleController = () => {
        setShowController((prev) => !prev);
    };

    const handleTogglePlot = () => {
        setShowPlot((prev) => !prev);
    };

    const handleToggleAbout = () => {
        setShowAbout((prev) => !prev);
    };

    const handleToggleLock = () => {
        setIsLocked((prev) => !prev);
    };

    return {
        currentValueEV,
        device,
        handleAbsoluteMove,
        handleRelativeMove,
        handleStop,
        showController,
        showPlot,
        showAbout,
        handleToggleController,
        handleTogglePlot,
        handleToggleAbout,
        isLocked,
        handleToggleLock,
    }
}