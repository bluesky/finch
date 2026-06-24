import { useMemo } from 'react';
import useOphydDeviceSocket from '@/api/ophyd/useOphydDeviceSocket';
import SignalMonitorPlotDevice, { SignalMonitorPlotDeviceProps } from './SignalMonitorPlotDevice';

export type SignalMonitorPlotOphydProps = Omit<
    SignalMonitorPlotDeviceProps,
    'device' | 'deviceLabel'
> & {
    /** Ophyd device name to subscribe to for live data. */
    deviceName: string;
};

export default function SignalMonitorPlotOphyd({
    deviceName,
    ...props
}: SignalMonitorPlotOphydProps) {
    const deviceNameList = useMemo(() => [deviceName], [deviceName]);
    const { devices } = useOphydDeviceSocket(deviceNameList);
    return (
        <SignalMonitorPlotDevice device={devices[deviceName]} deviceLabel={deviceName} {...props} />
    );
}
