import { Devices } from '../types/deviceControllerTypes';
export type TableDeviceControllerWithRBVProps = {
    /** Map of device names to their current state objects. Each entry renders as one table row. */
    devices: Devices;
    devicesRBV: Devices;
    /** Called when the user submits an absolute or relative move value for a device. */
    handleSetValueRequest: (deviceName: string, value: number) => void;
    /** Called to toggle the locked state for a device, enabling or disabling its move controls. */
    toggleDeviceLock: (deviceName: string, locked: boolean) => void;
    /** Called to toggle the expanded state for a device row, showing or hiding its raw JSON data. */
    toggleExpand: (deviceName: string) => void;
    /**
     * When true, the absolute- and relative-move controls share a single "Move"
     * column whose header is a dropdown for switching between the two, so the
     * relative-move UI never reserves empty space. Defaults to false, which
     * renders Absolute Move and Relative Move as two always-visible columns.
     */
    collapsibleRelativeMove?: boolean;
    /** Additional CSS classes applied to the root container. */
    className?: string;
};
export default function TableDeviceControllerWithRBV({ devices, devicesRBV, handleSetValueRequest, toggleDeviceLock, toggleExpand, collapsibleRelativeMove, className, ...props }: TableDeviceControllerWithRBVProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TableDeviceControllerWithRBV.d.ts.map