import { useMemo } from 'react';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import SignalMonitorPlotDevice, { SignalMonitorPlotDeviceProps } from './SignalMonitorPlotDevice';

export type SignalMonitorPlotPVProps = Omit<
    SignalMonitorPlotDeviceProps,
    'device' | 'deviceLabel'
> & {
    /** EPICS process variable name to subscribe to for live data. */
    pv: string;
};

export default function SignalMonitorPlotPV({ pv, ...props }: SignalMonitorPlotPVProps) {
    const deviceNameList = useMemo(() => [pv], [pv]);
    const { devices } = useOphydPVSocket(deviceNameList);
    return <SignalMonitorPlotDevice device={devices[pv]} deviceLabel={pv} {...props} />;
}
