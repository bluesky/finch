import { Device } from '../../types/deviceControllerTypes';
type HistogramDeviceControllerProps = {
    /** Live device object for the acquire PV, used to read current acquisition state. */
    acquireDevice: Device;
    /** Callback invoked when the user requests to start acquisition. */
    handleStartAcquisition: () => void;
    /** Callback invoked when the user requests to stop acquisition. */
    handleStopAcquisition: () => void;
    /** Additional class names applied to the container element. */
    className?: string;
};
export default function HistogramDeviceController({ className }: HistogramDeviceControllerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=HistogramDeviceController.d.ts.map