import type { Meta, StoryObj } from '@storybook/react';
import DeviceControllerBox from '../components/DeviceControllerBox';
import useOphydPVSocket from '../api/ophyd/useOphydPVSocket';

/**
 * Story that proves shared-state behavior of the ophyd-sim transport.
 *
 * The Storybook global decorator (configured in .storybook/preview.ts) wraps
 * every story in an OphydSimProvider + OphydTransportProvider bound to a
 * single simulator instance. Two DeviceControllerBox instances below each
 * call useOphydPVSocket independently for IOC:m1; moving via one updates
 * the readback on both because they share the same simulator.
 */
const meta = {
    title: 'Bluesky Components/DeviceControllerBox',
    component: DeviceControllerBox,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof DeviceControllerBox>;

export default meta;
type Story = StoryObj<typeof meta>;

function ConnectedBox() {
    const { devices, handleSetValueRequest, toggleDeviceLock } = useOphydPVSocket([
        'IOC:m1',
        'IOC:m1.RBV',
    ]);
    return (
        <DeviceControllerBox
            device={devices['IOC:m1']}
            deviceRBV={devices['IOC:m1.RBV']}
            handleLockClick={toggleDeviceLock}
            handleSetValueRequest={handleSetValueRequest}
        />
    );
}

export const Default: Story = {
    render: () => <ConnectedBox />,
};

export const SharedStateWithTwoConsumers: Story = {
    name: 'Shared state across two consumers',
    render: () => (
        <div className="flex flex-col gap-4">
            <ConnectedBox />
            <ConnectedBox />
        </div>
    ),
};
