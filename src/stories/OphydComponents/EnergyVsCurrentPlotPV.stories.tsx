import type { Meta, StoryObj } from '@storybook/react';
import EnergyVsCurrentPlotPV from '@/features/EnergyVsCurrentPlotPV';
import { withOphydSim, beamstopBeamline } from '@/lib/ophyd-sim';

/**
 * "Beam Energy vs Beamstop Current" plot. It overlays a live *measured* trace
 * (samples accumulated as the energy PV sweeps) against the noise-free *expected*
 * curve from `beamstopCurrentModel` at the current beamstop position. All four
 * inputs are supplied as PV names and read with `useOphydPVSocket`.
 *
 * Backed by the `beamstopBeamline` sim. To see the measured points populate,
 * open the **Beamstop** story (or drive `bl531:mono_energy_eV`) so the energy
 * changes over time; here the expected curve is shown at the default position.
 */
const meta = {
    title: 'Ophyd Components/EnergyVsCurrentPlotPV',
    component: EnergyVsCurrentPlotPV,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [withOphydSim(beamstopBeamline)],
} satisfies Meta<typeof EnergyVsCurrentPlotPV>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <EnergyVsCurrentPlotPV
            energyPv="bl531:mono_energy_eV"
            currentPv="bl201-beamstop:current"
            beamstopXRbvPv="bl531_xps2:beamstop_x_mm.RBV"
            beamstopYRbvPv="bl531_xps2:beamstop_y_mm.RBV"
            className="w-[720px]"
        />
    ),
    parameters: {
        docs: {
            source: {
                code: `<EnergyVsCurrentPlotPV
    energyPv="bl531:mono_energy_eV"
    currentPv="bl201-beamstop:current"
    beamstopXRbvPv="bl531_xps2:beamstop_x_mm.RBV"
    beamstopYRbvPv="bl531_xps2:beamstop_y_mm.RBV"
/>`,
                language: 'tsx',
            },
        },
    },
};
