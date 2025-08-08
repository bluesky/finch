import { useMemo } from 'react';

import CameraContainer from '@/components/Camera/CameraContainer';
import DeviceControllerBox from '@/components/DeviceControllerBox';
import useOphydSocket from '@/hooks/useOphydSocket';
import Paper from '@/components/Paper';
import Bento from '@/components/Bento';
import { deviceIcons } from '@/assets/icons';

export default function BoltControl() {
    const deviceNameList = useMemo(()=>['IOC:m1', 'IOC:m2'], []);
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } = useOphydSocket(deviceNameList);

    return (
        <Bento>
            <div className="flex flex-col gap-8 flex-shrink-0 h-full justify-start">
                <DeviceControllerBox
                    device={devices['IOC:m1']}
                    handleSetValueRequest={handleSetValueRequest}
                    handleLockClick={toggleDeviceLock}
                    svgIcon={deviceIcons.stepperMotor}
                    className="shadow-xl"
                />
                <DeviceControllerBox
                    device={devices['IOC:m2']}
                    handleSetValueRequest={handleSetValueRequest}
                    handleLockClick={toggleDeviceLock}
                    svgIcon={deviceIcons.stepperMotor}
                    className="shadow-xl"
                />
            </div>
            <Paper title="Camera" size="grow">
                <CameraContainer prefix="Basler5472" enableControlPanel={true} enableSettings={true} canvasSize="medium" customSetup={true}/>
            </Paper>
        </Bento>

    )
}