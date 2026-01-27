import { useMemo, useCallback } from "react";

import TIFFCanvas from "./TIFFCanvas";
import CameraControlPanel from "./CameraControlPanel";
import CameraSettings from "./CameraSettings";
import CameraCustomSetup from "./CameraCustomSetup";
import { cameraDeviceData } from "./utils/cameraDeviceData.js";
import useOphydSocket from "@/hooks/useOphydSocket";
import { DetectorSetting } from "./types/cameraTypes";

export type TIFFContainerProps = {
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
    },
    cameraImageWsUrl?:string,
    cameraControlWsUrl?:string
}
export default function TIFFContainer(
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
    }: TIFFContainerProps) 
    {

    const sanitizeInputPrefix = (prefix:string) => {
        var santizedPrefix = '';
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

        var sanitizedPrefix = sanitizeInputPrefix(prefix);

        var pvArray:string[] = [];
        settings.forEach((group) => {
            group.inputs.forEach((input) => {
                //console.log(group.prefix)
                let pv = `${sanitizedPrefix}:${group.prefix !== null ? group.prefix + ':' : ''}${input.suffix}`
                pvArray.push(pv);
            })
        })
        if (enableControlPanel) {
            let controlPV: string | false = createControlPVString(prefix);
            controlPV && pvArray.push(controlPV);
        }
        return pvArray;
    };

    const createControlPVString = (prefix='') => {
        if (prefix === '' && enableControlPanel) {
            console.log('Error in concatenating a camera control PV, received empty prefix string');
            return false;
        }
        let acquireSuffix = 'cam1:Acquire'; //the suffix responsible for acquiring images, has a value of 1 or 0
        var controlPV = `${sanitizeInputPrefix(prefix)}:${acquireSuffix}`;
        return controlPV;
    };


    if (customSetup) {
        return (
            <div className="min-w-96 rounded-md bg-white">
                <CameraCustomSetup />
            </div>
        )
    } else {
        var deviceNames = useMemo(()=>createDeviceNameArray(settings, prefix), []);
    
    
        const {
            handleSetValueRequest,
            devices,
            toggleExpand,
            toggleDeviceLock
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
                    <TIFFCanvas imageArrayPV={imageArrayPV} canvasSize={canvasSize} sizePVs={sizePVs} prefix={prefix} wsUrl={cameraImageWsUrl}/>
                    { enableControlPanel ? <CameraControlPanel cameraControlPV={cameraControlPV} startAcquire={startAcquire} stopAcquire={stopAcquire}/> : ''}
                </div>
                <div className='overflow-x-auto overflow-y-auto'>
                    {enableSettings ? <CameraSettings enableSettings={enableSettings} settings={settings} prefix={prefix} cameraSettingsPVs={devices} onSubmit={onSubmitSettings}/> : ''}
                </div>

            </div>
        )
    }
}