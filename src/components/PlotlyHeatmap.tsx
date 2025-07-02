import React, { useRef, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

export type PlotlyHeatmapProps = {
    /** A nested array displayed top-down */
    array: number[][],
    /** Optional 1-d array for x values, use when data is not linearly spaced */
    xArray: number[],
    /** Option 1-d array for y values, use when data is not linearly spaced */
    yArray: number[],
    /** The plot title */
    title?: string,
    /** x axis title, adds padding to bottom */
    xAxisTitle?: string,
    /** y axis title, adds padding to left */
    yAxisTitle?: string,
    /** Plotly specific colorscales */
    colorScale?: 'Viridis' | 'YlOrRd' | 'Cividis' | 'Hot' | 'Electric' | 'Plasma',
    /** Adjust the height of the plot. ex) a factor of 2 makes each row in the array take up 2 pixels */
    verticalScaleFactor?: number,
    /** Tailwind ClassName, width of the plot container */
    width?: `w-${string}`,
    /** Tailwind ClassName, height of the plot container */
    height?: `h-${string}`,
    /** Should tick marks show up? */
    showTicks?: boolean,
    /** Spacing between tick marks along data  */
    tickStep?: number,
    /** Should the visual plot be locked to the height of the parent container? */
    lockPlotHeightToParent?: boolean,
    /** Should each data point be locked in to an exact pixel? Don't use this with 'lockPlotHeightToParent' */
    lockPlotWidthHeightToInputArray?: boolean,
    /** Should the color scale show up? it will take up some space to the right of the plot */
    showScale?: boolean
    /**Minimum value to set the scaling for the heatmap colors */
    zMin?: number,
    zMax?: number,
}

//TODO: there are some issues with the display when zooming out
export default function PlotlyHeatmap({
    array, //2d array [[1, 2, 3], [2, 2 1]]
    xArray,
    yArray,
    title = '',
    xAxisTitle = '',
    yAxisTitle = '',
    colorScale = 'Viridis', //plotly compatible colorScale
    verticalScaleFactor = 0.1, // Adjusts the height of the plot. ex) A factor of 2 makes each row in the array take up 2 pixels
    width = 'w-full', 
    height='h-full',
    showTicks = false,
    tickStep = 100,
    showScale = true,
    lockPlotHeightToParent=false, //locks the height of the plot to the height of the container, should not be set to True if lockPlotWidthHeightToInputArray is on
    lockPlotWidthHeightToInputArray=false, //restricts the maximum view of the plot so that it never exceeds a 1 pixel to 1 array element density
    zMin,
    zMax
}: PlotlyHeatmapProps) {
    const plotContainer = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 }); //applied to plot, not the container

    // Hook to update dimensions of plot dynamically
    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });
        if (plotContainer.current) {
            resizeObserver.observe(plotContainer.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    // Calculate the height based on the number of rows in the array
    const dynamicHeight = Math.max(array.length * verticalScaleFactor, 0); // Minimum height is 200px

    return (
        <div className={`${height} ${width} rounded-b-md flex-col content-end relative`} ref={plotContainer}>
            <Plot
                data={[
                    {
                        z: array,
                        x: xArray,
                        y: yArray,
                        type: 'heatmap',
                        colorscale: colorScale,
                        zmin: zMin,
                        zmax: zMax,
                        showscale: showScale,
                    }
                ]}
                layout={{
                    title: {
                        text: title,
                    },
                    xaxis: {
                        title: xAxisTitle,
                        automargin: false,
                        showticklabels: showTicks,
                        showgrid: showTicks

                        //scaleanchor: "y", // Ensure squares remain proportional
                    },
                    yaxis: {
                        title: yAxisTitle,
                        range: [-0.5, array.length-0.5], // Dynamically adjust y-axis range
                        autorange: false,
                        automargin: false,
                        tickmode: showTicks ? 'linear' : undefined, // tick marks should only appear when
                        tick0: 0, // Starting tick
                        dtick: showTicks ? tickStep : 10000, // Tick step,
                        showticklabels: showTicks,
                        showgrid: showTicks
                    },
                    autosize: true,
                    width: lockPlotWidthHeightToInputArray ? Math.min(dimensions.width, array[0].length) : dimensions.width,
                    height: lockPlotWidthHeightToInputArray ? Math.min(dimensions.height, array.length) : lockPlotHeightToParent ? dimensions.height : dynamicHeight, // Dynamically set height
           
                    margin: {
                        l: (showTicks || yAxisTitle) ? 50 : 0,
                        r: 0,
                        t: 0,
                        b: xAxisTitle ? 40 : 0,
                    },
                }}
                config={{ responsive: true }}
                className="rounded-b-md"
            />
            <div className="absolute bottom-0 left-0 right-0 text-center  text-md font-semibold">
                {title}
            </div>
        </div>
    );
}