import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

import useOphydSocket from '@/api/ophyd/useOphydSocket';

import { HexapodMovePositionForm, HexapodRBVs } from '../types/hexapodTypes';

import { generateHexapodPVs, generateHexapodPVList } from '../utils/hexapodUtils';
import { Device } from '@/types/deviceControllerTypes';

// ── Demo mode constants ────────────────────────────────────────────────────────

const DEMO_UPDATE_INTERVAL_MS = 200; // 5 updates per second
const DEMO_MM_PER_MS = 1 / 1000; // 1 mm/s
const DEMO_MIN_MM = -10;
const DEMO_MAX_MM = 10;

type AxisKey = 'tx' | 'ty' | 'tz' | 'rx' | 'ry' | 'rz';
const AXES: AxisKey[] = ['tx', 'ty', 'tz', 'rx', 'ry', 'rz'];
type SimPos = Record<AxisKey, number>;
type AxisMoveParams = {
    startPos: number;
    targetPos: number;
    startTime: number;
    durationMs: number;
};
const ZERO_POS: SimPos = { tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0 };

const makeDemoDevice = (axis: string, value: number): Device => ({
    pv: `demo:${axis}`,
    name: `demo:${axis}`,
    value,
    timestamp: Date.now() / 1000,
    connected: true,
    read_access: true,
    write_access: true,
    locked: false,
    expanded: false,
    units: 'mm',
    min: DEMO_MIN_MM,
    max: DEMO_MAX_MM,
});

// ── Hook ───────────────────────────────────────────────────────────────────────

interface UseHexapodProps {
    wsUrl?: string;
    prefix?: string;
    /** When true, skips the WebSocket connection and simulates a connected hexapod at all-zero positions. */
    demo?: boolean;
}

/**
 * Custom hook for managing hexapod device control and state.
 * Provides UI state management, device communication, and movement control functions.
 *
 * @param props - Configuration options for the hexapod hook
 * @param props.wsUrl - Optional WebSocket URL for device communication
 * @param props.prefix - Optional device prefix for PV names (e.g., 'hexapod1:')
 * @param props.demo - When true, simulates a connected hexapod held at all-zero positions,
 *   moving only on explicit commands at 1 mm/s with 5 updates/second.
 * @returns Object containing hexapod state, control functions, and device data
 */
