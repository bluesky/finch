import { useState, useMemo, useCallback } from "react";

import useOphydSocket from "@/hooks/useOphydSocket";

import { HexapodMovePositionForm, HexapodRBVs } from "../types/hexapodTypes";

import { generateHexapodPVs, generateHexapodPVList } from "../utils/hexapodUtils";

interface UseHexapodProps {
    wsUrl?: string;
    prefix?: string;
}

export default function useHexapod(props: UseHexapodProps) {
    const { wsUrl, prefix } = props;
    const [showController, setShowController] = useState(true);
    const [showPlot, setShowPlot] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const onClickLock = useCallback(() => {
        setIsLocked((prev) => !prev);
    }, []);

    const onClickController = useCallback(() => {
        setShowController((prev) => !prev);
    }, []);

    const onClickPlot = useCallback(() => {
        setShowPlot((prev) => !prev);
    }, []);

    const onClickAbout = useCallback(() => {
        setShowAbout((prev) => !prev);
    }, []);
    
    const deviceNameList = useMemo(() => generateHexapodPVList(prefix || ''), [prefix]);
    const hexapodPVs = useMemo(() => generateHexapodPVs(prefix || ''), [prefix]);
    const { devices, handleSetValueRequest, toggleDeviceLock } = useOphydSocket(deviceNameList, wsUrl);
    //console.log({devices})
    
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



    //when a user clicks the "Start" button, write all setpoints and then trigger the executeAll PV
    //note that pre-validation of move positions is not possible here due to the immediate execution attempt
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