export type PlotlyHeatmapProps = {
    /** Tiled metadata URL (e.g. /api/v1/metadata/my_image). Pass null to show an empty placeholder. */
    url: string | null;
    /** Additional CSS classes applied to the root section element. */
    className?: string;
    /** Controls the fixed dimensions of the component. Defaults to 'medium'. */
    size?: 'small' | 'medium' | 'large';
    /** When true, periodically polls the metadata URL to detect shape changes and auto-advance to the latest frame. */
    enablePolling?: boolean;
    /** Interval in milliseconds between polling requests. Defaults to 2000. */
    pollingIntervalMs?: number;
};
export default function PlotlyHeatmapTiled({ url, className, size, enablePolling, pollingIntervalMs }: PlotlyHeatmapProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PlotlyHeatmapTiled.d.ts.map