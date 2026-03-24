import { useMemo, useCallback } from "react";

import CameraCanvas from "./CameraCanvas";
import CameraControlPanel from "./CameraControlPanel";
import CameraSettings from "./CameraSettings";
import CameraCustomSetup from "./CameraCustomSetup";
//import { useCamera } from "./hooks/useCamera";
import { cameraDeviceData } from "./utils/cameraDeviceData.js";
import useOphydSocket from "@/hooks/useOphydSocket";
import { DetectorSetting } from "./types/cameraTypes";

//"13SIM1:image1:ArrayData"
export type CameraContainerProps = {
    /** EPICS PV prefix for the detector (e.g. `'13SIM1'`). Trailing colon is optional. */
    prefix: string;
    /** When `true`, renders the interactive `CameraCustomSetup` form instead of the live view. */
    customSetup?: boolean;
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
    },
    /** WebSocket URL for the image stream. Falls back to the application default when omitted. */
    cameraImageWsUrl?:string,
    /** WebSocket URL for the camera control PV subscription. Falls back to the application default when omitted. */
    cameraControlWsUrl?:string
}
export default function CameraContainer(
    {
        prefix='13SIM1', 
        customSetup=false, 
        imageArrayPV='', 
        settings=cameraDeviceData.ADSimDetector, 
        enableControlPanel=true, 
        enableSettings=true, 
        canvasSize='medium',
        sizePVs,
        cameraImageWsUrl,
        cameraControlWsUrl  
    }: CameraContainerProps) 
    {

    const sanitizeInputPrefix = (prefix:string) => {
        let santizedPrefix = '';
        if (prefix.trim().slice(-1) === ':') {
            santizedPrefix = prefix.trim().substring(0, prefix.length -1)
        } else {
            santizedPrefix = prefix.trim();
        }
        return santizedPrefix;
    };

    const createDeviceNameArray = (settings:DetectorSetting[], prefix:string) => {
        //settings is an array of objects, grouped by setting type
        //ex) a single pv suffix is at settings[0].inputs[0].suffix
        //console.log({settings})

        const sanitizedPrefix = sanitizeInputPrefix(prefix);

        const pvArray:string[] = [];
        settings.forEach((group) => {
            group.inputs.forEach((input) => {
                //console.log(group.prefix)
                const pv = `${sanitizedPrefix}:${group.prefix !== null ? group.prefix + ':' : ''}${input.suffix}`
                pvArray.push(pv);
            })
        })
        if (enableControlPanel) {
            const controlPV: string | false = createControlPVString(prefix);
            controlPV && pvArray.push(controlPV);
        }
        return pvArray;
    };

    const createControlPVString = (prefix='') => {
        if (prefix === '' && enableControlPanel) {
            console.log('Error in concatenating a camera control PV, received empty prefix string');
            return false;
        }
        const acquireSuffix = 'cam1:Acquire'; //the suffix responsible for acquiring images, has a value of 1 or 0
        const controlPV = `${sanitizeInputPrefix(prefix)}:${acquireSuffix}`;
        return controlPV;
    };


    if (customSetup) {
        return (
            <div className="min-w-96 rounded-md bg-white">
                <CameraCustomSetup />
            </div>
        )
    } else {
        const deviceNames = useMemo(()=>createDeviceNameArray(settings, prefix), []);
    
    
        const {
            handleSetValueRequest,
            devices,
        } = useOphydSocket(deviceNames, cameraControlWsUrl);
    
        const startAcquire = useCallback( () => {
            handleSetValueRequest(`${prefix}:cam1:Acquire`, 1);
        }, [])
    
        const stopAcquire = useCallback( () => {
            handleSetValueRequest(`${prefix}:cam1:Acquire`, 0);
        }, [])
    
        const onSubmitSettings = useCallback(handleSetValueRequest, []);
    
        const cameraControlPV = devices[`${prefix}:cam1:Acquire`];

        return (
            <div className="w-fit h-fit flex flex-wrap space-x-4 items-start justify-center">
                <div className="flex flex-col flex-shrink-0 items-center">
                    <CameraCanvas imageArrayPV={imageArrayPV} canvasSize={canvasSize} sizePVs={sizePVs} prefix={prefix} wsUrl={cameraImageWsUrl}/>
                    { enableControlPanel ? <CameraControlPanel cameraControlPV={cameraControlPV} startAcquire={startAcquire} stopAcquire={stopAcquire}/> : ''}
                </div>
                <div className='overflow-x-auto overflow-y-auto'>
                    {enableSettings ? <CameraSettings enableSettings={enableSettings} settings={settings} prefix={prefix} cameraSettingsPVs={devices} onSubmit={onSubmitSettings}/> : ''}
                </div>

            </div>
        )
    }
}