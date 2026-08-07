import type { Meta, StoryObj } from '@storybook/react';
import CameraContainer from '@/components/Camera/CameraContainer';
import { beamstopBeamline, simDetectorConfig } from '@/lib/ophyd-sim';
import { withCameraSim } from '../demos/ophydSimDecorators';

/**
 * Area-detector viewer: a live image canvas plus Acquire/Pause controls (and an
 * optional settings panel). It takes a detector `prefix` and streams frames over
 * the camera socket while subscribing to the detector's control PVs.
 *
 * Driven by the `beamstopBeamline` sim's `13SIM1` detector: the `withCameraSim`
 * decorator supplies both the PV transport and a simulated camera-socket factory,
 * so the canvas renders live derived frames with no backend. `autoStart` begins
 * the stream on mount (otherwise press **Acquire**). The settings panel and the
 * PV-acquire control panel are disabled here, leaving the canvas's own
 * Acquire/Pause stream controls, to keep the demo focused on the image. The
 * sample code shows only the component.
 */
const meta = {
    title: 'Ophyd Components/CameraContainer',
    component: CameraContainer,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [withCameraSim(beamstopBeamline, simDetectorConfig)],
} satisfies Meta<typeof CameraContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <CameraContainer
            prefix="13SIM1"
            imageArrayPV="13SIM1:image1:ArrayData"
            enableSettings={false}
            enableControlPanel={false}
            autoStart
        />
    ),
    parameters: {
        docs: {
            source: {
                code: `<CameraContainer
    prefix="13SIM1"
    imageArrayPV="13SIM1:image1:ArrayData"
    enableSettings={false}
    enableControlPanel={false}
    autoStart
/>`,
                language: 'tsx',
            },
        },
    },
};
