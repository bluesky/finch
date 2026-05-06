import { Device } from '../../types/deviceControllerTypes';
type CameraControlPanelProps = {
    /** Live device object for the `cam1:Acquire` PV, containing `connected`, `value`, and `enum_strs` fields. */
    cameraControlPV: Device;
    /** Callback to start image acquisition (sets `cam1:Acquire` to 1). */
    startAcquire: () => void;
    /** Callback to stop image acquisition (sets `cam1:Acquire` to 0). */
    stopAcquire: () => void;
};
export default function CameraControlPanel({ cameraControlPV, startAcquire, stopAcquire }: CameraControlPanelProps): import("react/jsx-runtime").JSX.Element | undefined;
export {};
//# sourceMappingURL=CameraControlPanel.d.ts.map