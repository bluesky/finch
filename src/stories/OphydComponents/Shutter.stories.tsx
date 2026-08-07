import type { Meta, StoryObj } from '@storybook/react';
import Shutter from '@/components/Shutter';
import { withOphydSim, beamstopBeamline } from '@/lib/ophyd-sim';

/**
 * Beam-shutter control. `Shutter` subscribes to a single analog-output PV via
 * `useOphydPVSocket` (default `bl531:LJT4:1:AO0`, 0 V = Open / 5 V = Closed) and
 * writes it from the dropdown.
 *
 * Here it is driven by the `beamstopBeamline` ophyd-sim scenario, which seeds
 * that PV — so opening and closing the shutter below is fully live, no backend
 * required. Only the `<Shutter />` element is shown in the code below; the sim
 * providers are applied as a Storybook decorator.
 */
const meta = {
    title: 'Ophyd Components/Shutter',
    component: Shutter,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [withOphydSim(beamstopBeamline)],
} satisfies Meta<typeof Shutter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <Shutter className="w-96" />,
    parameters: {
        docs: { source: { code: '<Shutter />', language: 'tsx' } },
    },
};
