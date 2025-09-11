import { StoryObj } from '@storybook/react';
import { default as ReactEDM } from './ReactEDM';
declare const meta: {
    title: string;
    component: typeof ReactEDM;
    tags: string[];
    parameters: {
        layout: string;
        docs: {
            description: {
                component: string;
            };
        };
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const Slate: Story;
export declare const Paper: Story;
export declare const Legacy: Story;
export declare const Bob: Story;
//# sourceMappingURL=ReactEDM.stories.d.ts.map