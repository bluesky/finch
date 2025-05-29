import { PlotData } from 'plotly.js';
export type PlotlyScatterData = Partial<Omit<PlotData, 'x' | 'y'>> & {
    x: PlotData['x'];
    y: PlotData['y'];
};
//# sourceMappingURL=plotTypes.d.ts.map