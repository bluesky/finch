import CameraContainer from "@/components/Camera/CameraContainer"
import TIFFCanvas from "@/components/Camera/TIFFCanvas"
import Osprey from "@/components/Osprey/Osprey"
import Bento from "@/components/Bento"
import Hexapod from "@/components/Hexapod/Hexapod"
import SignalMonitorPlot from "@/components/SignalMonitorPlot"
import BeamEnergyOphyd from "@/components/BeamEnergy/BeamEnergyOphyd"
import Shutter from "@/components/Shutter";
import useResizeObserver from "@/hooks/useResizeObserver";
import TIFFContainer from "@/components/Camera/TIFFContainer";
import QServerPlanMonitor from "@/features/QServerPlanMonitor";

export default function BL531Dashboard() {
    const {containerRef, dimensions} = useResizeObserver();
    return (
        <div className="flex flex-col w-full h-full gap-4">
            <Bento className="bg-white/40 p-8 rounded-md items-start justify-around flex-shrink-0 gap-x-0 gap-y-8">
                <div className="flex flex-col items-center justify-start gap-4">
                    <p className="text-lg text-white text-center">Beam Energy & Diode</p>
                    <SignalMonitorPlot pv={"bl201-beamstop:current"} className={'max-h-64 w-[26rem] rounded-lg'} numVisiblePoints={200} tickTextIntervalSeconds={30} yAxisTitle="Current"/>
                    <BeamEnergyOphyd />
                </div>
                <div className="flex flex-col">
                    <p className="text-lg text-white text-center">Pilatus 300k</p>
                    <TIFFContainer prefix='pilatus300k' enableControlPanel={true} enableSettings={false} canvasSize="medium" />
                </div>
                <div className="flex flex-col">
                    <p className="text-lg text-white text-center">Pilatus 1M</p>
                    <TIFFContainer prefix='13PIL1' enableControlPanel={true} enableSettings={false} canvasSize="medium" />
                </div>
                <div className="flex flex-col">
                    <p className="text-lg text-white text-center">Basler Sample Camera</p>
                    <CameraContainer prefix="BL531acA5427" enableControlPanel={true} enableSettings={false} canvasSize="medium" />
                </div>
                <div className="flex flex-col justify-start">
                    <p className="text-lg text-white text-center">Sample Controller</p>
                    <Hexapod />
                </div>
                <div className="flex flex-col">
                    <p className="text-lg text-white text-center">QServer</p>
                    <QServerPlanMonitor className="h-[32rem]"/>
                </div>
            </Bento>
            <section ref={containerRef} className="w-full min-h-0 flex-grow">
                <Osprey width={dimensions.width} height={dimensions.height} className="m-0 p-0"/>
            </section>
        </div>
            
    )
}