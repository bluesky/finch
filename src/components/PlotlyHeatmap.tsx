import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Plot from 'react-plotly.js';

export type PlotlyHeatmapProps = {
    /** A nested array displayed top-down */
    array: number[][],
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
    showScale?: boolean,
    /** Enable log scale slider control */
    enableLogScale?: boolean
}

//TODO: there are some issues with the display when zooming out
export default function PlotlyHeatmap({
    array, //2d array [[1, 2, 3], [2, 2 1]]
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
    enableLogScale = false, //enable log scale slider
}: PlotlyHeatmapProps) {
    const plotContainer = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 }); //applied to plot, not the container
    const [logScaleValue, setLogScaleValue] = useState<number>(0); // 0 = no log scale, 1-10 = increasing log scale
    const [debouncedLogScale, setDebouncedLogScale] = useState<number>(0);

    // Debounce the log scale value to prevent excessive re-renders
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedLogScale(logScaleValue);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [logScaleValue]);

    // Apply log scaling to the data
    const processedArray = useMemo(() => {
        if (!enableLogScale || debouncedLogScale === 0) {
            return array;
        }

        // Apply log transformation with a base that increases with slider value
        const logBase = 1 + (debouncedLogScale / 10); // Base ranges from 1.1 to 2.0
        
        return array.map(row => 
            row.map(value => {
                // Add small epsilon to avoid log(0), then apply log transformation
                const safeValue = Math.max(value, 0.001);
                return Math.log(safeValue) / Math.log(logBase);
            })
        );
    }, [array, debouncedLogScale, enableLogScale]);

    const handleLogScaleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setLogScaleValue(Number(event.target.value));
    }, []);

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
        <>
            {enableLogScale && (
                <div className="flex items-center justify-between p-2 bg-gray-100 rounded-t-md mb-1">
                    <div className="text-xs font-medium text-gray-700">
                        Log Scale
                    </div>
                    <div className="flex items-center gap-3 flex-1 justify-center">
                        <span className="text-xs text-gray-600">Off</span>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={logScaleValue}
                            onChange={handleLogScaleChange}
                            className="flex-1 max-w-48"
                            title={`Log Scale: ${logScaleValue}`}
                        />
                        <span className="text-xs text-gray-600">Max</span>
                    </div>
                    <div className="text-xs text-gray-600 min-w-8 text-right">
                        {logScaleValue === 0 ? 'Off' : logScaleValue.toFixed(1)}
                    </div>
                </div>
            )}
            <div className={`${height} ${width} rounded-b-md flex relative`} ref={plotContainer}>
                <div className="flex-1 flex flex-col">
                    <Plot
                        data={[
                            {
                                z: processedArray,
                                type: 'heatmap',
                                colorscale: colorScale,
                                zmin: 0,
                                zmax: 255,
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
                            height: lockPlotWidthHeightToInputArray ? Math.min(dimensions.height, array.length) : lockPlotHeightToParent ? dimensions.height : dynamicHeight,
                
                            margin: {
                                l: (showTicks || yAxisTitle) ? 50 : 0,
                                r: 0,
                                t: 0,
                                b: xAxisTitle ? 40 : 0,
                            },
                        }}
                        config={{ responsive: true }}
                        className="rounded-b-md flex-1"
                    />
                    <div className="absolute bottom-0 left-0 right-0 text-center text-md font-semibold">
                        {title}
                    </div>
                </div>
            </div>
        </>
    );
}