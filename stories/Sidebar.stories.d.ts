import { StoryObj } from '@storybook/react';
import { default as Sidebar } from '../components/Sidebar';
declare const meta: {
    title: string;
    component: typeof Sidebar;
    tags: string[];
    parameters: {
        layout: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const Collapsible: Story;
export declare const CollapsibleWithTitle: Story;
export declare const Title: Story;
//# sourceMappingURL=Sidebar.stories.d.ts.map