import type { Meta, StoryObj } from '@storybook/react';
import TableDeviceControllerWithRBV from '@/components/TableDeviceControllerWithRBV';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import { withOphydSim, beamstopBeamline } from '@/lib/ophyd-sim';

/**
 * Tabular multi-device controller with a separate readback column. It takes a
 * `devices` map (setpoints) and a `devicesRBV` map (readbacks) plus the move /
 * lock / expand callbacks.
 *
 * Build both maps from `useOphydPVSocket` — one subscription for the setpoints
 * and one for the `.RBV` readbacks. The `beamstopBeamline` sim serves the two
 * beamstop motors below, so each move animates its readback live. The sim
 * providers are a decorator; the sample code shows only the hook + component.
 */
const meta = {
    title: 'Ophyd Components/TableDeviceControllerWithRBV',
    component: TableDeviceControllerWithRBV,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    decorators: [withOphydSim(beamstopBeamline)],
} satisfies Meta<typeof TableDeviceControllerWithRBV>;

export default meta;
type Story = StoryObj<typeof meta>;

const MOTORS = ['bl531_xps2:beamstop_x_mm', 'bl531_xps2:beamstop_y_mm'];
const MOTORS_RBV = ['bl531_xps2:beamstop_x_mm.RBV', 'bl531_xps2:beamstop_y_mm.RBV'];

function ConnectedTable() {
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
        useOphydPVSocket(MOTORS);
    const { devices: devicesRBV } = useOphydPVSocket(MOTORS_RBV);
    return (
        <TableDeviceControllerWithRBV
            devices={devices}
            devicesRBV={devicesRBV}
            handleSetValueRequest={handleSetValueRequest}
            toggleDeviceLock={toggleDeviceLock}
            toggleExpand={toggleExpand}
            collapsibleRelativeMove
        />
    );
}

export const Default: Story = {
    render: () => <ConnectedTable />,
    parameters: {
        docs: {
            source: {
                code: `const MOTORS = ['bl531_xps2:beamstop_x_mm', 'bl531_xps2:beamstop_y_mm'];
const MOTORS_RBV = ['bl531_xps2:beamstop_x_mm.RBV', 'bl531_xps2:beamstop_y_mm.RBV'];

const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
    useOphydPVSocket(MOTORS);
const { devices: devicesRBV } = useOphydPVSocket(MOTORS_RBV);

<TableDeviceControllerWithRBV
    devices={devices}
    devicesRBV={devicesRBV}
    handleSetValueRequest={handleSetValueRequest}
    toggleDeviceLock={toggleDeviceLock}
    toggleExpand={toggleExpand}
    collapsibleRelativeMove
/>`,
                language: 'tsx',
            },
        },
    },
};
