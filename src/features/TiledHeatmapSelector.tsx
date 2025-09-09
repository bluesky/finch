import { useState } from "react";

import { Tiled } from "@blueskyproject/tiled";
import PlotlyHeatmapTiled from "@/components/PlotlyHeatmapTiled";

export default function TiledHeatmapSelector({}) {
    const [ selectedUrl, setSelectedUrl ] = useState<string | null>(null);
    return (
        <section className="flex flex-wrap justify-around gap-4">
            <Tiled onSelectCallback={(links)=> setSelectedUrl(links.self)} size="medium"/>
            <PlotlyHeatmapTiled url={selectedUrl || ""} />
        </section>
    )
}