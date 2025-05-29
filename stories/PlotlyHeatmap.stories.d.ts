import { StoryObj } from '@storybook/react';
import { default as PlotlyHeatmap } from '../components/PlotlyHeatmap';
declare const meta: {
    title: string;
    component: typeof PlotlyHeatmap;
    tags: string[];
    parameters: {
        layout: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const Electric: Story;
export declare const HeatmapOnly: Story;
export declare const Labels: Story;
//# sourceMappingURL=PlotlyHeatmap.stories.d.ts.map