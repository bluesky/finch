import type { Meta, StoryObj } from '@storybook/react';
import Hexapod from '@/components/Hexapod/Hexapod';
import { withOphydSim, hexapodBeamline } from '@/lib/ophyd-sim';

/**
 * Six-axis Symetrie hexapod widget (controller + live position plot). `Hexapod`
 * derives its PV names from `prefix` (default `SYM:HEX01`) and talks to them over
 * `useOphydSocket`.
 *
 */
const meta = {
    title: 'Ophyd Components/Hexapod',
    component: Hexapod,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [withOphydSim(hexapodBeamline)],
} satisfies Meta<typeof Hexapod>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <Hexapod prefix="SYM:HEX01" />,
    parameters: {
        docs: { source: { code: '<Hexapod prefix="SYM:HEX01" />', language: 'tsx' } },
    },
};
