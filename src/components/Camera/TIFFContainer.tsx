import TIFFCanvas from './TIFFCanvas';
import CameraControlPanel from './CameraControlPanel';
import CameraSettings from './CameraSettings';
import { cameraDeviceData } from './utils/cameraDeviceData.js';
import { DetectorSetting } from './types/cameraTypes';
import { useCameraContainer } from './hooks/useCameraContainer';

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
export default function TIFFContainer({
    prefix = '13SIM1',
    imageArrayPV = '',
    settings = cameraDeviceData.ADSimDetector,
    enableControlPanel = true,
    enableSettings = true,
    canvasSize = 'medium',
    sizePVs,
    cameraImageWsUrl,
    cameraControlWsUrl,
}: TIFFContainerProps) {
    const { devices, startAcquire, stopAcquire, onSubmitSettings, cameraControlPV } =
        useCameraContainer({ prefix, settings, enableControlPanel, cameraControlWsUrl });

    return (
        <div className="w-fit h-fit flex flex-wrap space-x-4 items-start justify-center">
            <div className="flex flex-col flex-shrink-0 items-center">
                <TIFFCanvas
                    imageArrayPV={imageArrayPV}
                    canvasSize={canvasSize}
                    sizePVs={sizePVs}
                    prefix={prefix}
                    wsUrl={cameraImageWsUrl}
                />
                {enableControlPanel ? (
                    <CameraControlPanel
                        cameraControlPV={cameraControlPV}
                        startAcquire={startAcquire}
                        stopAcquire={stopAcquire}
                    />
                ) : (
                    ''
                )}
            </div>
            <div className="overflow-x-auto overflow-y-auto">
                {enableSettings ? (
                    <CameraSettings
                        enableSettings={enableSettings}
                        settings={settings}
                        prefix={prefix}
                        cameraSettingsPVs={devices}
                        onSubmit={onSubmitSettings}
                    />
                ) : (
                    ''
                )}
            </div>
        </div>
    );
}
