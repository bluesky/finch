import ComponentViewer from '@/features/ComponentViewer/ComponentViewer';
import { TestItemCollection } from '@/features/ComponentViewer/types';

import CameraContainer from '@/components/Camera/CameraContainer';
import ReactEDM from '@/components/ReactEDM/ReactEDM';
import TiledHeatmapSelector from '@/features/TiledHeatmapSelector';
import TIFFContainer from '@/components/Camera/TIFFContainer';
import QueueServer from '@/components/QServer/QueueServer';
import SignalMonitorPlotPV from '@/components/SignalMonitorPlotPV';
import Hexapod from '@/components/Hexapod/Hexapod';
import BeamEnergyOphyd from '@/components/BeamEnergy/BeamEnergyOphyd';
import Histogram from '@/components/Histogram/Histogram';
import Beamstop from '../Beamstop';
import TiledLinePlotMaker from '@/features/TiledLinePlotMaker';
export default function ComponentViewerExampleReal() {
    const testItems: TestItemCollection = {
        RealCam1: {
            name: 'EPICS Area Detector Array Stream',
            element: (
                <article className="flex flex-col items-center w-fit">
                    <h2 className="text-3xl text-slate-600 mb-4">ADSimDetector</h2>
                    <CameraContainer
                        prefix="13SIM1"
                        enableControlPanel={true}
                        enableSettings={true}
                        canvasSize="medium"
                    />
                </article>
            ),
            info: 'This component displays an EPICS area detector stream using the CameraContainer component. This test requires Ophyd Websocket and the ADSimDetector running.',
        },
        RealCam2: {
            name: 'EPICS Area Detector Array Stream',
            element: (
                <article className="flex flex-col items-center w-fit">
                    <h2 className="text-3xl text-slate-600 mb-4">ADSimDetector</h2>
                    <CameraContainer
                        prefix="13SIM1"
                        enableControlPanel={false}
                        enableSettings={false}
                        canvasSize="medium"
                    />
                    <ReactEDM P="13SIM1" R="cam1" fileName="ADBase.adl" />
                </article>
            ),
            info: 'This component displays an EPICS area detector stream using the CameraContainer component. This test requires Ophyd Websocket and the ADSimDetector running.',
        },
        RealCam3: {
            name: 'EPICS Area Detector TIFF Stream',
            element: (
                <TIFFContainer
                    prefix="13PIL1"
                    enableControlPanel={true}
                    enableSettings={false}
                    canvasSize="medium"
                />
            ),
            info: 'This component displays the most recent TIFF file from an EPICS area detector using the TIFFContainer component. This test requires Ophyd Websocket and the 13PIL1 detector running.',
        },
        RealTiled1: {
            name: 'Tiled Heatmap Selector',
            element: <TiledHeatmapSelector />,
            info: 'This component allows users to select from available heatmaps in a Tiled server and displays the selected heatmap. This test requires a Tiled server containing 2D+ array data.',
        },
        RealTiled2: {
            name: 'Tiled Line Plot Maker',
            element: <TiledLinePlotMaker />,
            info: 'This component allows users to select from available 1D array data in a Tiled server and displays the selected data as a line plot. This test requires a Tiled server containing 1D array data. The Tiled data must be bluesky runs written from Tiled Writer',
        },
        RealQueue1: {
            name: 'Queue Server Dashboard Interface',
            element: <QueueServer className="h-[1000px] w-[1000px]" />,
            info: 'This component connects to the Bluesky Queue Server through its python based REST API, and shows live console updates through the Ophyd Websocket. This test requires the Queue Server, the Queue Server REST API, and Ophyd Websocket running.',
        },
        RealMonitor1: {
            name: 'Beamstop Diode Current Monitor',
            element: (
                <SignalMonitorPlotPV
                    pv={'bl201-beamstop:current'}
                    className={'max-h-96 w-[48rem] rounded-lg'}
                    numVisiblePoints={200}
                    tickTextIntervalSeconds={30}
                    yAxisTitle="Current"
                />
            ),
            info: 'This component displays a live-updating plot of the current readback from the beamstop diode. This test requires Ophyd Websocket and a PV providing current readback data.',
        },
        RealMonitor2: {
            name: 'Histogram',
            element: (
                <Histogram
                    arrayPV="dxpMercury:mca1.VAL"
                    acquirePV="dxpMercury:StartAll"
                    exposurePV="dxpMercury:mca1.ERES"
                    showDeviceController={false}
                    showPlotSettings={false}
                />
            ),
            info: 'This component displays a live-updating histogram of the data from an EPICS PV. This test requires Ophyd Websocket and a PV providing array data along with an acquire PV.',
        },
        RealControl1: {
            name: 'Hexapod Controller',
            element: <Hexapod />,
            info: 'This component provides controls for moving a hexapod device in 6 axes. This test requires Ophyd Websocket and a hexapod device running.',
        },
        RealControl2: {
            name: 'Beam Energy Controller',
            element: <BeamEnergyOphyd />,
            info: 'This component provides controls for adjusting the beam energy and monitoring the readback. This test requires Ophyd Websocket and the monochromator connected and instantied as an ophyd device.',
        },
        RealControl3: {
            name: 'Beamstop Controller',
            element: (
                <Beamstop
                    stackVertical={false}
                    enableBestOption={true}
                    beamstopXTitle="Beamstop - X"
                    beamstopYTitle="Beamstop - Y"
                    beamstopCurrentName="bl201-beamstop:current"
                    beamstopXName="bl531_xps2:beamstop_x_mm"
                    beamstopYName="bl531_xps2:beamstop_y_mm"
                />
            ),
            info: 'This component provides controls for adjusting the beamstop position and monitoring the readback of the beamstop diode. A button can be clicked to move the beamstop to the position of the largest recorded diode reading. This test requires Ophyd Websocket and the beamstop connected.',
        },
    };
    return (
        <ComponentViewer
            testItems={testItems}
            className="w-full max-w-full h-full"
            namespace="Real"
        />
    );
}
