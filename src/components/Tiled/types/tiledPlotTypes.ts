import { PlotData } from 'plotly.js';

/**
 * A Plotly trace descriptor where `x` and `y` are table column names rather than data arrays.
 * The component resolves them to real data fetched from Tiled before passing to Plotly.
 */
export type TiledPlotlyTrace = Partial<Omit<PlotData, 'x' | 'y'>> & {
    /** Table column name to use as x-axis data. */
    x: string;
    /** Table column name to use as y-axis data. */
    y: string;
};

/** An ordered array of `TiledPlotlyTrace` descriptors for multi-trace scatter plots. */
export type TiledPlotlyTraceData = TiledPlotlyTrace[];
