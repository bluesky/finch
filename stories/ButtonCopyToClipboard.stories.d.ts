import { StoryObj } from '@storybook/react';
import { default as ButtonCopyToClipboard } from '../components/ButtonCopyToClipboard';
declare const meta: {
    title: string;
    component: typeof ButtonCopyToClipboard;
    parameters: {
        layout: string;
    };
    tags: string[];
    argTypes: {};
    args: {
        cb: import('@vitest/spy').Mock<(...args: any[]) => any>;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Primary: Story;
//# sourceMappingURL=ButtonCopyToClipboard.stories.d.ts.map