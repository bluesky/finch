import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import SidebarItem from '../components/SidebarItem';

const meta = {
    title: 'Layout Components/Sidebar/SidebarItem',
    component: SidebarItem,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof SidebarItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Sample Title',
        containerStyles: 'border rounded-lg',
        children: (
            <div>
                <p>Children content here. </p>
                <p>
                    Notice that there are no size limits on the parent container, these items should
                    be combined inside a Sidebar component which limits the width.
                </p>
            </div>
        ),
    },
};

export const WithIcon: Story = {
    args: {
        title: 'Sample Title',
        containerStyles: 'border rounded-lg',
        children: <p>Children content here. </p>,
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                />
            </svg>
        ),
    },
};

export const WithAbitraryIconStyles: Story = {
    args: {
        title: 'Sample Title',
        containerStyles: 'border rounded-lg',
        children: (
            <p>
                Arbitrary styles are applied to the icon. Extra styles can similarly be applied to
                the parent container, children, and title.{' '}
            </p>
        ),
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                />
            </svg>
        ),
        iconStyles: 'h-16 text-red-500',
    },
};
