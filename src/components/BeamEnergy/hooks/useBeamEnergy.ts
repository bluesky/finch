import { useMemo, useState } from "react";

import useOphydSocket from "@/hooks/useOphydSocket"

import { computeEnergyFromMonoAngle } from "@/components/BeamEnergy/utils/computeEnergyFromMonoAngle";
import { computeMonoAngleFromEnergy } from "@/components/BeamEnergy/utils/computeMonoAngleFromEnergy";

type UseBeamEnergyProps = {
    pv?: string;
    thetaOffsetDeg?: number;
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
export default function useBeamEnergy(props: UseBeamEnergyProps = {}) {
    const { pv = "bl531_xps1:mono_angle_deg", thetaOffsetDeg = 12.787, wsUrl } = props;

    const [ showController, setShowController ] = useState(true);
    const [ showPlot, setShowPlot ] = useState(false);
    const [ showAbout, setShowAbout ] = useState(false);
    const [ isLocked, setIsLocked ] = useState(false);

    const pvReadback = useMemo(() => `${pv}.RBV`, [pv]);
    const deviceList = useMemo(() => [pv, pvReadback], [pv, pvReadback]);
    const { devices, handleSetValueRequest } = useOphydSocket(deviceList, wsUrl);
    const device = devices[pvReadback];
    const currentValueDegrees = device ? (device.value !== "" ? device.value as number : NaN) : NaN;
    const currentValueEV = useMemo(() => {
        if (isNaN(currentValueDegrees)) {
            return NaN;
        } else {
            return computeEnergyFromMonoAngle(currentValueDegrees, thetaOffsetDeg);
        }
    }, [currentValueDegrees, thetaOffsetDeg]);

    const handleAbsoluteMove = (targetEnergy: number) => {
        const targetDegrees = computeMonoAngleFromEnergy(targetEnergy, thetaOffsetDeg);
        console.log(`Absolute move request: ${targetDegrees} degrees from ${targetEnergy} eV`);
        handleSetValueRequest(pv, targetDegrees);
    };

    const handleRelativeMove = (deltaEnergy: number) => {
        if (!isNaN(currentValueDegrees) && !isNaN(currentValueEV)) {
            const targetEnergy = currentValueEV + deltaEnergy;
            const targetDegrees = computeMonoAngleFromEnergy(targetEnergy, thetaOffsetDeg);
            console.log(`Relative move request: ${targetDegrees} degrees from delta ${deltaEnergy} eV equals target ${targetEnergy} eV`);
            handleSetValueRequest(pv, targetDegrees);
        } else {
            console.log('Cannot perform relative move: current value is NaN');
        }
    };

    const handleStop = () => {
        //There is no true 'stop' PV for the monochromator at 531
        //we will attempt to stop by setting the current RBV as the target
        console.log('Stopping monochromator move, setting target to current readback value');
        if (!isNaN(currentValueDegrees)) {
            handleSetValueRequest(pv, currentValueDegrees);
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
        currentValueDegrees,
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