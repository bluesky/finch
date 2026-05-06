import { Device } from '../types/deviceControllerTypes';
type DeviceControllerBoxSimpleProps = {
    /** The device being controlled. */
    device: Device;
    /** Called when the user submits a new absolute or relative target value. Receives the device name and target value. */
    handleSetValueRequest: (deviceName: string, value: number) => void;
    /** Called when the user clicks the lock/unlock icon. Receives the device name. */
    handleLockClick: (deviceName: string) => void;
    /** Called when the user clicks the minimize icon to collapse this card. Receives the device name. */
    handleMinimizeClick: (deviceName: string) => void;
};
export default function DeviceControllerBoxSimple({ device, handleSetValueRequest, handleLockClick, handleMinimizeClick, ...props }: DeviceControllerBoxSimpleProps): import("react/jsx-runtime").JSX.Element | undefined;
export {};
//# sourceMappingURL=DeviceControllerBoxSimple.d.ts.map