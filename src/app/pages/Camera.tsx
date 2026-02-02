import { useMemo } from "react";
import CameraContainer from "@/components/Camera/CameraContainer";
import ReactEDM from "@/components/ReactEDM/ReactEDM";
import DeviceControllerBox from "@/components/DeviceControllerBox";
import useOphydSocket from "@/hooks/useOphydSocket";
import TIFFCanvas from "@/components/Camera/TIFFCanvas";
import TIFFContainer from "@/components/Camera/TIFFContainer";
import { deviceIcons } from "@/assets/icons";

export default function Camera() {
    const deviceNameList = useMemo(()=>['bl531_xps1:mono_angle_deg', 'bl531_xps1:mono_height_mm'], []);
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } = useOphydSocket(deviceNameList);

    return (
        <div className="flex flex-wrap items-start justify-center gap-16">
           <article className="flex flex-col items-center w-fit">
                <h2 className="text-3xl font-bold mb-4 text-white">Basler Camera</h2>
                <CameraContainer prefix="BL531acA5427" enableControlPanel={true} enableSettings={false} canvasSize="medium"/>
                <ReactEDM P="BL531acA5427" R="cam1" fileName="ADBase.adl" />
           </article>
            <article className="flex flex-col items-center w-fit">
                <h2 className="text-3xl font-bold mb-4 text-white">Pilatus 1M</h2>
                <TIFFContainer prefix='13PIL1' enableControlPanel={true} enableSettings={false} canvasSize="medium"/>
                <ReactEDM P="13PIL1" R="cam1" fileName="pilatusDetector.adl" />         
           </article>
            <article className="flex flex-col items-center w-fit">
                <h2 className="text-3xl font-bold mb-4 text-white">Pilatus 300k (WAXS)</h2>
                <TIFFContainer prefix='pilatus300k' enableControlPanel={true} enableSettings={false} canvasSize="medium"/>
                <ReactEDM P="pilatus300k" R="cam1" fileName="pilatusDetector.adl" />         
           </article>
        </div>
    )
}