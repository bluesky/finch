import type { Meta, StoryObj } from '@storybook/react';
import SignalMonitorPlotPV from '@/components/SignalMonitorPlotPV';
import { withOphydSim, beamstopBeamline } from '@/lib/ophyd-sim';

/**
 * Live strip-chart for a single EPICS PV. `SignalMonitorPlotPV` takes a `pv`
 * name, subscribes with `useOphydPVSocket`, and plots each new value on a
 * rolling time window.
 *
 * Driven by the `beamstopBeamline` sim, which exposes the derived diode-current
 * PV `bl201-beamstop:current` (it updates every 100 ms). The sim providers are a
 * decorator, so the code below is just the component.
 */
const meta = {
    title: 'Ophyd Components/SignalMonitorPlotPV',
    component: SignalMonitorPlotPV,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [withOphydSim(beamstopBeamline)],
} satisfies Meta<typeof SignalMonitorPlotPV>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <SignalMonitorPlotPV
            pv="bl201-beamstop:current"
            className="h-96 w-[640px]"
            numVisiblePoints={200}
            tickTextIntervalSeconds={30}
        />
    ),
    parameters: {
        docs: {
            source: {
                code: `<SignalMonitorPlotPV
    pv="bl201-beamstop:current"
    className="h-96 w-[640px]"
    numVisiblePoints={200}
    tickTextIntervalSeconds={30}
/>`,
                language: 'tsx',
            },
        },
    },
};
