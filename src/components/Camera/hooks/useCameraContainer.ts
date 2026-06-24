import { useMemo, useCallback } from 'react';
import useOphydSocket from '@/api/ophyd/useOphydSocket';
import { DetectorSetting } from '../types/cameraTypes';

type UseCameraContainerProps = {
    prefix: string;
    settings: DetectorSetting[];
    enableControlPanel: boolean;
    cameraControlWsUrl?: string;
};

export function useCameraContainer({
    prefix,
    settings,
    enableControlPanel,
    cameraControlWsUrl,
}: UseCameraContainerProps) {
    const sanitizeInputPrefix = (p: string) => {
        const trimmed = p.trim();
        return trimmed.slice(-1) === ':' ? trimmed.substring(0, trimmed.length - 1) : trimmed;
    };

    const createControlPVString = useCallback(
        (p = '') => {
            if (p === '' && enableControlPanel) {
                console.log(
                    'Error in concatenating a camera control PV, received empty prefix string',
                );
                return false;
            }
            const acquireSuffix = 'cam1:Acquire';
            return `${sanitizeInputPrefix(p)}:${acquireSuffix}`;
        },
        [enableControlPanel],
    );

    const createDeviceNameArray = useCallback(
        (s: DetectorSetting[], p: string) => {
            const sanitizedPrefix = sanitizeInputPrefix(p);
            const pvArray: string[] = [];
            s.forEach((group) => {
                group.inputs.forEach((input) => {
                    const pv = `${sanitizedPrefix}:${group.prefix !== null ? group.prefix + ':' : ''}${input.suffix}`;
                    pvArray.push(pv);
                });
            });
            if (enableControlPanel) {
                const controlPV: string | false = createControlPVString(p);
                if (controlPV) pvArray.push(controlPV);
            }
            return pvArray;
        },
        [enableControlPanel, createControlPVString],
    );

    const deviceNames = useMemo(
        () => createDeviceNameArray(settings, prefix),
        [createDeviceNameArray, settings, prefix],
    );

    const { handleSetValueRequest, devices } = useOphydSocket(deviceNames, cameraControlWsUrl);

    const startAcquire = useCallback(() => {
        handleSetValueRequest(`${prefix}:cam1:Acquire`, 1);
    }, [handleSetValueRequest, prefix]);

    const stopAcquire = useCallback(() => {
        handleSetValueRequest(`${prefix}:cam1:Acquire`, 0);
    }, [handleSetValueRequest, prefix]);

    const onSubmitSettings = useCallback(handleSetValueRequest, [handleSetValueRequest]);

    const cameraControlPV = devices[`${prefix}:cam1:Acquire`];

    return {
        handleSetValueRequest,
        devices,
        startAcquire,
        stopAcquire,
        onSubmitSettings,
        cameraControlPV,
    };
}
