import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import ColormapPicker from '../components/ColormapPicker';

const meta = {
    title: 'General Components/ColormapPicker',
    component: ColormapPicker,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof ColormapPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        value: 'viridis',
        onChange: fn(),
        className: 'w-56',
    },
};

export const GraySelected: Story = {
    args: {
        value: 'gray',
        onChange: fn(),
        className: 'w-56',
    },
};

export const Scrollable: Story = {
    args: {
        value: 'viridis',
        onChange: fn(),
        className: 'w-56',
        maxHeight: 'max-h-40',
    },
};

export const CustomColormaps: Story = {
    args: {
        value: 'red-blue',
        onChange: fn(),
        className: 'w-56',
        colormaps: [
            { id: 'red-blue', label: 'Red-Blue', stops: '#d73027,#f46d43,#74add1,#4575b4' },
            { id: 'bw',       label: 'B+W',      stops: '#000000,#ffffff' },
        ],
    },
};
