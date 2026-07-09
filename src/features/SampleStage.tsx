import { useMemo } from 'react';

import DeviceControllerBox from '@/components/DeviceControllerBox';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import { deviceIcons } from '@/assets/icons';

export type SampleStageProps = {
    /** Sample X motor setpoint PV (mm). */
    sampleXName: string;
    /** Sample Y motor setpoint PV (mm). */
    sampleYName: string;
    sampleXTitle?: string;
    sampleYTitle?: string;
    /** Lay the two axis controls out side by side instead of stacked. */
    stackVertical?: boolean;
};

/**
 * X/Y control for the sample-holder stage. Wires two DeviceControllerBox cards
 * to the sample motors and drives the holder graphic in <EndstationDisplay />,
 * which tracks the same PVs' readbacks. Mirrors the motor wiring in
 * [src/features/Beamstop.tsx].
 */
export default function SampleStage({
    sampleXName,
    sampleYName,
    sampleXTitle = 'Sample - X',
    sampleYTitle = 'Sample - Y',
    stackVertical = false,
}: SampleStageProps) {
    const sampleXNameRBV = useMemo(() => sampleXName + '.RBV', [sampleXName]);
    const sampleYNameRBV = useMemo(() => sampleYName + '.RBV', [sampleYName]);
    const deviceNameList = useMemo(
        () => [sampleXName, sampleYName, sampleXNameRBV, sampleYNameRBV],
        [sampleXName, sampleYName, sampleXNameRBV, sampleYNameRBV],
    );
    const { devices, handleSetValueRequest, toggleDeviceLock } = useOphydPVSocket(deviceNameList);

    const xDevice = devices[sampleXName];
    const yDevice = devices[sampleYName];
    if (!xDevice || !yDevice) return null;

    return (
        <section className={`flex gap-4 ${stackVertical ? 'flex-col' : 'flex-wrap justify-center'}`}>
            <DeviceControllerBox
                device={xDevice}
                deviceRBV={devices[sampleXNameRBV]}
                handleSetValueRequest={handleSetValueRequest}
                handleLockClick={toggleDeviceLock}
                svgIcon={deviceIcons.sampleHolderX}
                title={sampleXTitle}
            />
            <DeviceControllerBox
                device={yDevice}
                deviceRBV={devices[sampleYNameRBV]}
                handleSetValueRequest={handleSetValueRequest}
                handleLockClick={toggleDeviceLock}
                svgIcon={deviceIcons.sampleHolderY}
                title={sampleYTitle}
            />
        </section>
    );
}
