import type { Meta, StoryObj } from '@storybook/react';
import Hexapod from '@/components/Hexapod/Hexapod';
import { withOphydSim, hexapodBeamline } from '@/lib/ophyd-sim';

/**
 * Six-axis Symetrie hexapod widget (controller + live position plot). `Hexapod`
 * derives its PV names from `prefix` (default `SYM:HEX01`) and talks to them over
 * `useOphydSocket`.
 *
 * The `hexapodBeamline` sim scenario seeds that exact device, so the readbacks
 * and moves below are live. Enter target positions in the controller and press
 * the move command to watch the axes animate. Only `<Hexapod />` shows in the
 * code — the sim providers are a decorator.
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
