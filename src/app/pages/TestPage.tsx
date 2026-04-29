import DeviceControllerBox from "@/components/DeviceControllerBox";
import SignalMonitorPlotDevice from "@/components/SignalMonitorPlotDevice";
import useOphydPVSocket from "@/api/ophyd/useOphydPVSocket";
import QueueServer from "@/components/QServer/QueueServer";
import TiledWrapper from "@/components/Tiled/Tiled";
import { Tiled } from "@blueskyproject/tiled";
export default function TestPage() {
    const {devices, handleSetValueRequest, toggleDeviceLock} = useOphydPVSocket(['IOC:m1', 'IOC:m1.RBV']);
    return (
        <div className="flex flex-col items-center justify-start gap-4 py-4 max-w-96 mx-auto">
            <DeviceControllerBox device={devices['IOC:m1']} deviceRBV={devices['IOC:m1.RBV']} handleLockClick={toggleDeviceLock} handleSetValueRequest={handleSetValueRequest} />
            <SignalMonitorPlotDevice device={devices['IOC:m1.RBV']} />
        </div>
        // <QueueServer />
        // <TiledWrapper />
    );
}