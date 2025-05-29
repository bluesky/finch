import { PlotParams } from 'react-plotly.js';
export type PlotlyScatterProps = {
    data: PlotParams['data'];
    title?: string;
    xAxisTitle?: string;
    yAxisTitle?: string;
    xAxisRange?: [number, number];
    yAxisRange?: [number, number];
    xAxisLayout?: {
        [key: string]: any;
    };
    yAxisLayout?: {
        [key: string]: any;
    };
    className?: string;
};
export default function PlotlyScatter({ data, title, xAxisTitle, yAxisTitle, xAxisRange, yAxisRange, xAxisLayout, yAxisLayout, className, }: PlotlyScatterProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PlotlyScatter.d.ts.map