import type { Meta, StoryObj } from '@storybook/react';
import DeviceControllerBox from '@/components/DeviceControllerBox';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import { withOphydSim, defaultBeamline } from '@/lib/ophyd-sim';

/**
 * Single-device controller card (absolute + relative moves, lock). It is a plain
 * presentational component: you feed it a `device` (and optional readback
 * `deviceRBV`) plus the `handleSetValueRequest` / `handleLockClick` callbacks.
 *
 * You obtain those from `useOphydPVSocket`, the same hook used against a real
 * IOC. Below, the `defaultBeamline` sim serves `IOC:m1` / `IOC:m1.RBV`, so
 * moving the box animates the readback live. The sim providers are applied as a
 * decorator and are omitted from the sample code — the code shows exactly how
 * you would wire the component to a PV in your own app.
 */
const meta = {
    title: 'Ophyd Components/DeviceControllerBox',
    component: DeviceControllerBox,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [withOphydSim(defaultBeamline)],
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
            handleSetValueRequest={handleSetValueRequest}
            handleLockClick={toggleDeviceLock}
        />
    );
}

export const Default: Story = {
    render: () => <ConnectedBox />,
    parameters: {
        docs: {
            source: {
                code: `const { devices, handleSetValueRequest, toggleDeviceLock } = useOphydPVSocket([
    'IOC:m1',
    'IOC:m1.RBV',
]);

<DeviceControllerBox
    device={devices['IOC:m1']}
    deviceRBV={devices['IOC:m1.RBV']}
    handleSetValueRequest={handleSetValueRequest}
    handleLockClick={toggleDeviceLock}
/>`,
                language: 'tsx',
            },
        },
    },
};
