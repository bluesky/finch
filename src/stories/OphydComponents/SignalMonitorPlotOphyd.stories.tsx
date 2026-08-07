import type { Meta, StoryObj } from '@storybook/react';
import SignalMonitorPlotOphyd from '@/components/SignalMonitorPlotOphyd';
import { withDeviceTransport } from '../demos/ophydSimDecorators';
import { createMockDeviceTransport } from '../demos/mockDeviceTransport';

/**
 * Live strip-chart wired by **Ophyd device name** (the device-socket counterpart
 * of `SignalMonitorPlotPV`). It subscribes with `useOphydDeviceSocket` and plots
 * the device value on a rolling window.
 *
 * Because ophyd-sim serves PVs, not the device socket, a small mock device
 * transport supplies a live, oscillating `beamstop_current` device here. The
 * transport is a decorator; the sample code shows only the component.
 */
const deviceTransport = createMockDeviceTransport({
    beamstop_current: {
        initialValue: 50,
        units: 'arb.',
        periodMs: 500,
        // Gentle oscillation so the plot visibly moves.
        animate: (t) => 50 + 40 * Math.sin(t / 2),
    },
});

const meta = {
    title: 'Ophyd Components/SignalMonitorPlotOphyd',
    component: SignalMonitorPlotOphyd,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [withDeviceTransport(deviceTransport)],
} satisfies Meta<typeof SignalMonitorPlotOphyd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <SignalMonitorPlotOphyd
            deviceName="beamstop_current"
            className="h-96 w-[640px]"
            numVisiblePoints={60}
        />
    ),
    parameters: {
        docs: {
            source: {
                code: `<SignalMonitorPlotOphyd
    deviceName="beamstop_current"
    className="h-96 w-[640px]"
    numVisiblePoints={60}
/>`,
                language: 'tsx',
            },
        },
    },
};
