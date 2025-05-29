import { StoryObj } from '@storybook/react';
import { default as SidebarItem } from '../components/SidebarItem';
declare const meta: {
    title: string;
    component: typeof SidebarItem;
    tags: string[];
    parameters: {
        layout: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const WithIcon: Story;
export declare const WithAbitraryIconStyles: Story;
//# sourceMappingURL=SidebarItem.stories.d.ts.map