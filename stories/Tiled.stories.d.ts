import { StoryObj } from '@storybook/react';
import { default as Tiled } from '../components/Tiled/Tiled';
declare const meta: {
    title: string;
    component: typeof Tiled;
    parameters: {
        layout: string;
        msw: {
            handlers: import('msw').HttpHandler[];
        };
    };
    tags: string[];
    argTypes: {};
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Primary: Story;
//# sourceMappingURL=Tiled.stories.d.ts.map