export type PlotlyHeatmapProps = {
    /** A nested array displayed top-down */
    array: number[][];
    /** The plot title */
    title?: string;
    /** x axis title, adds padding to bottom */
    xAxisTitle?: string;
    /** y axis title, adds padding to left */
    yAxisTitle?: string;
    /** Plotly specific colorscales */
    colorScale?: 'Viridis' | 'YlOrRd' | 'Cividis' | 'Hot' | 'Electric' | 'Plasma';
    /** Adjust the height of the plot. ex) a factor of 2 makes each row in the array take up 2 pixels */
    verticalScaleFactor?: number;
    /** Should tick marks show up? */
    showTicks?: boolean;
    /** Spacing between tick marks along data  */
    tickStep?: number;
    /** Should the visual plot be locked to the height of the parent container? */
    lockPlotHeightToParent?: boolean;
    /** Should each data point be locked in to an exact pixel? Don't use this with 'lockPlotHeightToParent' */
    lockPlotWidthHeightToInputArray?: boolean;
    /** Should the color scale show up? it will take up some space to the right of the plot */
    showScale?: boolean;
    /** Enable log scale slider control */
    enableLogScale?: boolean;
    /** Flip y axis */
    flipYAxis?: boolean;
    /** Additional CSS classes applied to the root container. */
    className?: string;
    /** Additional CSS classes applied to the optional controller panel. */
    classNameControls?: string;
};
export default function PlotlyHeatmap({ array, title, xAxisTitle, yAxisTitle, colorScale, verticalScaleFactor, showTicks, tickStep, showScale, lockPlotHeightToParent, lockPlotWidthHeightToInputArray, enableLogScale, flipYAxis, className, classNameControls, ...props }: PlotlyHeatmapProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PlotlyHeatmap.d.ts.map