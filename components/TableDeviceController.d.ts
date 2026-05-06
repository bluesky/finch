import { Devices } from '../types/deviceControllerTypes';
export type TableDeviceControllerProps = {
    /** Map of device names to their current state objects. Each entry renders as one table row. */
    devices: Devices;
    /** Called when the user submits an absolute or relative move value for a device. */
    handleSetValueRequest: (deviceName: string, value: number) => void;
    /** Called to toggle the locked state for a device, enabling or disabling its move controls. */
    toggleDeviceLock: (deviceName: string, locked: boolean) => void;
    /** Called to toggle the expanded state for a device row, showing or hiding its raw JSON data. */
    toggleExpand: (deviceName: string) => void;
    /** Additional CSS classes applied to the root container. */
    className?: string;
};
export default function TableDeviceController({ devices, handleSetValueRequest, toggleDeviceLock, toggleExpand, className, ...props }: TableDeviceControllerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TableDeviceController.d.ts.map