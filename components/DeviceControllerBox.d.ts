import { Device } from '../types/deviceControllerTypes';
export type DeviceControllerBoxProps = {
    device: Device;
    handleSetValueRequest: (deviceName: string, value: number) => void;
    handleLockClick: (deviceName: string) => void;
    svgIcon?: React.ReactNode;
    className?: string;
};
export default function DeviceControllerBox({ device, handleSetValueRequest, handleLockClick, svgIcon, className }: DeviceControllerBoxProps): import("react/jsx-runtime").JSX.Element | undefined;
//# sourceMappingURL=DeviceControllerBox.d.ts.map