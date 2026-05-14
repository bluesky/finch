import { useState } from 'react';

import { Tiled } from '@blueskyproject/tiled';
import PlotlyHeatmapTiled from '@/components/PlotlyHeatmapTiled';

export type TiledHeatmapSelectorProps = {
    /** The base url for the Tiled Viewer */
    tiledBaseUrl?: string;
};

export default function TiledHeatmapSelector({ tiledBaseUrl }: TiledHeatmapSelectorProps) {
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
    return (
        <section className="flex flex-wrap justify-around gap-4">
            <Tiled
                tiledBaseUrl={tiledBaseUrl}
                onSelectCallback={(links) => setSelectedUrl(links.self)}
                size="medium"
                pageLimit={30}
            />
            <PlotlyHeatmapTiled url={selectedUrl || ''} />
        </section>
    );
}
