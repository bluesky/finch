import React, { useRef, useEffect, useState } from 'react';
import Plot, { PlotParams } from 'react-plotly.js';
import { Layout, LayoutAxis } from 'plotly.js';
import { cn } from '@/lib/utils';

export type PlotlyScatterProps = {
    /** Plotly trace array to render. Defaults to a sample line+marker dataset. */
    data: PlotParams['data'];
    /** Plot title displayed above the chart. */
    title?: string;
    /** Label for the x axis. Increases bottom margin when set. */
    xAxisTitle?: string;
    /** Label for the y axis. Increases left margin when set. */
    yAxisTitle?: string;
    /** Fixed [min, max] range for the x axis. When omitted Plotly auto-scales. */
    xAxisRange?: [number, number];
    /** Fixed [min, max] range for the y axis. When omitted Plotly auto-scales. */
    yAxisRange?: [number, number];
    /** Additional Plotly xaxis layout overrides merged on top of defaults. */
    xAxisLayout?: Partial<LayoutAxis>;
    /** Additional Plotly yaxis layout overrides merged on top of defaults. */
    yAxisLayout?: Partial<LayoutAxis>;
    /** Plotly layout overrides — merged on top of defaults, user values take precedence. */
    layout?: Partial<Layout>;
    /** Additional CSS classes applied to the root container div. */
    className?: string;
    /** Plotly configuration options. */
    config?: Partial<PlotParams['config']>;
};

const sampleData: PlotParams['data'] = [
    {
        x: [1, 2, 3],
        y: [2, 6, 3],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'red' },
    },
];

const titleFont = {
    size: 16,
    color: '#082f49',
};

const PlotlyScatter = React.memo(function PlotlyScatter({
    data = sampleData,
    title,
    xAxisTitle,
    yAxisTitle,
    xAxisRange,
    yAxisRange,
    xAxisLayout,
    yAxisLayout,
    layout,
    className,
    ...props
}: PlotlyScatterProps) {
    const plotContainer = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Hook to update dimensions dynamically
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

    return (
        <div
            className={cn('max-h-full h-96 rounded-lg overflow-hidden text-slate-700', className)}
            ref={plotContainer}
            {...props}
        >
            <Plot
                data={data}
                layout={{
                    title: title,
                    plot_bgcolor: '#E2E8F0',
                    paper_bgcolor: '#E2E8F0',
                    xaxis: {
                        title: {
                            text: xAxisTitle,
                            font: titleFont,
                        },
                        range: xAxisRange ? xAxisRange : undefined,
                        ...xAxisLayout,
                    },
                    yaxis: {
                        title: {
                            text: yAxisTitle,
                            font: titleFont,
                        },
                        range: yAxisRange ? yAxisRange : undefined,
                        ...yAxisLayout,
                    },
                    autosize: true,
                    width: dimensions.width,
                    height: dimensions.height,
                    margin: {
                        l: yAxisTitle ? 60 : 50,
                        r: 30,
                        t: 30,
                        b: xAxisTitle ? 70 : 30,
                    },
                    ...layout,
                }}
                config={{ responsive: true, ...props.config }}
            />
        </div>
    );
});

export default PlotlyScatter;
