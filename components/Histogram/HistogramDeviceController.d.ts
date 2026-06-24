import { Device } from '../../types/deviceControllerTypes';
type HistogramDeviceControllerProps = {
    /** Live device object for the acquire PV, used to read current acquisition state. */
    acquireDevice: Device;
    /** Live device object for the exposure PV, used to relay current exposure */
    exposureDevice: Device;
    /** Callback invoked when the user requests to start acquisition. */
    handleStartAcquisition: () => void;
    /** Callback invoked when the user requests to stop acquisition. */
    handleStopAcquisition: () => void;
    /** Callback invoked when the user enters a value in the exposure field */
    handleSetExposure: (newValue: number) => void;
    /** Additional class names applied to the container element. */
    className?: string;
};
export default function HistogramDeviceController({ acquireDevice, exposureDevice, handleSetExposure, handleStartAcquisition, handleStopAcquisition, className, }: HistogramDeviceControllerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=HistogramDeviceController.d.ts.map