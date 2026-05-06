import { Device } from '../types/deviceControllerTypes';
export type DeviceControllerBoxProps = {
    /** The primary device being controlled. */
    device: Device;
    /** Optional readback device whose value is displayed as the current position. Falls back to `device` if not provided. */
    deviceRBV?: Device;
    /** Called when the user requests a move to a new absolute value. Receives the device name and target value. */
    handleSetValueRequest: (deviceName: string, value: number) => void;
    /** Called when the user clicks the lock/unlock button. Receives the device name. */
    handleLockClick: (deviceName: string) => void;
    /** Optional SVG icon rendered in the header area of the card. */
    svgIcon?: React.ReactNode;
    /** Additional CSS classes to apply to the root article element. */
    className?: string;
    /** Display title shown instead of the device name when provided. */
    title?: string;
};
export default function DeviceControllerBox({ device, deviceRBV, handleSetValueRequest, handleLockClick, svgIcon, className, title, ...props }: DeviceControllerBoxProps): import("react/jsx-runtime").JSX.Element | undefined;
//# sourceMappingURL=DeviceControllerBox.d.ts.map