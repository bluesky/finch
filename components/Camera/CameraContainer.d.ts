import { DetectorSetting } from './types/cameraTypes';
export type CameraContainerProps = {
    prefix: string;
    customSetup?: boolean;
    imageArrayPV?: string;
    settings?: DetectorSetting[];
    enableControlPanel?: boolean;
    enableSettings?: boolean;
    canvasSize?: 'small' | 'medium' | 'large' | 'automatic';
    sizePVs?: {
        startX_pv: string;
        startY_pv: string;
        sizeX_pv: string;
        sizeY_pv: string;
        colorMode_pv: string;
        dataType_pv: string;
    };
};
export default function CameraContainer({ prefix, customSetup, imageArrayPV, settings, enableControlPanel, enableSettings, canvasSize, sizePVs, }: CameraContainerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CameraContainer.d.ts.map