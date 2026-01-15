import TestPlotlyHeatmap from "@/components/HeatmapTest/TestPlotlyHeatmap";
import TestH5Heatmap from "@/components/HeatmapTest/TestH5Heatmap";

export default function HeatmapTest() {
    return (
        <div>
            <h1>Heatmap Test</h1>
            <TestPlotlyHeatmap />
            <TestH5Heatmap />
        </div>
    );
}
