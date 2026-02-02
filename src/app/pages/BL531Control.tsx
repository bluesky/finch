import { useMemo } from 'react';

import CameraContainer from '@/components/Camera/CameraContainer';
import DeviceControllerBox from '@/components/DeviceControllerBox';
import useOphydSocket from '@/hooks/useOphydSocket';
import Paper from '@/components/Paper';
import Bento from '@/components/Bento';
import Hexapod from '@/components/Hexapod/Hexapod';
import BeamEnergyOphyd from '@/components/BeamEnergy/BeamEnergyOphyd';
import { deviceIcons } from '@/assets/icons';
import Beamstop from '@/features/Beamstop';
const beamstopXName = "bl531_xps2:sample_x_mm";
const beamstopYName = "bl531_xps2:sample_y_mm";
const beamstopXNameRBV = beamstopXName + '.RBV';
const beamstopYNameRBV = beamstopYName + '.RBV';
const hexapodRyName = "SYM:HEX01:MOVE_PTP:Ry";
const hexapodRyNameRBV = "SYM:HEX01:s_uto_ry_RBV";
const hexapodTzName = "SYM:HEX01:MOVE_PTP:Tz";
const hexapodTzNameRBV = "SYM:HEX01:s_uto_tz_RBV";
const hexapodTyName = "SYM:HEX01:MOVE_PTP:Ty";
const hexapodTyNameRBV = "SYM:HEX01:s_uto_ty_RBV";
//const deviceNameList = [beamstopXName, beamstopYName, beamstopXNameRBV, beamstopYNameRBV];
const hexapodDeviceNameList = [hexapodRyName, hexapodTzName, hexapodTyName, hexapodRyNameRBV, hexapodTzNameRBV, hexapodTyNameRBV];
export default function BL531Control() {
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } = useOphydSocket(hexapodDeviceNameList);
    return (
  
        <div className="flex flex-row gap-4 mb-4">
            <BeamEnergyOphyd/>
            <div className="flex flex-col gap-4">
                {/* <DeviceControllerBox title='Sample Holder - X' svgIcon={deviceIcons.sampleHolderX} device={devices[beamstopXName]} deviceRBV={devices[beamstopXNameRBV]} handleLockClick={toggleDeviceLock} handleSetValueRequest={handleSetValueRequest}/>
                <DeviceControllerBox title='Sample Holder - Y' svgIcon={deviceIcons.sampleHolderY} device={devices[beamstopYName]} deviceRBV={devices[beamstopYNameRBV]} handleLockClick={toggleDeviceLock} handleSetValueRequest={handleSetValueRequest}/> */}
                {/* <DeviceControllerBox title='Hexapod - Rot Y' svgIcon={deviceIcons.sampleHolderX} device={devices[hexapodRyName]} deviceRBV={devices[hexapodRyNameRBV]} handleLockClick={toggleDeviceLock} handleSetValueRequest={handleSetValueRequest}/>
                <DeviceControllerBox title='Hexapod - Trans Z' svgIcon={deviceIcons.sampleHolderY} device={devices[hexapodTzName]} deviceRBV={devices[hexapodTzNameRBV]} handleLockClick={toggleDeviceLock} handleSetValueRequest={handleSetValueRequest}/>
                <DeviceControllerBox title='Hexapod - Trans Y' svgIcon={deviceIcons.sampleHolderY} device={devices[hexapodTyName]} deviceRBV={devices[hexapodTyNameRBV]} handleLockClick={toggleDeviceLock} handleSetValueRequest={handleSetValueRequest}/> */}
            </div>
            <Hexapod />
            <CameraContainer prefix="BL531acA5427" enableControlPanel={true} enableSettings={false} canvasSize="large"/>
        </div>
  
        

    )
}
