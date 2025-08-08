import type { Meta, StoryObj } from '@storybook/react';

import ReactEDM from './ReactEDM';

const meta = {
    title: 'General Components/ReactEDM',
    component: ReactEDM,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
## [Demo Video](https://youtu.be/AW2KDAqg9xQ)

## File Formats

- **.adl files**: ADL (ASCII Display List) from MEDM
- **.bob files**: From CSS Phoebus
                `
            }
        }
    }
} satisfies Meta<typeof ReactEDM>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        fileName: "ADBase.adl", 
        P: "13SIM1", 
        R: "cam1",
        variant: "default"
    }
}

export const Slate: Story = {
    args: {
        fileName: "ADBase.adl", 
        P: "13SIM1", 
        R: "cam1",
        variant: "slate"
    }
}

export const Paper: Story = {
    args: {
        fileName: "ADBase.adl", 
        P: "13SIM1", 
        R: "cam1",
        variant: "paper"
    }
}

export const Legacy: Story = {
    args: {
        fileName: "ADBase.adl", 
        P: "13SIM1", 
        R: "cam1",
        variant: "legacy"
    }
}

export const Bob: Story = {
    args: {
        fileName: "ADBase.bob", 
        P: "13SIM1", 
        R: "cam1",
        variant: "default"
    }
}