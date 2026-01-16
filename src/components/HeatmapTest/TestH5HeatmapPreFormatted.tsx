import '@h5web/lib/styles.css';
import { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { Domain, HeatmapVis, getDomain } from '@h5web/lib';
import { smallH5HeatmapData, smallH5HeatmapDomain, smallHeatmapData } from './utils/createSampleHeatmapData';
import ndarray from 'ndarray';

type TestH5HeatmapPreFormattedProps = {
    onInitializedCallback?: (time: number) => void;
    arrayDataH5: ndarray.NdArray<number[]>;
    h5Domain?: Domain | undefined;
    title?: string;
};
export default function TestH5HeatmapPreFormatted({ onInitializedCallback, arrayDataH5, h5Domain, title }: TestH5HeatmapPreFormattedProps) {
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
            
            
            if (onInitializedCallback) {
                onInitializedCallback(duration);
            }
        }
    };

    // Trigger render time measurement when component renders
    useLayoutEffect(() => {
        if (shouldRender && startTimeRef.current) {
            // This runs synchronously after all DOM mutations
            handlePlotReady();
        }
    }, [shouldRender]);

    return (
        <div className="flex flex-col items-center">
            <h1>{title}</h1>
            {shouldRender ? (
                <div className="flex" style={{ height: '500px', width: '500px' }}>
                    <HeatmapVis
                        dataArray={arrayDataH5}
                        domain={h5Domain}
                        colorMap="Viridis"

                    />
                </div>
            ) : (
                <div className="h-[500px] bg-white w-[500px]"></div>
            )}
            <div className="mt-3 p-2 rounded text-left w-48">
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