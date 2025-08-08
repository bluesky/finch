import { PlotlyScatterData } from "@/types/plotTypes";

export const generateSampleData = (numPoints: number): PlotlyScatterData => {
    const now = Date.now(); // Current timestamp in milliseconds
    const interval = 1000; // 1 second interval between points
    const x = Array.from({ length: numPoints }, (_, i) => new Date(now - (numPoints - i) * interval).toISOString());
    const y = Array.from({ length: numPoints }, () => Math.random() * 100); 
    return {
        x,
        y,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'red' },
    };
};

export const blankScatterData: PlotlyScatterData = {
        x: [],
        y: [],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'grey', size: [] },
};