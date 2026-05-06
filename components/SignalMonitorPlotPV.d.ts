import { SignalMonitorPlotDeviceProps } from './SignalMonitorPlotDevice';
export type SignalMonitorPlotPVProps = Omit<SignalMonitorPlotDeviceProps, 'device' | 'deviceLabel'> & {
    /** EPICS process variable name to subscribe to for live data. */
    pv: string;
};
export default function SignalMonitorPlotPV({ pv, ...props }: SignalMonitorPlotPVProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SignalMonitorPlotPV.d.ts.map