import { useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import { smallHeatmapData } from './utils/createSampleHeatmapData';

export default function TestPlotlyHeatmap() {
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
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h1>Test Plotly Heatmap</h1>
            {shouldRender && (
                <Plot
                    data={[
                        {
                            z: smallHeatmapData,
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
            )}
            {renderTime && (
                <div className="mt-3 p-2 bg-green-100 text-green-800 rounded">
                    Render time: {renderTime.toFixed(2)} ms
                </div>
            )}
            <button 
                onClick={handleRenderClick}
                className="mt-5 px-5 py-2.5 bg-blue-500 text-white border-0 rounded cursor-pointer hover:bg-blue-600 transition-colors"
            >
                Render
            </button>
        </div>
    );
}