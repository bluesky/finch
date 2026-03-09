import useOphydPVSocket from "@/hooks/useOphydPVSocket";
import HistogramDeviceController from "./HistogramDeviceController";
import HistogramPlot from "./HistogramPlot";

import { cn } from "@/lib/utils";
import { useCallback, useMemo } from "react";

type HistogramProps = {
    arrayPV: string;
    acquirePV: string;
    showDeviceController?: boolean;
    showPlotSettings?: boolean;
    classNameHistogramPlot?: string;
    classNameContainer?: string;
    classNameDeviceController?: string;
    classNamePlotSettings?: string;
}
export default function Histogram({ arrayPV, acquirePV, showDeviceController, showPlotSettings, classNameContainer, classNameDeviceController, classNameHistogramPlot, classNamePlotSettings }: HistogramProps) {
    const deviceList = useMemo(() => [arrayPV, acquirePV], [arrayPV, acquirePV]);
    const { devices, handleSetValueRequest } = useOphydPVSocket(deviceList);
    const arrayData = useMemo(() => {
        const value = devices[arrayPV]?.value;
        if (!Array.isArray(value)) {
            return null;
        }
        return value.filter((item): item is number => typeof item === 'number' && Number.isFinite(item));
    }, [arrayPV, devices]);

    const handleStartAcquisition = useCallback(() => {
        //assumed common true/false enum PV where 1 = true, 0 =false
        handleSetValueRequest(acquirePV, 1);
    }, [acquirePV, handleSetValueRequest]);
    const handleStopAcquisition = useCallback(() => {
        handleSetValueRequest(acquirePV, 0);
    }, [acquirePV, handleSetValueRequest]);

    return (
        <section className={cn("flex flex-col items-center justify-start gap-4 bg-white", classNameContainer)}>
            <HistogramPlot showPlotSettings={showPlotSettings} className={classNameHistogramPlot} classNameSettings={classNamePlotSettings} arrayData={arrayData} />
            {showDeviceController && <HistogramDeviceController acquireDevice={devices[acquirePV]} handleStartAcquisition={handleStartAcquisition} handleStopAcquisition={handleStopAcquisition} className={classNameDeviceController} />}
        </section>
    )
}