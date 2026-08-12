import type { Meta, StoryObj } from '@storybook/react';
import Beamstop from '@/features/Beamstop';
import { withOphydSim, beamstopBeamline } from '@/lib/ophyd-sim';

/**
 * Full beamstop-alignment feature: a live diode-current trend, X/Y motor
 * controllers, an optional beam-energy control, and an Energy-vs-Current plot.
 * It takes the PV names of its devices as props and wires them with
 * `useOphydPVSocket`.
 *

 * 
 * Try moving the beamstop motors to find the peak current, then click "Go To Best" to return to that position.
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
        <div className="h-fit w-full p-4">
            <Beamstop
                beamstopXName="bl531_xps2:beamstop_x_mm"
                beamstopYName="bl531_xps2:beamstop_y_mm"
                beamstopCurrentName="bl201-beamstop:current"
                beamstopXTitle="Beamstop X"
                beamstopYTitle="Beamstop Y"
                enableBestOption
                stackVertical={true}
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
