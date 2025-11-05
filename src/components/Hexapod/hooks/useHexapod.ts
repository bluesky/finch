import { useState, useMemo, useCallback } from "react";

import useOphydSocket from "@/hooks/useOphydSocket";

import { HexapodMovePositionForm, HexapodRBVs } from "../types/hexapodTypes";

import { generateHexapodPVs, generateHexapodPVList } from "../utils/hexapodUtils";

interface UseHexapodProps {
    wsUrl?: string;
    prefix?: string;
}

/**
 * Custom hook for managing hexapod device control and state.
 * Provides UI state management, device communication, and movement control functions.
 * 
 * @param props - Configuration options for the hexapod hook
 * @param props.wsUrl - Optional WebSocket URL for device communication
 * @param props.prefix - Optional device prefix for PV names (e.g., 'hexapod1:')
 * @returns Object containing hexapod state, control functions, and device data
 */
export default function useHexapod(props: UseHexapodProps = {}) {
    const { wsUrl, prefix } = props;
    const [showController, setShowController] = useState(true);
    const [showPlot, setShowPlot] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    /**
     * Toggles the lock state for the hexapod controller UI
     */
    const onClickLock = useCallback(() => {
        setIsLocked((prev) => !prev);
    }, []);

    /**
     * Toggles the visibility of the hexapod controller panel
     */
    const onClickController = useCallback(() => {
        setShowController((prev) => !prev);
    }, []);

    /**
     * Toggles the visibility of the hexapod plot/visualization panel
     */
    const onClickPlot = useCallback(() => {
        setShowPlot((prev) => !prev);
    }, []);

    /**
     * Toggles the visibility of the hexapod about/information panel
     */
    const onClickAbout = useCallback(() => {
        setShowAbout((prev) => !prev);
    }, []);
    
    const deviceNameList = useMemo(() => generateHexapodPVList(prefix || ''), [prefix]);
    const hexapodPVs = useMemo(() => generateHexapodPVs(prefix || ''), [prefix]);
    const { devices, handleSetValueRequest, toggleDeviceLock } = useOphydSocket(deviceNameList, wsUrl);
    console.log({devices})
    
    //single device object with all pvs
    const hexapod = useMemo(() => {
        return {
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
        };
    }, [devices, prefix]);


    //single device object with only setpoint pvs
    const hexapodSetpoints = useMemo(() => {
        return {
            tx: devices[hexapodPVs.setTx],
            ty: devices[hexapodPVs.setTy],
            tz: devices[hexapodPVs.setTz],
            rx: devices[hexapodPVs.setRx],
            ry: devices[hexapodPVs.setRy],
            rz: devices[hexapodPVs.setRz]
        };
    }, [devices, prefix]);

    //single device object with only live position read values
    const hexapodRBVs: HexapodRBVs = useMemo(() => {
        return {
            tx: devices[hexapodPVs.readTx],
            ty: devices[hexapodPVs.readTy],
            tz: devices[hexapodPVs.readTz],
            rx: devices[hexapodPVs.readRx],
            ry: devices[hexapodPVs.readRy],
            rz: devices[hexapodPVs.readRz]
        };
    }, [devices, prefix]);



    /**
     * Initiates a hexapod movement with the specified position parameters.
     * Sets all axis setpoints, configures move type (absolute/relative), and executes the move.
     * 
     * @param movePositionForm - Object containing position values for each axis (tx, ty, tz, rx, ry, rz)
     * @param isRelative - If true, performs relative move; if false, performs absolute move
     */
    const handleStartClick = useCallback((movePositionForm: HexapodMovePositionForm, isRelative: boolean) => {
        console.log("Hexapod Move Requested:", movePositionForm, isRelative);
        (Object.keys(hexapodSetpoints)).forEach((key) => {
            //must set all move points at once since more than one hexapod controller could exist (multiple browser instances)
            let formValue = movePositionForm[key as keyof HexapodMovePositionForm];
            if (formValue === undefined) {
                if (isRelative) {
                    //set to 0 for relative moves when undefined
                    formValue = 0;
                } else {
                    //set to current position for absolute moves when undefined
                    formValue = hexapodRBVs[key as keyof typeof hexapodRBVs].value as number;
                }
            }
            console.log(`Setting hexapod ${key} to value:`, formValue);
            handleSetValueRequest(hexapodSetpoints[key as keyof typeof hexapodSetpoints].name, formValue);
        })

        //now call the MoveType PV
        const moveTypeValue = isRelative ? 1 : 0;
        console.log("Setting move type to:", moveTypeValue);
        handleSetValueRequest(hexapod.moveType.name, moveTypeValue);

        //now attempt to execute the move
        console.log("Executing hexapod move");
        handleSetValueRequest(hexapod.executeAll.name, 1);
    }, [hexapodSetpoints, hexapodRBVs, hexapod, handleSetValueRequest]);

    /**
     * Immediately stops any hexapod movement in progress
     */
    const handleStopClick = useCallback(() => {
        handleSetValueRequest(hexapod.stop.name, 1);
    }, [hexapod, handleSetValueRequest]);



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
        hexapodRBVs
    };
}