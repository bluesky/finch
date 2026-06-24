import { useEffect, useMemo, useRef, useState } from 'react';

import useOphydSocket from '@/api/ophyd/useOphydSocket';

import { computeEnergyFromMonoAngle } from '@/components/BeamEnergy/utils/computeEnergyFromMonoAngle';
import { computeMonoAngleFromEnergy } from '@/components/BeamEnergy/utils/computeMonoAngleFromEnergy';
import { Device } from '@/types/deviceControllerTypes';

const DEMO_DEFAULT_EV = 3000;
const DEMO_UPDATE_INTERVAL_MS = 200; // 5 updates per second
const DEMO_MS_PER_EV = 1; // 1 ms per eV → 1 s per 1000 eV

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
export default function useBeamEnergyPV(props: UseBeamEnergyPVProps = {}) {
    const {
        pv = 'bl531_xps1:mono_angle_deg',
        thetaOffsetDeg = 12.787,
        wsUrl,
        demo = false,
    } = props;

    const [showController, setShowController] = useState(true);
    const [showPlot, setShowPlot] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // Demo-mode simulated angle: starts at 3000 eV, only changes on move commands.
    // A ref shadows the state so the move interval always reads the latest value without stale closures.
    const initialAngle = computeMonoAngleFromEnergy(DEMO_DEFAULT_EV, thetaOffsetDeg);
    const [simAngleDeg, setSimAngleDegState] = useState(initialAngle);
    const simAngleRef = useRef(initialAngle);
    const setSimAngleDeg = (angle: number) => {
        simAngleRef.current = angle;
        setSimAngleDegState(angle);
    };

    // Active demo move interval — stored in a ref so handlers can cancel it without stale closures.
    const moveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const moveParamsRef = useRef({ startAngle: 0, targetAngle: 0, startTime: 0, durationMs: 0 });

    // Clean up any running move on unmount.
    useEffect(
        () => () => {
            if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
        },
        [],
    );

    const startDemoMove = (targetAngleDeg: number) => {
        if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);

        const startAngle = simAngleRef.current;
        const startEV = computeEnergyFromMonoAngle(startAngle, thetaOffsetDeg);
        const targetEV = computeEnergyFromMonoAngle(targetAngleDeg, thetaOffsetDeg);
        const durationMs = Math.abs(targetEV - startEV) * DEMO_MS_PER_EV;

        if (durationMs <= 0) {
            setSimAngleDeg(targetAngleDeg);
            return;
        }

        moveParamsRef.current = {
            startAngle,
            targetAngle: targetAngleDeg,
            startTime: Date.now(),
            durationMs,
        };

        moveIntervalRef.current = setInterval(() => {
            const { startAngle, targetAngle, startTime, durationMs } = moveParamsRef.current;
            const progress = Math.min((Date.now() - startTime) / durationMs, 1.0);
            setSimAngleDeg(startAngle + progress * (targetAngle - startAngle));
            if (progress >= 1.0) {
                clearInterval(moveIntervalRef.current!);
                moveIntervalRef.current = null;
            }
        }, DEMO_UPDATE_INTERVAL_MS);
    };

    const pvReadback = useMemo(() => `${pv}.RBV`, [pv]);
    const deviceList = useMemo(() => (demo ? [] : [pv, pvReadback]), [pv, pvReadback, demo]);
    const { devices, handleSetValueRequest } = useOphydSocket(deviceList, wsUrl);

    // Only capture a new timestamp when the angle actually changes.
    const simTimestamp = useMemo(() => Date.now() / 1000, []);

    const device: Device | undefined = demo
        ? {
              pv,
              value: simAngleDeg,
              timestamp: simTimestamp,
              connected: true,
              read_access: true,
              write_access: true,
              name: pv,
              locked: false,
              expanded: false,
          }
        : devices[pvReadback];

    const currentValueDegrees = demo
        ? simAngleDeg
        : device
          ? device.value !== ''
              ? (device.value as number)
              : NaN
          : NaN;

    const currentValueEV = useMemo(() => {
        if (isNaN(currentValueDegrees)) {
            return NaN;
        } else {
            return computeEnergyFromMonoAngle(currentValueDegrees, thetaOffsetDeg);
        }
    }, [currentValueDegrees, thetaOffsetDeg]);

    const handleAbsoluteMove = (targetEnergy: number) => {
        const targetDegrees = computeMonoAngleFromEnergy(targetEnergy, thetaOffsetDeg);
        if (demo) {
            startDemoMove(targetDegrees);
        } else {
            handleSetValueRequest(pv, targetDegrees);
        }
    };

    const handleRelativeMove = (deltaEnergy: number) => {
        if (demo) {
            const currentEV = computeEnergyFromMonoAngle(simAngleRef.current, thetaOffsetDeg);
            const targetEnergy = currentEV + deltaEnergy;
            const targetDegrees = computeMonoAngleFromEnergy(targetEnergy, thetaOffsetDeg);
            startDemoMove(targetDegrees);
        } else if (!isNaN(currentValueDegrees) && !isNaN(currentValueEV)) {
            const targetEnergy = currentValueEV + deltaEnergy;
            const targetDegrees = computeMonoAngleFromEnergy(targetEnergy, thetaOffsetDeg);
            handleSetValueRequest(pv, targetDegrees);
        } else {
            console.log('Cannot perform relative move: current value is NaN');
        }
    };

    const handleStop = () => {
        //There is no true 'stop' PV for the monochromator at 531
        //we will attempt to stop by setting the current RBV as the target
        console.log('Stopping monochromator move, setting target to current readback value');
        if (demo) {
            if (moveIntervalRef.current) {
                clearInterval(moveIntervalRef.current);
                moveIntervalRef.current = null;
            }
        } else if (!isNaN(currentValueDegrees)) {
            handleSetValueRequest(pv, currentValueDegrees);
        } else {
            console.log('Cannot stop monochromator move: current value is NaN');
        }
    };

    const handleToggleController = () => {
        if (showAbout && showController) {
            setShowAbout(false);
            return;
        }
        if (showPlot && !showController) {
            setShowPlot(false);
            setShowController(true);
            return;
        }
        setShowController((prev) => !prev);
    };

    const handleTogglePlot = () => {
        if (showAbout && showPlot) {
            setShowAbout(false);
            return;
        }
        if (showController && !showPlot) {
            setShowController(false);
        }
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
    };
}
