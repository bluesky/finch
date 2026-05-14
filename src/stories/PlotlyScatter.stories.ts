import type { Meta, StoryObj } from '@storybook/react';

import PlotlyScatter from '../components/PlotlyScatter';
import { PlotParams } from 'react-plotly.js';

const meta = {
    title: 'General Components/PlotlyScatter',
    component: PlotlyScatter,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof PlotlyScatter>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData: PlotParams['data'] = [
    {
        x: [1, 2, 3, 4],
        y: [2, 6, 3, 90],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'blue' },
    },
    {
        x: [1, 2, 3, 4],
        y: [90, 70, 60, 50],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'red' },
    },
];

export const Default: Story = {
    args: {
        className: 'h-96 w-full',
        data: sampleData,
        xAxisTitle: 'my title',
        yAxisTitle: 'my y axis title',
        title: 'My Scatter',
    },
};

export const NoTitles: Story = {
    args: {
        className: 'h-96 w-full',
        data: sampleData,
    },
};
