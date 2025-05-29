import { StoryObj } from '@storybook/react';
import { default as InputSlider } from '../components/InputSlider';
declare const meta: {
    title: string;
    component: typeof InputSlider;
    tags: string[];
    parameters: {
        layout: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const WithFillBar: Story;
export declare const WithCustomTicks: Story;
export declare const WithTickLabels: Story;
export declare const WithoutLabel: Story;
export declare const WithoutLabelOrInput: Story;
//# sourceMappingURL=InputSlider.stories.d.ts.map