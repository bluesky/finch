import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import HistogramDeviceController from './HistogramDeviceController';
import HistogramPlot from './HistogramPlot';

import { cn } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    /** EPICS PV name for the exposure setting (default value is in seconds) */
    exposurePV: string;
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
    /** Number of significant figures for sum displays in the plot. Defaults to `6`. */
    precision?: number;
    /** Title displayed at the top of the plot */
    title?: string;
};
export default function Histogram({
    arrayPV,
    acquirePV,
    exposurePV,
    showDeviceController,
    showPlotSettings,
    classNameContainer,
    classNameDeviceController,
    classNameHistogramPlot,
    classNamePlotSettings,
    demo,
    precision,
    title,
}: HistogramProps) {
    const deviceList = useMemo(
        () => (demo ? [] : [arrayPV, acquirePV, exposurePV]),
        [demo, arrayPV, acquirePV, exposurePV],
    );
    const { devices, handleSetValueRequest } = useOphydPVSocket(deviceList);
    const acquireDevice = devices[acquirePV];
    const exposureDevice = devices[exposurePV];

    // Demo mode will eventually be removed in lieu of Ophyd Sim
    const baseRef = useRef<number[]>(generateDemoBase());
    const [demoData, setDemoData] = useState<number[]>(() => baseRef.current);

    useEffect(() => {
        if (!demo) return;
        const id = setInterval(() => {
            setDemoData(
                baseRef.current.map((v) => Math.max(0, v + (Math.random() - 0.5) * v * 0.05)),
            );
        }, 1000);
        return () => clearInterval(id);
    }, [demo]);

    const arrayData = useMemo(() => {
        if (demo) return demoData;
        const value = devices[arrayPV]?.value;
        if (!Array.isArray(value)) {
            return null;
        }
        return value.filter(
            (item): item is number => typeof item === 'number' && Number.isFinite(item),
        );
    }, [demo, demoData, arrayPV, devices]);

    const handleStartAcquisition = useCallback(() => {
        //assumed common true/false enum PV where 1 = true, 0 =false
        handleSetValueRequest(acquirePV, 1);
    }, [acquirePV, handleSetValueRequest]);
    const handleStopAcquisition = useCallback(() => {
        handleSetValueRequest(acquirePV, 0);
    }, [acquirePV, handleSetValueRequest]);
    const handleSetExposure = useCallback(
        (newValue: number) => {
            handleSetValueRequest(exposurePV, newValue);
        },
        [exposurePV, handleSetValueRequest],
    );

    const allConnected = demo || deviceList.every((pv) => devices[pv]?.connected === true);

    if (!allConnected) {
        const disconnectedPVs = deviceList.filter((pv) => devices[pv]?.connected !== true);
        return (
            <section
                className={cn(
                    'flex flex-col items-center justify-center gap-2 p-4 bg-slate-200 text-slate-700 w-[70rem] h-96 rounded-lg shadow-lg',
                    classNameContainer,
                )}
            >
                <p className="font-semibold text-slate-600">
                    Error: Cannot display Histogram - Devices not connected
                </p>
                <ul className="text-sm text-slate-500 list-disc list-inside">
                    {disconnectedPVs.map((pv) => (
                        <li key={pv} className="font-mono">
                            {pv}
                        </li>
                    ))}
                </ul>
            </section>
        );
    }

    return (
        <section
            className={cn(
                'flex flex-col items-center justify-start gap-4 p-2 bg-slate-200 text-slate-700 min-w-fit h-fit overflow-x-auto overflow-y-hidden rounded-lg shadow-lg',
                classNameContainer,
            )}
        >
            <HistogramPlot
                title={title}
                showPlotSettings={showPlotSettings}
                className={classNameHistogramPlot}
                classNameSettings={classNamePlotSettings}
                arrayData={arrayData}
                precision={precision}
            />
            {showDeviceController && (
                <HistogramDeviceController
                    acquireDevice={acquireDevice}
                    exposureDevice={exposureDevice}
                    handleStartAcquisition={handleStartAcquisition}
                    handleStopAcquisition={handleStopAcquisition}
                    handleSetExposure={handleSetExposure}
                    className={classNameDeviceController}
                />
            )}
        </section>
    );
}
