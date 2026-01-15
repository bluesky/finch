import '@h5web/lib/styles.css';
import { useState, useRef } from 'react';
import { HeatmapVis } from '@h5web/lib';
import { smallH5HeatmapData, smallH5HeatmapDomain } from './utils/createSampleHeatmapData';

export default function TestH5Heatmap() {
    const [shouldRender, setShouldRender] = useState(false);
    const [renderTime, setRenderTime] = useState<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const handleRenderClick = () => {
        startTimeRef.current = performance.now();
        setRenderTime(null); // Reset previous render time
        setShouldRender(true);
        
        // Use setTimeout to measure render time after the component mounts
        setTimeout(() => {
            if (startTimeRef.current) {
                const endTime = performance.now();
                const duration = endTime - startTimeRef.current;
                setRenderTime(duration);
            }
        }, 0);
    };

    return (
        <div className="flex flex-col items-center">
            <h1>Test H5 Heatmap</h1>
            {shouldRender && (
                <div className="flex" style={{ height: '500px', width: '500px' }}>
                    <HeatmapVis
                        dataArray={smallH5HeatmapData}
                        domain={smallH5HeatmapDomain}
                        colorMap="Viridis"
                    />
                </div>
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