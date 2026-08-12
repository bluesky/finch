import type { Meta, StoryObj } from '@storybook/react';
import BeamEnergyPV from '@/components/BeamEnergy/BeamEnergyPV';

/**
 * Beam-energy widget wired by **EPICS PV** — it reads a monochromator angle PV
 * (default `bl531_xps1:mono_angle_deg`) via `useOphydPVSocket` and converts the
 * Bragg angle to energy.
 *
 * This story uses the component's built-in `demo` mode, which drives the display
 * from a self-contained simulated monochromator (no backend, no wrapper). To run
 * it against a real IOC instead, drop `demo` and point `pv` at your angle PV; to
 * drive it from ophyd-sim, wrap it in the sim providers with a scenario that
 * seeds that PV.
 */
const meta = {
    title: 'Ophyd Components/BeamEnergyPV',
    component: BeamEnergyPV,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof BeamEnergyPV>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <BeamEnergyPV demo />,
    parameters: {
        docs: { source: { code: '<BeamEnergyPV demo />', language: 'tsx' } },
    },
};
