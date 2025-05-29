import { StoryObj } from '@storybook/react';
import { default as Widget } from '../components/Widget';
declare const meta: {
    title: string;
    component: typeof Widget;
    tags: string[];
    parameters: {
        layout: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const WithIcon: Story;
export declare const Blank: Story;
export declare const WithBackgroundColor: Story;
//# sourceMappingURL=Widget.stories.d.ts.map