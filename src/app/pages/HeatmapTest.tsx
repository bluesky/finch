import TestPlotlyHeatmap from "@/components/HeatmapTest/TestPlotlyHeatmap";
import TestH5Heatmap from "@/components/HeatmapTest/TestH5Heatmap";
import TestH5HeatmapPreFormatted from "@/components/HeatmapTest/TestH5HeatmapPreFormatted";

import {smallSizeDim, medSizeDim, largeSizeDim, smallHeatmapData, medHeatmapData, largeHeatmapData, smallH5HeatmapData, smallH5HeatmapDomain, medH5HeatmapData, medH5HeatmapDomain, largeH5HeatmapData, largeH5HeatmapDomain } from "@/components/HeatmapTest/utils/createSampleHeatmapData";

export default function HeatmapTest() {
    return (
        <section className="flex flex-col items-center gap-6">
            <h1>Heatmap Test</h1>
            <span className="flex justify-evenly bg-slate-200 py-8 px-4">
                <TestPlotlyHeatmap title={"Plotly - " + smallSizeDim + "x" + smallSizeDim} arrayData={smallHeatmapData} onInitializedCallback={(time) => console.log('Plotly Heatmap initialized in', time, 'ms')} />
                <TestPlotlyHeatmap title={"Plotly - " + medSizeDim + "x" + medSizeDim} arrayData={medHeatmapData} onInitializedCallback={(time) => console.log('Plotly Heatmap initialized in', time, 'ms')} />
                <TestPlotlyHeatmap title={"Plotly - " + largeSizeDim + "x" + largeSizeDim} arrayData={largeHeatmapData} onInitializedCallback={(time) => console.log('Plotly Heatmap initialized in', time, 'ms')} />
            </span>
            <span className="flex justify-evenly bg-slate-200 py-8 px-4">
                <TestH5Heatmap title={"H5 raw array - " + smallSizeDim + "x" + smallSizeDim} arrayData={smallHeatmapData} onInitializedCallback={(time) => console.log('H5 Heatmap initialized in', time, 'ms')} />
                <TestH5Heatmap title={"H5 raw array - " + medSizeDim + "x" + medSizeDim} arrayData={medHeatmapData} onInitializedCallback={(time) => console.log('H5 Heatmap initialized in', time, 'ms')} />
                <TestH5Heatmap title={"H5 raw array - " + largeSizeDim + "x" + largeSizeDim} arrayData={largeHeatmapData} onInitializedCallback={(time) => console.log('H5 Heatmap initialized in', time, 'ms')} />
            </span>
            <span className="flex justify-evenly bg-slate-200 py-8 px-4">
                <TestH5HeatmapPreFormatted title={"H5 Preformatted - " + smallSizeDim + "x" + smallSizeDim} arrayDataH5={smallH5HeatmapData} h5Domain={smallH5HeatmapDomain} onInitializedCallback={(time) => console.log('H5 Preformatted Heatmap initialized in', time, 'ms')} />
                <TestH5HeatmapPreFormatted title={"H5 Preformatted - " + medSizeDim + "x" + medSizeDim} arrayDataH5={medH5HeatmapData} h5Domain={medH5HeatmapDomain} onInitializedCallback={(time) => console.log('H5 Preformatted Heatmap initialized in', time, 'ms')} />
                <TestH5HeatmapPreFormatted title={"H5 Preformatted - " + largeSizeDim + "x" + largeSizeDim} arrayDataH5={largeH5HeatmapData} h5Domain={largeH5HeatmapDomain} onInitializedCallback={(time) => console.log('H5 Preformatted Heatmap initialized in', time, 'ms')} />
            </span>
        </section>
    );
}
