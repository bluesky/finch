import useOphydPVSocket from "@/hooks/useOphydPVSocket";
import HistogramDeviceController from "./HistogramDeviceController";
import HistogramPlot from "./HistogramPlot";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEMO_SIZE = 2048;

function generateDemoBase(): number[] {
    return Array.from({ length: DEMO_SIZE }, (_, i) => {
        const peak1 = 5000 * Math.exp(-0.5 * ((i - 512) / 60) ** 2);
        const peak2 = 2500 * Math.exp(-0.5 * ((i - 1200) / 90) ** 2);
        const noise = Math.random() * 30;
        return Math.max(0, peak1 + peak2 + noise);
    });
}

type HistogramProps = {
    /** EPICS PV name for the histogram array data. */
    arrayPV: string;
    /** EPICS PV name for the acquire control (1 = start, 0 = stop). */
    acquirePV: string;
    /** When `true`, renders the `HistogramDeviceController` below the plot. */
    showDeviceController?: boolean;
    /** When `true`, renders plot settings controls inside `HistogramPlot`. */
    showPlotSettings?: boolean;
    /** Additional class names applied to the `HistogramPlot` element. */
    classNameHistogramPlot?: string;
    /** Additional class names applied to the outer container element. */
    classNameContainer?: string;
    /** Additional class names applied to the `HistogramDeviceController` element. */
    classNameDeviceController?: string;
    /** Additional class names applied to the plot settings element inside `HistogramPlot`. */
    classNamePlotSettings?: string;
    /** When `true`, ignores PV props and simulates histogram data that updates every second. */
    demo?: boolean;
}
export default function Histogram({ arrayPV, acquirePV, showDeviceController, showPlotSettings, classNameContainer, classNameDeviceController, classNameHistogramPlot, classNamePlotSettings, demo }: HistogramProps) {
    const deviceList = useMemo(() => (demo ? [] : [arrayPV, acquirePV]), [demo, arrayPV, acquirePV]);
    const { devices, handleSetValueRequest } = useOphydPVSocket(deviceList);

    const baseRef = useRef<number[]>(generateDemoBase());
    const [demoData, setDemoData] = useState<number[]>(() => baseRef.current);

    useEffect(() => {
        if (!demo) return;
        const id = setInterval(() => {
            setDemoData(baseRef.current.map(v => Math.max(0, v + (Math.random() - 0.5) * v * 0.05)));
        }, 1000);
        return () => clearInterval(id);
    }, [demo]);

    const arrayData = useMemo(() => {
        if (demo) return demoData;
        const value = devices[arrayPV]?.value;
        if (!Array.isArray(value)) {
            return null;
        }
        return value.filter((item): item is number => typeof item === 'number' && Number.isFinite(item));
    }, [demo, demoData, arrayPV, devices]);

    const handleStartAcquisition = useCallback(() => {
        //assumed common true/false enum PV where 1 = true, 0 =false
        handleSetValueRequest(acquirePV, 1);
    }, [acquirePV, handleSetValueRequest]);
    const handleStopAcquisition = useCallback(() => {
        handleSetValueRequest(acquirePV, 0);
    }, [acquirePV, handleSetValueRequest]);

    return (
        <section className={cn("flex flex-col items-center justify-start gap-4 bg-white min-w-fit h-fit overflow-x-auto overflow-y-hidden", classNameContainer)}>
            <HistogramPlot showPlotSettings={showPlotSettings} className={classNameHistogramPlot} classNameSettings={classNamePlotSettings} arrayData={arrayData} />
            {showDeviceController && <HistogramDeviceController acquireDevice={devices[acquirePV]} handleStartAcquisition={handleStartAcquisition} handleStopAcquisition={handleStopAcquisition} className={classNameDeviceController} />}
        </section>
    )
}