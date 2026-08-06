import type { Meta, StoryObj } from '@storybook/react';
import Beamstop from '@/features/Beamstop';
import { withOphydSim, beamstopBeamline } from '@/lib/ophyd-sim';

/**
 * Full beamstop-alignment feature: a live diode-current trend, X/Y motor
 * controllers, an optional beam-energy control, and an Energy-vs-Current plot.
 * It takes the PV names of its devices as props and wires them with
 * `useOphydPVSocket`.
 *
 * The `beamstopBeamline` sim provides all of those PVs — the diode current is a
 * derived signal that peaks when the stop is centered on the (energy-dependent)
 * beam, so sweeping X/Y or energy changes the reading live. `enableBestOption`
 * turns on the "Go To Best" helper that tracks the strongest current seen.
 */
const meta = {
    title: 'Ophyd Components/Beamstop',
    component: Beamstop,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
    decorators: [withOphydSim(beamstopBeamline)],
} satisfies Meta<typeof Beamstop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <div className="h-[860px] w-full p-4">
            <Beamstop
                beamstopXName="bl531_xps2:beamstop_x_mm"
                beamstopYName="bl531_xps2:beamstop_y_mm"
                beamstopCurrentName="bl201-beamstop:current"
                beamstopEnergyName="bl531:mono_energy_eV"
                beamstopXTitle="Beamstop X"
                beamstopYTitle="Beamstop Y"
                enableBestOption
                stackVertical={false}
            />
        </div>
    ),
    parameters: {
        docs: {
            source: {
                code: `<Beamstop
    beamstopXName="bl531_xps2:beamstop_x_mm"
    beamstopYName="bl531_xps2:beamstop_y_mm"
    beamstopCurrentName="bl201-beamstop:current"
    beamstopEnergyName="bl531:mono_energy_eV"
    beamstopXTitle="Beamstop X"
    beamstopYTitle="Beamstop Y"
    enableBestOption
    stackVertical={false}
/>`,
                language: 'tsx',
            },
        },
    },
};
