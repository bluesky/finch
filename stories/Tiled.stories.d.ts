import { StoryObj } from '@storybook/react';
import { default as Tiled } from '../components/Tiled/Tiled';
declare const meta: {
    title: string;
    component: typeof Tiled;
    parameters: {
        layout: string;
    };
    tags: string[];
    argTypes: {};
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Primary: Story;
export declare const LocalHostUrl: Story;
export declare const CustomUrl: Story;
//# sourceMappingURL=Tiled.stories.d.ts.map