import type { Meta, StoryObj } from '@storybook/react';

import CSIController from '@/components/CSIController/CSIController';

const meta = {
    title: 'General Components/ReactEDM',
    component: CSIController,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    }
} satisfies Meta<typeof CSIController>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        fileName: "ADBase.adl", 
        P: "13SIM1", 
        R: "cam1",
        mock: true,

    }
}

