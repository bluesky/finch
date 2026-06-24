import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import ButtonIconOnly from '../components/ButtonIconOnly';

const StarIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        width={16}
        height={16}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
    </svg>
);

const meta = {
    title: 'General Components/ButtonIconOnly',
    component: ButtonIconOnly,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof ButtonIconOnly>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        icon: <StarIcon />,
    },
};

export const Secondary: Story = {
    args: {
        icon: <StarIcon />,
        isSecondary: true,
    },
};

export const Active: Story = {
    args: {
        icon: <StarIcon />,
        active: true,
    },
};

export const ActiveSecondary: Story = {
    args: {
        icon: <StarIcon />,
        active: true,
        isSecondary: true,
    },
};

export const Disabled: Story = {
    args: {
        icon: <StarIcon />,
        disabled: true,
    },
};

export const CustomColors: Story = {
    args: {
        icon: <StarIcon />,
        className: 'bg-orange-500 hover:bg-orange-600',
    },
};
