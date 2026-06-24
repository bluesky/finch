import { cn } from '@/lib/utils';
import Plot from 'react-plotly.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import InputSliderRange from '../InputSliderRange';
import HistogramPlotSettings from './HistogramPlotSettings';

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

export default function HistogramPlot({
    arrayData,
    showPlotSettings,
    className,
    classNameSettings,
    title,
    precision = 6,
}: HistorgramPlotProps) {
    const plotContainer = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [enableROI] = useState(true);
    const [range, setRange] = useState<[number, number]>([800, 1000]);
    const sum = useMemo(() => {
        if (!arrayData) {
            return 0;
        }
        return arrayData.reduce((acc, val) => acc + val, 0);
    }, [arrayData]);

    const totalArrayElements = useMemo(() => (arrayData ? arrayData.length : 0), [arrayData]);

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

    const isValidArray = useMemo(
        () =>
            Array.isArray(arrayData) &&
            arrayData.length > 0 &&
            arrayData.every((value) => Number.isFinite(value)),
        [arrayData],
    );

    const xValues = useMemo(() => {
        if (!isValidArray || !arrayData) {
            return [];
        }
        return arrayData.map((_, index) => index);
    }, [arrayData, isValidArray]);

    const roiBounds = useMemo(() => {
        if (!isValidArray || !arrayData || arrayData.length === 0) {
            return null;
        }

        const startIndex = Math.max(0, Math.floor(range[0]));
        const endIndex = Math.min(arrayData.length - 1, Math.ceil(range[1]));

        if (endIndex < startIndex) {
            return null;
        }

        return { startIndex, endIndex };
    }, [arrayData, isValidArray, range]);

    const roiMaxY = useMemo(() => {
        if (!isValidArray || !arrayData || !roiBounds) {
            return 0;
        }

        let maxValue = 0;
        for (let index = roiBounds.startIndex; index <= roiBounds.endIndex; index += 1) {
            if (arrayData[index] > maxValue) {
                maxValue = arrayData[index];
            }
        }

        return maxValue;
    }, [arrayData, isValidArray, roiBounds]);

    const roiAreaSum = useMemo(() => {
        if (!isValidArray || !arrayData || !roiBounds) {
            return 0;
        }

        let total = 0;
        for (let index = roiBounds.startIndex; index <= roiBounds.endIndex; index += 1) {
            total += arrayData[index];
        }

        return total;
    }, [arrayData, isValidArray, roiBounds]);

    const roiSliderMax = useMemo(
        () => Math.max(1, totalArrayElements > 0 ? totalArrayElements - 1 : 1),
        [totalArrayElements],
    );

    return (
        <div className={cn('flex flex-col items-center justify-start min-w-[70rem]', className)}>
            <p className="text-lg text-center font-semibold text-sky-900">{title || 'Histogram'}</p>
            <article className="flex w-full items-start justify-between text-slate-600">
                <p className="text-lg text-center">
                    Sum of All Elements: {sum.toPrecision(precision)}
                </p>
                <p className="text-lg text-center">
                    ROI Sum [{range[0]}-{range[1]}]:{' '}
                    {enableROI ? roiAreaSum.toPrecision(precision) : 0}
                </p>
                <p className="text-lg text-center">Total Array Elements: {totalArrayElements}</p>
            </article>

            {showPlotSettings && <HistogramPlotSettings className={classNameSettings} />}

            <div ref={plotContainer} className="h-80 w-full">
                {isValidArray && arrayData ? (
                    <Plot
                        data={[
                            {
                                x: xValues,
                                y: arrayData,
                                type: 'scatter',
                                mode: 'lines',
                                line: { color: '#082f49', width: 1 },
                                hovertemplate: 'Channel %{x}<br>Counts %{y}<extra></extra>',
                            },
                        ]}
                        layout={{
                            autosize: true,
                            width: dimensions.width,
                            height: dimensions.height,
                            margin: { l: 50, r: 20, t: 10, b: 45 },
                            xaxis: { title: { text: 'Channel' } },
                            yaxis: { title: { text: 'Counts' } },
                            shapes:
                                enableROI && roiMaxY > 0
                                    ? [
                                          {
                                              type: 'rect',
                                              xref: 'x',
                                              yref: 'y',
                                              x0: range[0],
                                              x1: range[1],
                                              y0: 0,
                                              y1: roiMaxY,
                                              line: {
                                                  color: '#94a3b8',
                                                  width: 2,
                                                  dash: 'dot',
                                              },
                                              fillcolor: 'rgba(148, 163, 184, 0.08)',
                                          },
                                      ]
                                    : undefined,
                            plot_bgcolor: 'transparent',
                            paper_bgcolor: 'transparent',
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        className="h-full w-full"
                    />
                ) : (
                    <div className="h-full w-full rounded-md border border-slate-700/50 bg-slate-900/30 flex items-center justify-center text-sm text-slate-300">
                        Waiting for histogram array data
                    </div>
                )}
            </div>
            <div className="w-full">
                <InputSliderRange
                    label="ROI X Range"
                    min={0}
                    max={roiSliderMax}
                    value={range}
                    step={1}
                    onChange={setRange}
                    showSideInput={true}
                    units=""
                    shorthandUnits=""
                    className="w-full"
                />
            </div>
        </div>
    );
}
