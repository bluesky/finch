import { useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import { smallHeatmapData } from './utils/createSampleHeatmapData';

type TestPlotlyHeatmapProps = {
    onInitializedCallback?: (time: number) => void;
    arrayData?: number[][];
    title?: string;
};
export default function TestPlotlyHeatmap({ onInitializedCallback, arrayData=smallHeatmapData, title }: TestPlotlyHeatmapProps) {
    const [shouldRender, setShouldRender] = useState(false);
    const [renderTime, setRenderTime] = useState<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const handleRenderClick = () => {
        startTimeRef.current = performance.now();
        setRenderTime(null); // Reset previous render time
        setShouldRender(true);
    };

    const handlePlotReady = () => {
        if (startTimeRef.current) {
            const endTime = performance.now();
            const duration = endTime - startTimeRef.current;
            setRenderTime(duration);
            
            // Log data analysis
            console.log('Plotly Heatmap - Data at (0,0):', arrayData[0][0]);
            console.log('Plotly Heatmap - Array size:', arrayData.length, 'x', arrayData[0]?.length || 0, '- Total elements:', arrayData.length * (arrayData[0]?.length || 0));
            
            if (onInitializedCallback) {
                onInitializedCallback(duration);
            }
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h1>{title}</h1>
            {shouldRender ? (
                <Plot
                    data={[
                        {
                            z: arrayData,
                            type: 'heatmap',
                            colorscale: 'Viridis',
                            showscale: true,
                        },
                    ]}
                    layout={{
                        title: 'Sample Heatmap Data',
                        xaxis: { title: 'X Axis' },
                        yaxis: { title: 'Y Axis' },
                        width: 500,
                        height: 500,
                    }}
                    config={{
                        responsive: true,
                        displayModeBar: true,
                    }}
                    onInitialized={handlePlotReady}
                />
            ) : (
                <div className="h-[500px] bg-white w-[500px]"></div>
            )}
            <div className="mt-3 p-2  rounded text-left w-48">
                Render time: {renderTime ? renderTime.toFixed(2) : '--'} ms
            </div>
            <button 
                onClick={handleRenderClick}
                className="mt-5 px-5 py-2.5 bg-blue-500 text-white border-0 rounded cursor-pointer hover:bg-blue-600 transition-colors"
            >
                Render
            </button>
        </div>
    );
}