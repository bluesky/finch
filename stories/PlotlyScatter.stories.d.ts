import { StoryObj } from '@storybook/react';
import { default as PlotlyScatter } from '../components/PlotlyScatter';
declare const meta: {
    title: string;
    component: typeof PlotlyScatter;
    tags: string[];
    parameters: {
        layout: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const NoTitles: Story;
//# sourceMappingURL=PlotlyScatter.stories.d.ts.map