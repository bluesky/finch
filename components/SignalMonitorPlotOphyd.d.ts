import { SignalMonitorPlotDeviceProps } from './SignalMonitorPlotDevice';
export type SignalMonitorPlotOphydProps = Omit<SignalMonitorPlotDeviceProps, 'device' | 'deviceLabel'> & {
    /** Ophyd device name to subscribe to for live data. */
    deviceName: string;
};
export default function SignalMonitorPlotOphyd({ deviceName, ...props }: SignalMonitorPlotOphydProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SignalMonitorPlotOphyd.d.ts.map