import ComponentViewer from '@/features/ComponentViewer/ComponentViewer';
import { TestItemCollection } from '@/features/ComponentViewer/types';

import DeviceControllerBox from '@/components/DeviceControllerBox';
import TableDeviceController from '@/components/TableDeviceController';
import BeamEnergyPV from '@/components/BeamEnergy/BeamEnergyPV';
import Hexapod from '@/components/Hexapod/Hexapod';
import SignalMonitorPlotDevice from '@/components/SignalMonitorPlotDevice';
import Histogram from '@/components/Histogram/Histogram';
import { CubeTransparent } from '@phosphor-icons/react';

import useSimOphydPVSocket from '@/api/ophyd/useSimOphydPVSocket';
const SIM_DEVICES = ['sineSignal', 'noisySignal', 'motor1', 'motor2'];

export default function ComponentViewerExampleSim() {
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
        useSimOphydPVSocket(SIM_DEVICES);
    const testItems: TestItemCollection = {
        SimControl1: {
            name: 'Generic Device Controller',
            element: (
                <DeviceControllerBox
                    device={devices['motor1']}
                    handleLockClick={toggleDeviceLock}
                    handleSetValueRequest={handleSetValueRequest}
                    svgIcon={<CubeTransparent size={72} />}
                />
            ),
            info: 'This component accpets a preconnected device from useOphydSocketPV or useOphydSocketDevice to display the current value and allow simple controls. This display uses a simulated motor device.',
        },
        SimControl2: {
            name: 'Device Controller Table',
            element: (
                <TableDeviceController
                    devices={devices}
                    toggleDeviceLock={toggleDeviceLock}
                    handleSetValueRequest={handleSetValueRequest}
                    toggleExpand={toggleExpand}
                />
            ),
            info: 'This component accpets a preconnected device from useOphydSocketPV or useOphydSocketDevice to display the current value and allow simple controls. This display uses several simulated motor devices.',
        },
        SimControl3: {
            name: 'Beam Energy Controller',
            element: <BeamEnergyPV pv="fake mirror" demo={true} />,
            info: 'This component accepts a preconnected device from useOphydSocketPV or useOphydSocketDevice to display the current value and allow simple controls. This display uses a demo mode with a simulated device.',
        },
        SimControl4: {
            name: 'Hexapod Controller',
            element: <Hexapod prefix="fake hexapod" demo={true} />,
            info: 'This component accepts a prefix intended for an EPICS hexapod device, and connects via useOphydSocketPV. This display utilizes a demo mode with a simulated device.',
        },
        SimMonitor1: {
            name: 'Signal Monitor Plot',
            element: <SignalMonitorPlotDevice device={devices['sineSignal']} />,
            info: 'This component accepts a preconnected device from useOphydSocketPV or useOphydSocketDevice and plots the value over time. This display shows a simulated sine wave device.',
        },
        SimMonitor2: {
            name: 'Histogram',
            element: (
                <Histogram
                    arrayPV="fake array"
                    acquirePV="fake acquire"
                    exposurePV="fake exposure"
                    demo={true}
                />
            ),
            info: 'This component accepts an array PV and an acquire control PV for EPICS systems to display a histogram plot. This display uses a demo mode with simulated histogram data.',
        },
    };
    return <ComponentViewer testItems={testItems} className="w-full max-w-full" namespace="Sim" />;
}
