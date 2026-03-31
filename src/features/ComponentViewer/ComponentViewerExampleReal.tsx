
import ComponentViewer from "@/features/ComponentViewer/ComponentViewer";
import { TestItemCollection } from "@/features/ComponentViewer/types";

import CameraContainer from "@/components/Camera/CameraContainer";
import ReactEDM from "@/components/ReactEDM/ReactEDM";
import TiledHeatmapSelector from "@/features/TiledHeatmapSelector";
import TIFFContainer from "@/components/Camera/TIFFContainer";
import QueueServer from "@/components/QServer/QueueServer";

export default function ComponentViewerExampleReal() {
     
    const testItems: TestItemCollection = {
        RealCam1: {
            name: 'EPICS Area Detector Array Stream',
            element:            
                <article className="flex flex-col items-center w-fit">
                    <h2 className="text-3xl text-slate-600 mb-4">ADSimDetector</h2>
                    <CameraContainer prefix='13SIM1' enableControlPanel={true} enableSettings={true} canvasSize="medium"/>
                </article>,
            info: 'This component displays an EPICS area detector stream using the CameraContainer component. This test requires Ophyd Websocket and the ADSimDetector running.',
        },
        RealCam2: {
            name: 'EPICS Area Detector Array Stream',
            element:    
                <article className="flex flex-col items-center w-fit">
                    <h2 className="text-3xl text-slate-600 mb-4">ADSimDetector</h2>
                    <CameraContainer prefix='13SIM1' enableControlPanel={false} enableSettings={false} canvasSize="medium"/>
                    <ReactEDM P="13SIM1" R="cam1" fileName="ADBase.adl" />
                </article>,
            info: 'This component displays an EPICS area detector stream using the CameraContainer component. This test requires Ophyd Websocket and the ADSimDetector running.',
        },
        RealCam3: {
            name: 'EPICS Area Detector TIFF Stream',
            element: <TIFFContainer prefix='13PIL1' enableControlPanel={true} enableSettings={false} canvasSize="medium"/>,
            info: 'This component displays the most recent TIFF file from an EPICS area detector using the TIFFContainer component. This test requires Ophyd Websocket and the 13PIL1 detector running.',
            
        },
        RealTiled1: {
            name: 'Tiled Heatmap Selector',
            element: <TiledHeatmapSelector />,
            info: 'This component allows users to select from available heatmaps in a Tiled server and displays the selected heatmap. This test requires a Tiled server containing 2D+ array data.',
        },
        RealQueue1: {
            name: 'Queue Server Dashboard Interface',
            element: <QueueServer className="h-[1000px] w-[1000px]"/>,
            info: 'This component connects to the Bluesky Queue Server through its python based REST API, and shows live console updates through the Ophyd Websocket. This test requires the Queue Server, the Queue Server REST API, and Ophyd Websocket running.',
        }

    };
    return (
        <ComponentViewer testItems={testItems} className="w-full max-w-full h-full" namespace="Real"/>
    )
}