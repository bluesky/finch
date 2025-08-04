import { Device } from '../types/deviceControllerTypes';
export type DeviceControllerBoxProps = {
    device: Device;
    deviceRBV?: Device;
    handleSetValueRequest: (deviceName: string, value: number) => void;
    handleLockClick: (deviceName: string) => void;
    svgIcon?: React.ReactNode;
    className?: string;
    title?: string;
};
export default function DeviceControllerBox({ device, deviceRBV, handleSetValueRequest, handleLockClick, svgIcon, className, title }: DeviceControllerBoxProps): import("react/jsx-runtime").JSX.Element | undefined;
//# sourceMappingURL=DeviceControllerBox.d.ts.map