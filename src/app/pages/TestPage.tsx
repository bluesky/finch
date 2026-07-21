// import DeviceControllerBox from '@/components/DeviceControllerBox';
// import SignalMonitorPlotDevice from '@/components/SignalMonitorPlotDevice';
// import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import { TiledWriterDetImageHeatmap } from 'react-vite-library';
export default function TestPage() {
    return (
        <TiledWriterDetImageHeatmap
            blueskyRunId="6119e749-d4e6-4e2e-bee9-68375b3087f5"
            isRunFinished={true}
            tiledBaseUrl="https://tiled-demo.nsls2.bnl.gov/api/v1"
            tiledInitialPath="bmm"
            className="max-w-fit max-h-fit"
        />
    );
}
