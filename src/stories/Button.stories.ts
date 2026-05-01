import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import Button from '../components/Button';

const meta = {
    title: 'General Components/Button',
    component: Button,
    parameters: {
      // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
      layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
    },
    // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: { cb: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    text: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    text: 'secondary',
    isSecondary: true
  },
};

export const Large: Story = {
  args: {
    text: 'large',
    size: 'large'
  },
};

export const Small: Story = {
  args: {
    text: 'small',
    size: 'small'
  },
};

export const Active: Story = {
  args: {
    text: 'active',
    active: true,
  },
};

export const ActiveSecondary: Story = {
  args: {
    text: 'active secondary',
    active: true,
    isSecondary: true,
  },
};

export const Disabled: Story = {
  args: {
    text: 'disabled',
    disabled: true,
  },
};