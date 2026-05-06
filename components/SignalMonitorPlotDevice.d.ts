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
export default function SignalMonitorPlotDevice({ device, deviceLabel, className, numVisiblePoints, pollingIntervalMilliseconds, demo, tickTextIntervalSeconds, color, yAxisTitle, yAxisRange, showMarkers, ...props }: SignalMonitorPlotDeviceProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SignalMonitorPlotDevice.d.ts.map