import { useState, useMemo, useEffect } from 'react';

import SignalMonitorPlotPV from '@/components/SignalMonitorPlotPV';
import DeviceControllerBox from '@/components/DeviceControllerBox';
import EnergyVsCurrentPlotPV from '@/features/EnergyVsCurrentPlotPV';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import Button from '@/components/Button';

import { deviceIcons } from '@/assets/icons';

export type BeamstopProps = {
    beamstopXName: string;
    beamstopYName: string;
    beamstopCurrentName: string;
    /**
     * Optional writable beam-energy PV. When provided, an energy control and a
     * live Energy-vs-Current plot are rendered. Selecting an energy shifts the
     * beam (via the DCM Bragg angle), changing the diode current.
     */
    beamstopEnergyName?: string;
    beamstopXIcon?: JSX.Element;
    beamstopYIcon?: JSX.Element;
    beamstopXTitle?: string;
    beamstopYTitle?: string;
    beamstopEnergyTitle?: string;
    enableBestOption?: boolean;
    stackVertical?: boolean;
};

export default function Beamstop({
    beamstopXName,
    beamstopYName,
    beamstopCurrentName,
    beamstopEnergyName,
    beamstopXIcon = deviceIcons.beamstopX,
    beamstopYIcon = deviceIcons.beamstopY,
    beamstopXTitle,
    beamstopYTitle,
    beamstopEnergyTitle = 'Beam Energy',
    enableBestOption,
    stackVertical = true,
}: BeamstopProps) {
    const beamstopXNameRBV = useMemo(() => beamstopXName + '.RBV', [beamstopXName]);
    const beamstopYNameRBV = useMemo(() => beamstopYName + '.RBV', [beamstopYName]);
    const beamstopEnergyRBV = useMemo(
        () => (beamstopEnergyName ? beamstopEnergyName + '.RBV' : undefined),
        [beamstopEnergyName],
    );
    const deviceNameList = useMemo(
        () => [
            beamstopXName,
            beamstopYName,
            beamstopXNameRBV,
            beamstopYNameRBV,
            beamstopCurrentName,
            ...(beamstopEnergyName && beamstopEnergyRBV
                ? [beamstopEnergyName, beamstopEnergyRBV]
                : []),
        ],
        [
            beamstopXName,
            beamstopYName,
            beamstopXNameRBV,
            beamstopYNameRBV,
            beamstopCurrentName,
            beamstopEnergyName,
            beamstopEnergyRBV,
        ],
    );
    const { devices, handleSetValueRequest, toggleDeviceLock } = useOphydPVSocket(deviceNameList);
    const [bestCurrent, setBestCurrent] = useState<number | null>(null);
    const [bestXValue, setBestXValue] = useState<number | null>(null);
    const [bestYValue, setBestYValue] = useState<number | null>(null);

    const goToBest = () => {
        if (bestXValue !== null) {
            handleSetValueRequest(beamstopXName, bestXValue);
        }
        if (bestYValue !== null) {
            handleSetValueRequest(beamstopYName, bestYValue);
        }
    };

    useEffect(() => {
        const currentDevice = devices[beamstopCurrentName];
        const xDevice = devices[beamstopXName];
        const yDevice = devices[beamstopYName];
        // The signal at 531 is a negative number, so default to doing absolute value comparisons
        if (
            currentDevice &&
            currentDevice.value !== null &&
            typeof currentDevice.value === 'number'
        ) {
            if (bestCurrent === null || Math.abs(currentDevice.value) > Math.abs(bestCurrent)) {
                setBestCurrent(currentDevice.value);
                if (xDevice && xDevice.value !== null && typeof xDevice.value === 'number') {
                    setBestXValue(xDevice.value);
                }
                if (yDevice && yDevice.value !== null && typeof yDevice.value === 'number') {
                    setBestYValue(yDevice.value);
                }
            }
        }
    }, [devices, beamstopCurrentName, beamstopXName, beamstopYName, bestCurrent]);
    return (
        <section
            className={`w-full h-full ${stackVertical ? 'flex-col' : 'max-w-[1200px] flex-wrap items-center justify-center'} flex`}
        >
            <article
                className={`${stackVertical ? 'w-full h-1/2' : 'w-1/2 h-full justify-start'}   flex flex-col p-8 min-w-96`}
            >
                <span className="text-4xl flex justify-start space-x-2 ">
                    <p> Beamstop Current: </p>

                    <p>
                        {devices[beamstopCurrentName] &&
                            Number(devices[beamstopCurrentName].value).toPrecision(4)}{' '}
                        {devices[beamstopCurrentName] &&
                            devices[beamstopCurrentName].units?.slice(0, 3)}
                    </p>
                </span>
                <SignalMonitorPlotPV
                    pv={beamstopCurrentName}
                    className={`${stackVertical ? 'h-full' : 'h-fit'} min-w-96`}
                    numVisiblePoints={200}
                    tickTextIntervalSeconds={30}
                />
                {enableBestOption && (
                    <>
                        <p>
                            Best Beamstop Current Value:{' '}
                            {bestCurrent ? bestCurrent.toPrecision(5) : 'N/A'}{' '}
                            {devices[beamstopCurrentName] && devices[beamstopCurrentName].units}
                        </p>
                        <p>
                            Best Beamstop X value: {bestXValue ? bestXValue.toPrecision(4) : 'N/A'}{' '}
                            {devices[beamstopXName] && devices[beamstopXName].units}
                        </p>
                        <p>
                            Best Beamstop Y value: {bestYValue ? bestYValue.toPrecision(4) : 'N/A'}{' '}
                            {devices[beamstopYName] && devices[beamstopYName].units}
                        </p>
                        <div className="flex justify-center items-center py-8">
                            <Button cb={goToBest} text="Go To Best" />
                        </div>
                    </>
                )}
            </article>
            <article
                className={`${stackVertical ? 'w-full pt-4 max-h-1/2 flex flex-row justify-center gap-8' : 'w-1/2 h-full flex flex-col items-center justify-start gap-6'} `}
            >
                <DeviceControllerBox
                    title={beamstopXTitle}
                    svgIcon={beamstopXIcon}
                    device={devices[beamstopXName]}
                    deviceRBV={devices[beamstopXNameRBV]}
                    handleLockClick={toggleDeviceLock}
                    handleSetValueRequest={handleSetValueRequest}
                />
                <DeviceControllerBox
                    title={beamstopYTitle}
                    svgIcon={beamstopYIcon}
                    device={devices[beamstopYName]}
                    deviceRBV={devices[beamstopYNameRBV]}
                    handleLockClick={toggleDeviceLock}
                    handleSetValueRequest={handleSetValueRequest}
                />
                {beamstopEnergyName && (
                    <DeviceControllerBox
                        title={beamstopEnergyTitle}
                        device={devices[beamstopEnergyName]}
                        deviceRBV={beamstopEnergyRBV ? devices[beamstopEnergyRBV] : undefined}
                        handleLockClick={toggleDeviceLock}
                        handleSetValueRequest={handleSetValueRequest}
                    />
                )}
            </article>
            {beamstopEnergyName && (
                <article
                    className={`${stackVertical ? 'w-full' : 'w-full'} flex flex-col p-8 min-w-96`}
                >
                    <EnergyVsCurrentPlotPV
                        energyPv={beamstopEnergyName}
                        currentPv={beamstopCurrentName}
                        beamstopXRbvPv={beamstopXNameRBV}
                        beamstopYRbvPv={beamstopYNameRBV}
                        className="min-w-96"
                    />
                </article>
            )}
        </section>
    );
}
