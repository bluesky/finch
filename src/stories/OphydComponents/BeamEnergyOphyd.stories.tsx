import type { Meta, StoryObj } from '@storybook/react';
import BeamEnergyOphyd from '@/components/BeamEnergy/BeamEnergyOphyd';
import { withDeviceTransport } from '../demos/ophydSimDecorators';
import { createMockDeviceTransport } from '../demos/mockDeviceTransport';

/**
 * Beam-energy widget wired by **Ophyd device name** (not raw PV). It subscribes
 * over the device socket (`useOphydDeviceSocket`) and reads the energy in eV
 * directly from the device value.
 *
 * ophyd-sim only implements a *PV* transport, so this variant can't be driven by
 * it. Instead a small mock device transport (see `mockDeviceTransport.ts`) stands
 * in for a device-socket backend and serves a writable `mono_energy` device — so
 * the absolute/relative energy moves below are live. The transport is supplied by
 * a decorator; the sample code shows only the component.
 */
const deviceTransport = createMockDeviceTransport({
    mono_energy: { initialValue: 4500, units: 'eV', min: 2000, max: 7000, writable: true },
});

const meta = {
    title: 'Ophyd Components/BeamEnergyOphyd',
    component: BeamEnergyOphyd,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [withDeviceTransport(deviceTransport)],
} satisfies Meta<typeof BeamEnergyOphyd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <BeamEnergyOphyd deviceName="mono_energy" />,
    parameters: {
        docs: { source: { code: '<BeamEnergyOphyd deviceName="mono_energy" />', language: 'tsx' } },
    },
};
