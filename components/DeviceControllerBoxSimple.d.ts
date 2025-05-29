import { Device } from '../types/deviceControllerTypes';
type DeviceControllerBoxSimpleProps = {
    device: Device;
    handleSetValueRequest: (deviceName: string, value: number) => void;
    handleLockClick: (deviceName: string) => void;
    handleMinimizeClick: (deviceName: string) => void;
};
export default function DeviceControllerBoxSimple({ device, handleSetValueRequest, handleLockClick, handleMinimizeClick }: DeviceControllerBoxSimpleProps): import("react/jsx-runtime").JSX.Element | undefined;
export {};
//# sourceMappingURL=DeviceControllerBoxSimple.d.ts.map