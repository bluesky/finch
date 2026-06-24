import type { Meta, StoryObj } from '@storybook/react';

import PlotlyHeatmap from '../components/PlotlyHeatmap';

const meta = {
    title: 'General Components/PlotlyHeatmap',
    component: PlotlyHeatmap,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof PlotlyHeatmap>;

export default meta;
type Story = StoryObj<typeof meta>;

function generateEggData(size: number): number[][] {
    const maxVal = 255; // Maximum intensity
    const center = size / 2; // Center of the Egg
    const data: number[][] = [];

    for (let y = 0; y < size; y++) {
        const row: number[] = [];
        for (let x = 0; x < size; x++) {
            // Calculate distance from the center
            const dx = x - center;
            const dy = y - center;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Egg-like function: exponential decay from center
            const intensity = maxVal * Math.exp((-distance * distance) / (2 * (center / 2) ** 2));
            row.push(Math.round(intensity)); // Normalize to integer
        }
        data.push(row);
    }

    return data;
}

// Example usage
const size = 10; // Adjust size for desired resolution
const eggData = generateEggData(size);

export const Default: Story = {
    args: {
        array: eggData,
        width: 'w-96',
        height: 'h-96',
        lockPlotHeightToParent: true,
    },
};

export const Electric: Story = {
    args: {
        array: eggData,
        width: 'w-96',
        height: 'h-96',
        lockPlotHeightToParent: true,
        colorScale: 'Electric',
    },
};

export const HeatmapOnly: Story = {
    args: {
        array: [
            [1, 20, 30],
            [20, 1, 60],
        ],
        width: 'w-96',
        height: 'h-96',
        lockPlotHeightToParent: true,
        showScale: false,
    },
};

export const Labels: Story = {
    args: {
        array: [
            [1, 20, 30],
            [20, 1, 60],
            [30, 60, 1],
        ],
        width: 'w-96',
        height: 'h-96',
        lockPlotHeightToParent: true,
        xAxisTitle: 'X axis title',
        yAxisTitle: 'Y axis title',
    },
};
