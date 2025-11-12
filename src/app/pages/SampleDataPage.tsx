import TiledHeatmapSelector from "@/features/TiledHeatmapSelector";
import TiledScatterPlot from "@/components/Tiled/TiledScatterPlot";

export default function SampleDataPage() {
    return (
        <div>
            <TiledScatterPlot path="/short_table"  tiledTrace={{ x: "A", y: "B" }} />
            <TiledHeatmapSelector />
        </div>
    )
}