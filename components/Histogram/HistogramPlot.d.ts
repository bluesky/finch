type HistorgramPlotProps = {
    /** Histogram counts array where each index is a channel and each value is the count. `null` renders a placeholder. */
    arrayData: number[] | null;
    /** When `true`, renders `HistogramPlotSettings` above the plot. */
    showPlotSettings?: boolean;
    /** Additional class names applied to the outer container element. */
    className?: string;
    /** Additional class names applied to the `HistogramPlotSettings` element. */
    classNameSettings?: string;
    /** Plot title displayed above the chart. Defaults to `"Histogram"`. */
    title?: string;
    /** Number of significant figures for sum displays. Defaults to `6`. */
    precision?: number;
};
export default function HistogramPlot({ arrayData, showPlotSettings, className, classNameSettings, title, precision, }: HistorgramPlotProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=HistogramPlot.d.ts.map