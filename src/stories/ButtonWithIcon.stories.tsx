import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import React from 'react';

import ButtonWithIcon from '../components/ButtonWithIcon';

const FlaskIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
);

const meta = {
    title: 'General Components/ButtonWithIcon',
    component: ButtonWithIcon,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {},
    args: { cb: fn() },
} satisfies Meta<typeof ButtonWithIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        text: 'Primary',
        icon: <FlaskIcon />,
    },
};

export const Secondary: Story = {
    args: {
        text: 'Secondary',
        isSecondary: true,
        icon: <FlaskIcon />,
    },
};

export const Active: Story = {
    args: {
        text: 'Active',
        active: true,
        icon: <FlaskIcon />,
    },
};

export const ActiveSecondary: Story = {
    args: {
        text: 'Active Secondary',
        active: true,
        isSecondary: true,
        icon: <FlaskIcon />,
    },
};

export const Disabled: Story = {
    args: {
        text: 'Disabled',
        disabled: true,
        icon: <FlaskIcon />,
    },
};

export const CustomColors: Story = {
    args: {
        text: 'Custom Colors',
        className: 'bg-orange-500 hover:bg-orange-600 text-white',
        icon: <FlaskIcon />,
    },
};

export const Large: Story = {
    args: {
        size: 'large',
        text: 'Large',
        icon: <FlaskIcon />,
    },
};

export const Small: Story = {
    args: {
        size: 'small',
        text: 'Small',
        icon: <FlaskIcon />,
    },
};
