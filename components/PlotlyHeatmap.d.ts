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
    /** Tailwind ClassName, width of the plot container */
    width?: `w-${string}`;
    /** Tailwind ClassName, height of the plot container */
    height?: `h-${string}`;
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
};
export default function PlotlyHeatmap({ array, //2d array [[1, 2, 3], [2, 2 1]]
title, xAxisTitle, yAxisTitle, colorScale, //plotly compatible colorScale
verticalScaleFactor, // Adjusts the height of the plot. ex) A factor of 2 makes each row in the array take up 2 pixels
width, height, showTicks, tickStep, showScale, lockPlotHeightToParent, //locks the height of the plot to the height of the container, should not be set to True if lockPlotWidthHeightToInputArray is on
lockPlotWidthHeightToInputArray, }: PlotlyHeatmapProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PlotlyHeatmap.d.ts.map