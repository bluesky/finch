import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import Sidebar from '../components/Sidebar';

const meta = {
    title: 'Layout Components/Sidebar',
    component: Sidebar,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: (
            <p>
                {' '}
                This is a blank sidebar, the content goes here. Try adjusting the size (small,
                medium, large).{' '}
            </p>
        ),
    },
};

export const Collapsible: Story = {
    args: {
        collapsible: true,
        children: <p>Some children content here that is hidden when collapsed</p>,
    },
};

export const CollapsibleWithTitle: Story = {
    args: {
        collapsible: true,
        title: 'Sidebar',
        children: <p>This sidebar has a title, and it can collapse.</p>,
    },
};

export const Title: Story = {
    args: {
        title: 'Sidebar',
        children: <p>This sidebar has a title, but no collapse feature.</p>,
    },
};
