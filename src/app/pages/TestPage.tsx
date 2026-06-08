import DeviceControllerBox from '@/components/DeviceControllerBox';
import SignalMonitorPlotDevice from '@/components/SignalMonitorPlotDevice';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import OphydSocketViewer from '@/components/OphydSocketViewer/OphydSocketViewer';
import { OphydTransportProvider } from '@/api/ophyd/OphydTransportProvider';
import { OphydSimProvider, createOphydSimTransport, defaultBeamline } from '@/lib/ophyd-sim';
import { useMemo } from 'react';

function TestPageBody() {
    const { devices, handleSetValueRequest, toggleDeviceLock } = useOphydPVSocket([
        'IOC:m1',
        'IOC:m1.RBV',
    ]);

    // A second hook call against the same provider — proves both consumers
    // observe the same motion.
    const { devices: devices2 } = useOphydPVSocket(['IOC:m1.RBV']);

    return (
        <div className="flex flex-col items-center justify-start gap-4 py-4 max-w-96 mx-auto">
            <OphydSocketViewer />
            <DeviceControllerBox
                device={devices['IOC:m1']}
                deviceRBV={devices['IOC:m1.RBV']}
                handleLockClick={toggleDeviceLock}
                handleSetValueRequest={handleSetValueRequest}
            />
            <SignalMonitorPlotDevice device={devices['IOC:m1.RBV']} />
            <SignalMonitorPlotDevice device={devices2['IOC:m1.RBV']} />
        </div>
    );
}

export default function TestPage() {
    const transport = useMemo(() => createOphydSimTransport(defaultBeamline), []);
    return (
        <OphydSimProvider sim={defaultBeamline}>
            <OphydTransportProvider transport={transport}>
                <TestPageBody />
            </OphydTransportProvider>
        </OphydSimProvider>
    );
}
