import { createElement, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import InputSlider, { type InputSliderProps } from '../components/InputSlider';

const meta = {
    title: 'General Components/InputSlider',
    component: InputSlider,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof InputSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveInputSlider(args: InputSliderProps) {
    const [value, setValue] = useState(args.value);

    return createElement(InputSlider, {
        ...args,
        value,
        onChange: (nextValue: number) => {
            setValue(nextValue);
            args.onChange?.(nextValue);
        },
    });
}

export const Default: Story = {
    render: (args) => createElement(InteractiveInputSlider, args),
    args: {
        min: 0,
        max: 100,
        value: 4,
        label: 'Age',
        units: 'years',
    },
};

export const WithFillBar: Story = {
    render: (args) => createElement(InteractiveInputSlider, args),
    args: {
        min: 0,
        max: 100,
        value: 4,
        onChange: fn(),
        label: 'Age',
        showFill: true,
    },
};

export const WithCustomTicks: Story = {
    render: (args) => createElement(InteractiveInputSlider, args),
    args: {
        min: 0,
        max: 100,
        value: 4,
        onChange: fn(),
        marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    },
};

export const WithTickLabels: Story = {
    render: (args) => createElement(InteractiveInputSlider, args),
    args: {
        min: 0,
        max: 100,
        value: 4,
        onChange: fn(),
        marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        shorthandUnits: 'yr',
    },
};

export const WithoutLabel: Story = {
    render: (args) => createElement(InteractiveInputSlider, args),
    args: {
        min: 0,
        max: 100,
        value: 4,
        onChange: fn(),
    },
};

export const WithoutLabelOrInput: Story = {
    render: (args) => createElement(InteractiveInputSlider, args),
    args: {
        min: 0,
        max: 100,
        value: 4,
        onChange: fn(),
        showSideInput: false,
    },
};
