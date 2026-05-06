import { default as React } from '../../node_modules/react';
import { PlotParams } from 'react-plotly.js';
import { LayoutAxis } from 'plotly.js';
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
    /** Additional CSS classes applied to the root container div. */
    className?: string;
};
declare const PlotlyScatter: React.NamedExoticComponent<PlotlyScatterProps>;
export default PlotlyScatter;
//# sourceMappingURL=PlotlyScatter.d.ts.map