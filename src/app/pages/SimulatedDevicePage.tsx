import useSimOphydPVSocket from '@/hooks/useSimOphydPVSocket';
import TableDeviceController from '@/components/TableDeviceController';
const SIM_DEVICES = ['sineSignal', 'noisySignal', 'motor1', 'motor2'];

export default function SimulatedDevicePage() {
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
        useSimOphydPVSocket(SIM_DEVICES);

    return (
        <div className="p-8">
            <TableDeviceController
                devices={devices}
                handleSetValueRequest={handleSetValueRequest}
                toggleDeviceLock={toggleDeviceLock}
                toggleExpand={toggleExpand}
            />
            {/* <SignalMonitorPlotDevice
                device={devices['sineSignal']}
                deviceLabel="Sine Signal"
                yAxisRange={[0, 100]}
                numVisiblePoints={500}
                pollingIntervalMilliseconds={500}
                showMarkers={true}
            /> */}
            {/* <BeamEnergyPV demo={true}/> */}
            {/* <Hexapod demo={true} prefix="TEST" /> */}
                {/* <Histogram demo={true} arrayPV="sineSignal" acquirePV="motor1" /> */}
        </div>
    );
}
