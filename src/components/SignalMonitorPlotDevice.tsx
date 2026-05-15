import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PlotlyScatter from './PlotlyScatter';
import { PlotlyScatterData } from '@/types/plotTypes';
import { Datum } from 'plotly.js';
import { blankScatterData } from '@/utils/plotGenerators';
import { cn } from '@/lib/utils';

type DeviceLike = {
    value: string | number | boolean;
    units?: string;
};

export type SignalMonitorPlotDeviceProps = {
    /** Pre-connected device object. When null/undefined the plot waits for data. */
    device: DeviceLike | null | undefined;
    /** Label shown on the x-axis (typically the PV or device name). */
    deviceLabel?: string;
    /** Additional CSS classes applied to the root container. */
    className?: string;
    /** Maximum number of data points shown at once before the oldest are dropped (strip chart window). Defaults to 30. */
    numVisiblePoints?: number;
    /** Interval in milliseconds between data samples. Defaults to 1000. */
    pollingIntervalMilliseconds?: number;
    /** When true, generates a sine wave instead of reading from the device — useful for layout previews. */
    demo?: boolean;
    /** Minimum number of seconds between x-axis tick labels. Defaults to 10. */
    tickTextIntervalSeconds?: number;
    /** CSS color string for the scatter trace markers and line. Defaults to '#082f49'. */
    color?: string;
    /** Y-axis label. When omitted, falls back to the device's reported units. */
    yAxisTitle?: string;
    /** Fixed [min, max] range for the y-axis. When omitted Plotly auto-scales. */
    yAxisRange?: [number, number];
    /** When true, renders markers on each data point with size scaled by recency. Defaults to false. */
    showMarkers?: boolean;
};

export default function SignalMonitorPlotDevice({
    device,
    deviceLabel,
    className,
    numVisiblePoints = 30,
    pollingIntervalMilliseconds = 1000,
    demo = false,
    tickTextIntervalSeconds = 10,
    color = '#082f49',
    yAxisTitle,
    yAxisRange,
    showMarkers = false,
    ...props
}: SignalMonitorPlotDeviceProps) {
    const styledData = {
        ...blankScatterData,
        mode: showMarkers ? ('lines+markers' as const) : ('lines' as const),
        marker: { ...blankScatterData.marker, color },
    };
    const [data, setData] = useState<PlotlyScatterData>(styledData);
    const [xLayout, setXLayout] = useState<{ tickvals: string[]; ticktext: string[] }>({
        tickvals: [],
        ticktext: [],
    });

    // Keep a ref to the latest device so the polling interval can read it
    // without being a dependency (which would cause the interval to reset on every device update)
    const deviceRef = useRef(device);
    deviceRef.current = device;

    const addSinglePoint = useCallback(() => {
        setData((prevData) => {
            const now = new Date();
            const newXValue = now.toLocaleTimeString('en-US', { hour12: false });
            const newYValue = Math.sin(now.getTime() / 1000) * 50 + 50;
            const newX: Datum[] = [...(prevData.x as Datum[]), newXValue];
            const newY: Datum[] = [...(prevData.y as Datum[]), newYValue];
            if (newX.length > numVisiblePoints) {
                newX.shift();
                newY.shift();
            }
            if (!showMarkers) return { ...prevData, x: newX, y: newY };
            const n = newX.length;
            const newMarkerSize = Array.from({ length: n }, (_, i) =>
                n === 1 ? 8 : Math.round(3 + (i / (n - 1)) * 5),
            );
            return {
                ...prevData,
                x: newX,
                y: newY,
                marker: { ...prevData.marker, size: newMarkerSize },
            };
        });
    }, [numVisiblePoints, showMarkers]);

    const addTickValue = useCallback(
        (newXValue: string) => {
            setXLayout((prevLayout) => {
                const previousLabel: string = prevLayout.tickvals[prevLayout.tickvals.length - 1];
                if (!previousLabel || previousLabel.length === 0) {
                    return { ticktext: [newXValue], tickvals: [newXValue] };
                }
                const previousLabelNumber = previousLabel.replaceAll(':', '');
                const currentLabelNumber = newXValue.replaceAll(':', '');
                if (
                    parseInt(currentLabelNumber) >=
                    parseInt(previousLabelNumber) + tickTextIntervalSeconds
                ) {
                    const newTickvals = [...prevLayout.tickvals, newXValue];
                    const newTicktext = [...prevLayout.ticktext, newXValue];
                    if (newTickvals.length > numVisiblePoints) {
                        newTickvals.shift();
                        newTicktext.shift();
                    }
                    return { ticktext: newTicktext, tickvals: newTickvals };
                } else {
                    return prevLayout;
                }
            });
        },
        [numVisiblePoints, tickTextIntervalSeconds],
    );

    useEffect(() => {
        if (demo) {
            const interval = setInterval(() => {
                addSinglePoint();
            }, pollingIntervalMilliseconds);
            return () => clearInterval(interval);
        } else {
            const interval = setInterval(() => {
                const currentValue = deviceRef.current?.value;
                if (typeof currentValue !== 'number') return;
                const newXValue = new Date().toLocaleTimeString('en-US', { hour12: false });
                setData((prevData) => {
                    const newX: Datum[] = [...(prevData.x as Datum[]), newXValue];
                    const newY: Datum[] = [...(prevData.y as Datum[]), currentValue];
                    if (newX.length > numVisiblePoints) {
                        newX.shift();
                        newY.shift();
                    }
                    if (!showMarkers) return { ...prevData, x: newX, y: newY };
                    const n = newX.length;
                    const newMarkerSize = Array.from({ length: n }, (_, i) =>
                        n === 1 ? 8 : Math.round(3 + (i / (n - 1)) * 5),
                    );
                    return {
                        ...prevData,
                        x: newX,
                        y: newY,
                        marker: { ...prevData.marker, size: newMarkerSize },
                    };
                });
                addTickValue(newXValue);
            }, pollingIntervalMilliseconds);
            return () => clearInterval(interval);
        }
    }, [
        addSinglePoint,
        addTickValue,
        demo,
        numVisiblePoints,
        pollingIntervalMilliseconds,
        showMarkers,
    ]);

    const currentValue = device?.value;
    const formattedValue =
        typeof currentValue === 'number'
            ? parseFloat(currentValue.toPrecision(5)).toString()
            : currentValue;
    const valueDisplay =
        formattedValue !== undefined && formattedValue !== null ? `${formattedValue}` : 'N/A';

    // Memoize props that are stable between device value updates so React.memo
    // on PlotlyScatter can bail out and prevent Plotly from re-animating the layout.
    const resolvedYAxisTitle = useMemo(
        () => yAxisTitle ?? device?.units,
        [yAxisTitle, device?.units],
    );

    return (
        <div className={cn('relative flex flex-col bg-white', className)}>
            <div className="absolute top-1/3 right-2 z-10 w-16 flex flex-col text-slate-500">
                <span className="font-normal text-left">{valueDisplay}</span>
                <span className="font-normal text-left text-xs">{device?.units}</span>
            </div>
            <PlotlyScatter
                data={[data]}
                xAxisLayout={xLayout}
                xAxisTitle={deviceLabel}
                yAxisTitle={resolvedYAxisTitle}
                yAxisRange={yAxisRange}
                {...props}
            />
        </div>
    );
}
