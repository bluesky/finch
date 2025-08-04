import { Devices } from '../types/deviceControllerTypes';
export type TableDeviceControllerProps = {
    devices: Devices;
    handleSetValueRequest: (deviceName: string, value: number) => void;
    toggleDeviceLock: (deviceName: string, locked: boolean) => void;
    toggleExpand: (deviceName: string) => void;
};
export default function TableDeviceController({ devices, handleSetValueRequest, toggleDeviceLock, toggleExpand }: TableDeviceControllerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TableDeviceController.d.ts.map