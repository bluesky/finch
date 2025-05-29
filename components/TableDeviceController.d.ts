import { Devices } from '../types/deviceControllerTypes';
type TableDeviceControllerProps = {
    devices: Devices;
    handleSetValueRequest: (deviceName: string, value: number) => void;
    toggleDeviceLock: (deviceName: string, locked: boolean) => void;
    toggleExpand: (deviceName: string) => void;
};
export default function TableDeviceController({ devices, handleSetValueRequest, toggleDeviceLock, toggleExpand }: TableDeviceControllerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TableDeviceController.d.ts.map