export default function useHexapod(props: UseHexapodProps = {}) {
    const { wsUrl, prefix, demo = false } = props;
    const [showController, setShowController] = useState(true);
    const [showPlot, setShowPlot] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // ── Demo state ─────────────────────────────────────────────────────────────
    const [simPos, setSimPosState] = useState<SimPos>(ZERO_POS);
    const simPosRef = useRef<SimPos>(ZERO_POS);
    const setSimPos = (pos: SimPos) => {
        simPosRef.current = pos;
        setSimPosState(pos);
    };

    const activeMovesRef = useRef<Partial<Record<AxisKey, AxisMoveParams>>>({});
    const moveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(
        () => () => {
            if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
        },
        [],
    );

    // ── UI toggles ─────────────────────────────────────────────────────────────

    const onClickLock = useCallback(() => {
        setIsLocked((prev) => !prev);
    }, []);

    const onClickController = () => {
        if (showAbout) {
            setShowAbout(false);
            setShowPlot(false);
            setShowController(true);
            return;
        }
        if (!showAbout && !showPlot && showController) {
            return;
        }
        if (showPlot && !showController) {
            setShowPlot(false);
            setShowController(true);
            return;
        }
        setShowController((prev) => !prev);
    };

    const onClickPlot = () => {
        if (showAbout) {
            setShowPlot(true);
            setShowAbout(false);
            setShowController(false);
            return;
        }
        if (showController && !showPlot) {
            setShowController(false);
            setShowPlot(true);
            return;
        }
        setShowPlot((prev) => !prev);
    };
    const onClickAbout = useCallback(() => setShowAbout((prev) => !prev), []);

    // ── Real-device wiring ─────────────────────────────────────────────────────

    const deviceNameList = useMemo(
        () => (demo ? [] : generateHexapodPVList(prefix || '')),
        [prefix, demo],
    );
    const hexapodPVs = useMemo(() => generateHexapodPVs(prefix || ''), [prefix]);
    const { devices, handleSetValueRequest, toggleDeviceLock } = useOphydSocket(
        deviceNameList,
        wsUrl,
    );

    const hexapod = useMemo(
        () => ({
            readTx: devices[hexapodPVs.readTx],
            readTy: devices[hexapodPVs.readTy],
            readTz: devices[hexapodPVs.readTz],
            readRx: devices[hexapodPVs.readRx],
            readRy: devices[hexapodPVs.readRy],
            readRz: devices[hexapodPVs.readRz],
            setTx: devices[hexapodPVs.setTx],
            setTy: devices[hexapodPVs.setTy],
            setTz: devices[hexapodPVs.setTz],
            setRx: devices[hexapodPVs.setRx],
            setRy: devices[hexapodPVs.setRy],
            setRz: devices[hexapodPVs.setRz],
            executeAll: devices[hexapodPVs.executeAll],
            inPosition: devices[hexapodPVs.inPosition],
            stop: devices[hexapodPVs.stop],
            moveType: devices[hexapodPVs.moveType],
        }),
        [devices, hexapodPVs],
    );

    const hexapodSetpoints = useMemo(
        () => ({
            tx: devices[hexapodPVs.setTx],
            ty: devices[hexapodPVs.setTy],
            tz: devices[hexapodPVs.setTz],
            rx: devices[hexapodPVs.setRx],
            ry: devices[hexapodPVs.setRy],
            rz: devices[hexapodPVs.setRz],
        }),
        [devices, hexapodPVs],
    );

    const realHexapodRBVs: HexapodRBVs = useMemo(
        () => ({
            tx: devices[hexapodPVs.readTx],
            ty: devices[hexapodPVs.readTy],
            tz: devices[hexapodPVs.readTz],
            rx: devices[hexapodPVs.readRx],
            ry: devices[hexapodPVs.readRy],
            rz: devices[hexapodPVs.readRz],
        }),
        [devices, hexapodPVs],
    );

    // ── Demo RBVs ──────────────────────────────────────────────────────────────

    const demoHexapodRBVs: HexapodRBVs = useMemo(
        () => ({
            tx: makeDemoDevice('tx', simPos.tx),
            ty: makeDemoDevice('ty', simPos.ty),
            tz: makeDemoDevice('tz', simPos.tz),
            rx: makeDemoDevice('rx', simPos.rx),
            ry: makeDemoDevice('ry', simPos.ry),
            rz: makeDemoDevice('rz', simPos.rz),
        }),
        [simPos],
    );

    const hexapodRBVs = demo ? demoHexapodRBVs : realHexapodRBVs;

    // ── Move handlers ──────────────────────────────────────────────────────────

    const handleStartClick = useCallback(
        (movePositionForm: HexapodMovePositionForm, isRelative: boolean) => {
            if (demo) {
                const now = Date.now();
                const newMoves: Partial<Record<AxisKey, AxisMoveParams>> = {};

                AXES.forEach((axis) => {
                    const startPos = simPosRef.current[axis];
                    const formVal = movePositionForm[axis as keyof HexapodMovePositionForm];
                    let target: number;
                    if (formVal === undefined) {
                        target = isRelative ? startPos : startPos; // no change
                    } else {
                        target = isRelative ? startPos + Number(formVal) : Number(formVal);
                    }
                    target = Math.max(DEMO_MIN_MM, Math.min(DEMO_MAX_MM, target));
                    const durationMs = Math.abs(target - startPos) / DEMO_MM_PER_MS;
                    if (durationMs > 0) {
                        newMoves[axis] = {
                            startPos,
                            targetPos: target,
                            startTime: now,
                            durationMs,
                        };
                    }
                });

                activeMovesRef.current = newMoves;

                if (Object.keys(newMoves).length > 0) {
                    if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
                    moveIntervalRef.current = setInterval(() => {
                        const now = Date.now();
                        const newPos = { ...simPosRef.current };
                        let anyActive = false;
                        AXES.forEach((axis) => {
                            const move = activeMovesRef.current[axis];
                            if (!move) return;
                            const progress = Math.min(
                                (now - move.startTime) / move.durationMs,
                                1.0,
                            );
                            newPos[axis] =
                                move.startPos + progress * (move.targetPos - move.startPos);
                            if (progress < 1.0) {
                                anyActive = true;
                            } else {
                                delete activeMovesRef.current[axis];
                            }
                        });
                        setSimPos(newPos);
                        if (!anyActive) {
                            clearInterval(moveIntervalRef.current!);
                            moveIntervalRef.current = null;
                        }
                    }, DEMO_UPDATE_INTERVAL_MS);
                }
                return;
            }

            console.log(
                'Hexapod Move Requested (true=relative, false=absolute):',
                movePositionForm,
                isRelative,
            );
            Object.keys(hexapodSetpoints).forEach((key) => {
                let formValue = movePositionForm[key as keyof HexapodMovePositionForm];
                if (formValue === undefined) {
                    if (isRelative) {
                        formValue = 0;
                    } else {
                        formValue = hexapodRBVs[key as keyof typeof hexapodRBVs].value as number;
                    }
                }
                handleSetValueRequest(
                    hexapodSetpoints[key as keyof typeof hexapodSetpoints].name,
                    formValue,
                );
            });
            const moveTypeValue = isRelative ? 1 : 0;
            handleSetValueRequest(hexapod.moveType.name, moveTypeValue);
            console.log('Executing hexapod move');
            handleSetValueRequest(hexapod.executeAll.name, 1);
        },
        [demo, hexapodSetpoints, hexapodRBVs, hexapod, handleSetValueRequest],
    );

    const handleStopClick = useCallback(() => {
        if (demo) {
            if (moveIntervalRef.current) {
                clearInterval(moveIntervalRef.current);
                moveIntervalRef.current = null;
            }
            activeMovesRef.current = {};
            return;
        }
        handleSetValueRequest(hexapod.stop.name, 1);
    }, [demo, hexapod, handleSetValueRequest]);

    return {
        showController,
        showPlot,
        showAbout,
        isLocked,
        onClickLock,
        onClickController,
        onClickPlot,
        onClickAbout,
        handleStartClick,
        hexapodPVs,
        hexapod,
        handleStopClick,
        hexapodRBVs,
        toggleDeviceLock,
    };
}
