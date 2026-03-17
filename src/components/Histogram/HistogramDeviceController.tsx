import { cn } from "@/lib/utils";
import { Device } from "@/types/deviceControllerTypes"

type HistogramDeviceControllerProps = {
    /** Live device object for the acquire PV, used to read current acquisition state. */
    acquireDevice: Device;
    /** Callback invoked when the user requests to start acquisition. */
    handleStartAcquisition: () => void;
    /** Callback invoked when the user requests to stop acquisition. */
    handleStopAcquisition: () => void;
    /** Additional class names applied to the container element. */
    className?: string;
}
export default function HistogramDeviceController({ acquireDevice, handleStartAcquisition, handleStopAcquisition, className }: HistogramDeviceControllerProps) {
    return (
        <div className={cn("flex flex-col items-center justify-start gap-4", className)}>
            <p className="text-lg text-white text-center">Title</p>

        </div>
    )
}