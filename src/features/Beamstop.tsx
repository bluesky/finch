import { useState, useMemo, useEffect } from "react";

import SignalMonitorPlot from "@/components/SignalMonitorPlot";
import DeviceControllerBox from "@/components/DeviceControllerBox";
import useOphydSocket from "@/hooks/useOphydSocket";
import Button from "@/components/Button";
import BeamEnergy from "@/components/BeamEnergy";

import { deviceIcons } from "@/assets/icons";

export type BeamstopProps = {
    beamstopXName: string,
    beamstopYName: string,
    beamstopCurrentName: string,
    beamstopXIcon?: JSX.Element,
    beamstopYIcon?: JSX.Element,
    beamstopXTitle?: string,
    beamstopYTitle?: string,
    enableBestOption?: boolean,
    stackVertical?: boolean
}

export default function Beamstop(
    {
        beamstopXName,
        beamstopYName,
        beamstopCurrentName,
        beamstopXIcon=deviceIcons.beamstopX,
        beamstopYIcon=deviceIcons.beamstopY,
        beamstopXTitle,
        beamstopYTitle,
        enableBestOption,
        stackVertical=true
    }: BeamstopProps
) {
    const beamstopXNameRBV = useMemo(()=>beamstopXName + '.RBV', [beamstopXName]);
    const beamstopYNameRBV = useMemo(()=> beamstopYName + '.RBV', [beamstopYName]);
    const deviceNameList = useMemo(()=>[beamstopXName, beamstopYName, beamstopXNameRBV, beamstopYNameRBV, beamstopCurrentName], [beamstopXName, beamstopYName, beamstopXNameRBV, beamstopYNameRBV, beamstopCurrentName]);
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } = useOphydSocket(deviceNameList);
    const [ bestCurrent, setBestCurrent ] = useState<number | null>(null);
    const [bestXValue, setBestXValue] = useState<number | null>(null);
    const [bestYValue, setBestYValue] = useState<number | null>(null);

    const goToBest = () => {
        if (bestXValue !== null) {
            handleSetValueRequest(beamstopXName, bestXValue);
        }
        if (bestYValue !== null) {
            handleSetValueRequest(beamstopYName, bestYValue);
        }
    }

    useEffect(()=>{
        const currentDevice = devices[beamstopCurrentName];
        const xDevice = devices[beamstopXName];
        const yDevice = devices[beamstopYName];
        // The signal at 531 is a negative number, so default to doing absolute value comparisons
        if (currentDevice && currentDevice.value !== null && typeof currentDevice.value === "number") {
            if (bestCurrent === null || Math.abs(currentDevice.value) > Math.abs(bestCurrent)) {
                setBestCurrent(currentDevice.value);
                if (xDevice && xDevice.value !== null && typeof xDevice.value === "number") {
                    setBestXValue(xDevice.value);
                }
                if (yDevice && yDevice.value !== null && typeof yDevice.value === "number") {
                    setBestYValue(yDevice.value);
                }
            }
        }
    }, [devices]);
    return (
        <section className={`w-full h-full ${stackVertical ? 'flex-col' : 'max-w-[1200px]'} flex max-h-[800px] relative`}>
            <article className={`${stackVertical ? 'w-full h-1/2' : 'w-1/2 h-full'}  bg-white flex flex-col p-8`}>
                <h3 className="text-4xl text-center">Beamstop Current: {devices[beamstopCurrentName] && devices[beamstopCurrentName].value} {devices[beamstopCurrentName] && devices[beamstopCurrentName].units?.slice(0,3)}</h3>
                <SignalMonitorPlot pv={beamstopCurrentName} className={stackVertical ? 'h-full' : 'h-1/2'} numVisiblePoints={200} tickTextIntervalSeconds={30}/>
                { enableBestOption && 
                    <>
                        <p>Best Beamstop Current Value: {bestCurrent ? bestCurrent.toPrecision(5) : 'N/A'} {devices[beamstopCurrentName] && devices[beamstopCurrentName].units}</p>
                        <p>Best Beamstop X value: {bestXValue ? bestXValue.toPrecision(4): 'N/A'} {devices[beamstopXName] && devices[beamstopXName].units}</p>
                        <p>Best Beamstop Y value: {bestYValue ? bestYValue.toPrecision(4) : 'N/A'} {devices[beamstopYName] && devices[beamstopYName].units}</p>
                        <div className="flex justify-center items-center py-8">
                            <Button cb={goToBest} text="Go To Best"/>   
                        </div>
                    </>
                }
            </article>
            <article className={`${stackVertical ? 'w-full pt-4 max-h-1/2 flex flex-row justify-center gap-8' : 'w-1/2 h-full flex flex-col items-center justify-between'} `}>
                <DeviceControllerBox title={beamstopXTitle} svgIcon={beamstopXIcon} device={devices[beamstopXName]} deviceRBV={devices[beamstopXNameRBV]} handleLockClick={toggleDeviceLock} handleSetValueRequest={handleSetValueRequest}/>
                <DeviceControllerBox title={beamstopYTitle} svgIcon={beamstopYIcon} device={devices[beamstopYName]} deviceRBV={devices[beamstopYNameRBV]} handleLockClick={toggleDeviceLock} handleSetValueRequest={handleSetValueRequest}/>
            </article>
        </section>
    )
}