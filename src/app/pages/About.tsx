import { useNavigate } from "react-router";

import Paper from "@/components/Paper";
import PlotlyScatter from "@/components/PlotlyScatter";
import SignalMonitorPlot from "@/components/SignalMonitorPlot";
import Plot, { PlotParams } from 'react-plotly.js';
import ADLView from "@/components/ADLController/ADLView";
import { cameraDeviceData } from "@/components/Camera/utils/cameraDeviceData";
import CameraContainer from "@/components/Camera/CameraContainer";
import ADLController from "@/components/ADLController/ADLController";
import Beamstop from "@/features/Beamstop";



export default function About() {

    const navigate = useNavigate();
    const data: PlotParams["data"] = [{
        x: [1, 2, 3],
        y: [2, 6, 3],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'red' },
    }];

    return (

        <>
        <Beamstop stackVertical={false} enableBestOption={true} beamstopXTitle="Beamstop - X" beamstopYTitle="Beamstop - Y" beamstopCurrentName="bl201-beamstop:current" beamstopXName="bl531_xps2:beamstop_x_mm" beamstopYName="bl531_xps2:beamstop_y_mm" />  
        </>
        
    )
}