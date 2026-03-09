import { cn } from "@/lib/utils";
import { Device } from "@/types/deviceControllerTypes"

type HistogramDeviceControllerProps = {
    acquireDevice: Device;
    handleStartAcquisition: () => void;
    handleStopAcquisition: () => void;
    className?: string;
}
export default function HistogramDeviceController({ acquireDevice, handleStartAcquisition, handleStopAcquisition, className }: HistogramDeviceControllerProps) {
    return (
        <div className={cn("flex flex-col items-center justify-start gap-4", className)}>
            <p className="text-lg text-white text-center">Title</p>

        </div>
    )
}