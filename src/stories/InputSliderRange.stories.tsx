import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import InputSliderRange, { type InputSliderRangeProps } from '../components/InputSliderRange';

const meta = {
    title: 'General Components/InputSliderRange',
    component: InputSliderRange,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    }
} satisfies Meta<typeof InputSliderRange>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveInputSliderRange(args: InputSliderRangeProps) {
    const [value, setValue] = useState(args.value);

    return (
        <InputSliderRange
            {...args}
            value={value}
            onChange={(nextValue: [number, number]) => {
                setValue(nextValue);
                args.onChange?.(nextValue);
            }}
        />
    );
}

export const Default: Story = {
    render: (args) => <InteractiveInputSliderRange {...args} />,
    args: {
        min: 0,
        max: 100,
        value: [20, 50],
        onChange: fn(),
        label: 'Age',
        units: 'years'
    }
}

export const WithCustomTicks: Story = {
    render: (args) => <InteractiveInputSliderRange {...args} />,
    args: {
        min: 0,
        max: 100,
        value: [20, 50],
        onChange: fn(),
        marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    }
}

export const WithTickLabels: Story = {
    render: (args) => <InteractiveInputSliderRange {...args} />,
    args: {
        min: 0,
        max: 100,
        value: [20, 50],
        onChange: fn(),
        marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        shorthandUnits: 'yr'
    }
}

export const WithoutLabel: Story = {
    render: (args) => <InteractiveInputSliderRange {...args} />,
    args: {
        min: 0,
        max: 100,
        value: [20, 50],
        onChange: fn(),
    }
}

export const WithoutLabelOrInput: Story = {
    render: (args) => <InteractiveInputSliderRange {...args} />,
    args: {
        min: 0,
        max: 100,
        value: [20, 50],
        onChange: fn(),
        showSideInput: false
    }
}

