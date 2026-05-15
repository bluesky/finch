import { DetectorSetting } from '../types/cameraTypes';
type UseCameraContainerProps = {
    prefix: string;
    settings: DetectorSetting[];
    enableControlPanel: boolean;
    cameraControlWsUrl?: string;
};
export declare function useCameraContainer({ prefix, settings, enableControlPanel, cameraControlWsUrl, }: UseCameraContainerProps): {
    handleSetValueRequest: (deviceName: string, value: string | number | boolean) => void;
    devices: import('../../..').Devices;
    startAcquire: () => void;
    stopAcquire: () => void;
    onSubmitSettings: (deviceName: string, value: string | number | boolean) => void;
    cameraControlPV: import('../../..').Device;
};
export {};
//# sourceMappingURL=useCameraContainer.d.ts.map