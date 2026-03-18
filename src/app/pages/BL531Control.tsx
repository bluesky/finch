import CameraContainer from '@/components/Camera/CameraContainer';
import Hexapod from '@/components/Hexapod/Hexapod';
import BeamEnergyOphyd from '@/components/BeamEnergy/BeamEnergyOphyd';
import SignalMonitorPlotOphyd from '@/components/SignalMonitorPlotOphyd';
//const deviceNameList = [beamstopXName, beamstopYName, beamstopXNameRBV, beamstopYNameRBV];
export default function BL531Control() {
    return (
  
        <div className="flex flex-row gap-4 mb-4">
            <BeamEnergyOphyd/>
            <Hexapod />
            <CameraContainer prefix="BL531a2A2448" enableControlPanel={true} enableSettings={false} canvasSize="large"/>
            <SignalMonitorPlotOphyd pv="mercury" className={'max-h-64 w-[26rem] rounded-lg'} numVisiblePoints={200} tickTextIntervalSeconds={30} yAxisTitle="Current"/>
        </div>
  
        

    )
}
