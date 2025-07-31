import { useMemo } from 'react';

import CameraContainer from '@/components/Camera/CameraContainer';
import DeviceControllerBox from '@/components/DeviceControllerBox';
import useOphydSocket from '@/hooks/useOphydSocket';
import Paper from '@/components/Paper';
import Bento from '@/components/Bento';
import { deviceIcons } from '@/assets/icons';
import Beamstop from '@/features/Beamstop';

export default function BL531Control() {
    // const deviceNameList = useMemo(()=>['bl531_xps2:sample_x_mm', 'bl531_xps2:sample_y_mm'], []);
    // const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } = useOphydSocket(deviceNameList);

    return (
        // <Bento>
        //     <div className="flex flex-col gap-8 flex-shrink-0 h-full justify-start">
        //         <DeviceControllerBox 
        //             device={devices['bl531_xps2:sample_x_mm']} 
        //             handleSetValueRequest={handleSetValueRequest} 
        //             handleLockClick={toggleDeviceLock} 
        //             svgIcon={deviceIcons.linearStage}
        //             className="shadow-xl"
        //         />
        //         <DeviceControllerBox 
        //             device={devices['bl531_xps2:sample_y_mm']} 
        //             handleSetValueRequest={handleSetValueRequest} 
        //             handleLockClick={toggleDeviceLock} 
        //             svgIcon={deviceIcons.linearStage}
        //             className="shadow-xl"
        //         />
        //     </div>
        //     <Paper title="Camera" size="grow">
        //         <CameraContainer prefix="Basler5472" enableControlPanel={true} enableSettings={true} canvasSize="medium" customSetup={true}/>
        //     </Paper>
        // </Bento>
             <Beamstop beamstopCurrentName="bl201-beamstop:current" beamstopXIcon={deviceIcons.sampleHolderX} beamstopYIcon={deviceIcons.sampleHolderY} beamstopXTitle='Sample Holder - X' beamstopXName="bl531_xps2:sample_x_mm" beamstopYTitle='Sample Holder - Y' beamstopYName="bl531_xps2:sample_y_mm" />
        

    )
}
