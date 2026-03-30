
import ComponentViewer from "@/features/ComponentViewer/ComponentViewer";
import { TestItemCollection } from "@/features/ComponentViewer/types";

import CameraContainer from "@/components/Camera/CameraContainer";
import ReactEDM from "@/components/ReactEDM/ReactEDM";
import TiledHeatmapSelector from "@/features/TiledHeatmapSelector";
import TIFFContainer from "@/components/Camera/TIFFContainer";

export default function ComponentViewerExampleReal() {
     
    const testItems: TestItemCollection = {
        RealCam1: {
            name: 'EPICS Area Detector Array Stream',
            element:            
                <article className="flex flex-col items-center w-fit">
                    <h2 className="text-3xl font-bold mb-4 text-white">ADSimDetector</h2>
                    <CameraContainer prefix='13SIM1' enableControlPanel={true} enableSettings={true} canvasSize="medium"/>
                </article>,
            info: 'This component displays an EPICS area detector stream using the CameraContainer component. This test requires Ophyd Websocket and the ADSimDetector running.',
        },
        RealCam2: {
            name: 'EPICS Area Detector Array Stream',
            element:    
                <article className="flex flex-col items-center w-fit">
                    <h2 className="text-3xl font-bold mb-4 text-white">ADSimDetector</h2>
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

    };
    return (
        <ComponentViewer testItems={testItems} className="w-full max-w-full" namespace="Real"/>
    )
}