import { useState } from "react";

import { Tiled } from "@blueskyproject/tiled";
import PlotlyHeatmapTiled from "@/components/PlotlyHeatmapTiled";

export default function TiledHeatmapSelector({}) {
    const [ selectedUrl, setSelectedUrl ] = useState<string | null>(null);
    return (
        <section className="flex flex-wrap justify-around gap-4">
            {/* <Tiled apiKey="8f7911ebce87bb525c210fb2cf80c9d9678cd80726f265e11999b9eb9eea4c49ca745a06" tiledBaseUrl="https://tiled.computing.als.lbl.gov/api/v1" initialPath="BL531" onSelectCallback={(links)=> setSelectedUrl(links.self)} size="medium"/> */}
            <Tiled tiledBaseUrl="http://192.168.10.155:8000/api/v1" onSelectCallback={(links)=> setSelectedUrl(links.self)} size="medium"/>
            <PlotlyHeatmapTiled url={selectedUrl || ""} />
        </section>
    )
}