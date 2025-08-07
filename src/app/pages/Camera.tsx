import CameraContainer from "@/components/Camera/CameraContainer";
import ADLController from "@/components/ADLController/ADLController";
export default function Camera() {
    return (
        <div className="flex flex-wrap items-start justify-center gap-16">
            <div className="flex flex-col items-center">
                <h1 className="text-3xl font-bold mb-4">Area Detector Live Stream</h1>
                <CameraContainer prefix="Basler5472" enableControlPanel={true} enableSettings={false} canvasSize="medium"/>
            </div>
            <div className="w-fit">
                <ADLController P="Basler5472" R="cam1" fileName="ADBase.adl" />
            </div>
        </div>
    )
}