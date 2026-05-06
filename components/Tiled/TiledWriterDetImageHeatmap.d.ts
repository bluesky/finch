type TiledWriterDetImageHeatmapProps = {
    /** Bluesky run UID used to locate the `det_image` array in Tiled. `null` renders a waiting message. */
    blueskyRunId: string | null;
    /** When `true`, disables live polling because the run is already complete. Defaults to `true`. */
    isRunFinished?: boolean;
    /** Base URL of the Tiled server (e.g. `'http://localhost:8000/api/v1'`). */
    tiledBaseUrl?: string;
    /** Milliseconds between Tiled data refetches while the run is ongoing. */
    pollingIntervalMs?: number;
    /** Additional class names applied to the outer container element. */
    className?: string;
    /** Additional class names applied to the `PlotlyHeatmapTiled` element. */
    plotClassName?: string;
    /** Controls the pixel dimensions of the rendered heatmap. Defaults to `'medium'`. */
    size?: 'small' | 'medium' | 'large';
};
export default function TiledWriterDetImageHeatmap({ blueskyRunId, isRunFinished, tiledBaseUrl, pollingIntervalMs, className, plotClassName, size }: TiledWriterDetImageHeatmapProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TiledWriterDetImageHeatmap.d.ts.map