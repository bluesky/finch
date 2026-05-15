import { DetectorSetting } from './types/cameraTypes';
export type TIFFContainerProps = {
    /** EPICS PV prefix for the detector (e.g. `'13SIM1'`). Trailing colon is optional. */
    prefix: string;
    /** EPICS PV name for the image array data (e.g. `'13SIM1:image1:ArrayData'`). */
    imageArrayPV?: string;
    /** Area Detector settings groups that define which PVs to subscribe to and display. */
    settings?: DetectorSetting[];
    /** Whether to show the Acquire / Pause control panel below the canvas. Defaults to `true`. */
    enableControlPanel?: boolean;
    /** Whether to show the camera settings panel. Defaults to `true`. */
    enableSettings?: boolean;
    /** Display size of the canvas element. Defaults to `'medium'` (512 × 512). */
    canvasSize?: 'small' | 'medium' | 'large' | 'automatic';
    /** EPICS PV names for the ROI size and color/data type readbacks used to auto-size the canvas. */
    sizePVs?: {
        startX_pv: string;
        startY_pv: string;
        sizeX_pv: string;
        sizeY_pv: string;
        colorMode_pv: string;
        dataType_pv: string;
    };
    /** WebSocket URL for the TIFF image stream. Falls back to the application default when omitted. */
    cameraImageWsUrl?: string;
    /** WebSocket URL for the camera control PV subscription. Falls back to the application default when omitted. */
    cameraControlWsUrl?: string;
};
export default function TIFFContainer({ prefix, imageArrayPV, settings, enableControlPanel, enableSettings, canvasSize, sizePVs, cameraImageWsUrl, cameraControlWsUrl, }: TIFFContainerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TIFFContainer.d.ts.map