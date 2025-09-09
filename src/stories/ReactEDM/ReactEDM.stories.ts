import type { Meta, StoryObj } from '@storybook/react';

import ReactEDM from './ReactEDM';

const meta = {
    title: 'Bluesky Components/ReactEDM',
    component: ReactEDM,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
## File Formats

- **.adl files**: ADL (ASCII Display List) from MEDM
- **.bob files**: From CSS Phoebus

## Backend Requirements
This component requires [Ophyd Websocket](https://github.com/bluesky/ophyd-websocket) to be running for device connections between the browser and EPICS. It is required for live streaming/writing of EPICS PVs.
To see a demo of this component in action, see this [video](https://youtu.be/AW2KDAqg9xQ). The components shown below are not connected to any EPICS devices, instead a simple mock is used
to create the display properly
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