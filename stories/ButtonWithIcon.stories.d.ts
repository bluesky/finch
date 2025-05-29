import { StoryObj } from '@storybook/react';
import { default as ButtonWithIcon } from '../components/ButtonWithIcon';
declare const meta: {
    title: string;
    component: typeof ButtonWithIcon;
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
export declare const Secondary: Story;
export declare const CustomColors: Story;
export declare const Large: Story;
//# sourceMappingURL=ButtonWithIcon.stories.d.ts.map