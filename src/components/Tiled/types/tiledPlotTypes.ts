import { PlotData } from 'plotly.js';

//same type as plotly trace but only with x and y as strings (data field names) that are replaced with real Tiled data when plotting
export type TiledPlotlyTrace = Partial<Omit<PlotData, 'x' | 'y'>> & {
    x: string;
    y: string;
};

export type TiledPlotlyTraceData = TiledPlotlyTrace[];