import useSimOphydPVSocket from '@/api/ophyd/useSimOphydPVSocket';
import TableDeviceController from '@/components/TableDeviceController';
import SignalMonitorPlotDevice from '@/components/SignalMonitorPlotDevice';

const DEMO_DEVICES = ['sineSignal', 'motor1'];

export default function OphydHooksDemo() {
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
        useSimOphydPVSocket(DEMO_DEVICES);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
            <div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                    Device control — motor1 (simulated)
                </p>
                <TableDeviceController
                    devices={{ motor1: devices['motor1'] }}
                    toggleDeviceLock={toggleDeviceLock}
                    handleSetValueRequest={handleSetValueRequest}
                    toggleExpand={toggleExpand}
                />
            </div>
            <div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                    Signal monitor — sineSignal (live animation)
                </p>
                <SignalMonitorPlotDevice device={devices['sineSignal']} />
            </div>
        </div>
    );
}
