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
    enableLogScale?: boolean,
    /** Flip y axis */
    flipYAxis?: boolean
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
    flipYAxis = true
}: PlotlyHeatmapProps) {
    const plotContainer = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 }); //applied to plot, not the container
    const [scaleValue, setScaleValue] = useState<number>(0); // 0 = no scale, 1-10 = increasing scale intensity
    const [debouncedScale, setDebouncedScale] = useState<number>(0);
    const [scaleType, setScaleType] = useState<'log' | 'gamma'>('log'); // Current scale type

    // Debounce the scale value to prevent excessive re-renders
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedScale(scaleValue);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [scaleValue]);

    // Apply scaling to the data based on current scale type
    const processedArray = useMemo(() => {
        if (!enableLogScale || debouncedScale === 0) {
            return array;
        }

        if (scaleType === 'log') {
            // Apply log transformation with a base that increases with slider value
            const logBase = 1 + (debouncedScale / 10); // Base ranges from 1.1 to 2.0
            
            return array.map(row => 
                row.map(value => {
                    // Add small epsilon to avoid log(0), then apply log transformation
                    const safeValue = Math.max(value, 0.001);
                    return Math.log(safeValue) / Math.log(logBase);
                })
            );
        } else {
            // Apply gamma correction
            const gamma = 0.1 + (debouncedScale / 10) * 2.9; // Gamma ranges from 0.1 to 3.0
            
            // Find max value efficiently without spread operator
            let maxValue = 0;
            for (const row of array) {
                for (const value of row) {
                    if (value > maxValue) {
                        maxValue = value;
                    }
                }
            }
            
            return array.map(row =>
                row.map(value => {
                    // Normalize to 0-1, apply gamma, then scale back
                    const normalized = maxValue > 0 ? value / maxValue : 0;
                    const gammaCorrected = Math.pow(normalized, gamma);
                    return gammaCorrected * maxValue;
                })
            );
        }
    }, [array, debouncedScale, enableLogScale, scaleType]);

    const handleScaleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setScaleValue(Number(event.target.value));
    }, []);

    const handleScaleTypeChange = useCallback((newType: 'log' | 'gamma') => {
        setScaleType(newType);
        setScaleValue(0); // Reset slider to off
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
                <div className="flex items-center justify-center gap-2 p-2 rounded-t-md mb-1">
                    <div className="flex items-center gap-2 ">
                        <button
                            onClick={() => handleScaleTypeChange('log')}
                            className={`px-2 py-1 text-xs font-medium  ${
                                scaleType === 'log' 
                                    ? 'text-sky-800 border-b border-b-sky-800 hover:cursor-default' 
                                    : 'text-slate-400 hover:text-sky-800'
                            }`}
                        >
                            Log Scale
                        </button>
                        <button
                            onClick={() => handleScaleTypeChange('gamma')}
                            className={`px-2 py-1 text-xs font-medium ${
                                scaleType === 'gamma' 
                                    ? 'text-sky-800 border-b border-b-sky-800 hover:cursor-default' 
                                    : 'text-slate-400 hover:text-sky-800'
                            }`}
                        >
                            Gamma Scale
                        </button>
                    </div>
                    <div className="flex items-center gap-3 justify-center ">
                        <span className="text-xs text-gray-600">Off</span>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={scaleValue}
                            onChange={handleScaleChange}
                            className="flex-1 max-w-24"
                            title={`${scaleType === 'log' ? 'Log' : 'Gamma'} Scale: ${scaleValue}`}
                        />
                        <span className="text-xs text-gray-600">Max</span>
                    </div>
                    <div className="text-xs text-gray-600 min-w-8">
                        {scaleValue === 0 ? '' : `(${scaleValue.toFixed(1)})`}
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
                                autorange: flipYAxis ? 'reversed' : false,
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