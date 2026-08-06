import type { ReactNode } from 'react';
import type { OphydSim, DetectorConfig, CameraSocketFactory } from '@/lib/ophyd-sim';
import {
    OphydSimProvider,
    createOphydSimTransport,
    createSimDetectorCameraSocketFactory,
} from '@/lib/ophyd-sim';
import { OphydTransportProvider } from '@/api/ophyd/OphydTransportProvider';
import type { OphydDeviceTransport } from '@/api/ophyd/transport/deviceTypes';

type Decorator = (Story: () => ReactNode) => ReactNode;

/**
 * Like `withOphydSim`, but also wires a simulated camera-socket factory so
 * `CameraCanvas` / `CameraContainer` render live frames from the sim detector.
 * Applied as a per-story decorator, none of this wrapper appears in the docs
 * source snippet — only the component itself does.
 */
export function withCameraSim(sim: OphydSim, detectorConfig: DetectorConfig): Decorator {
    const transport = createOphydSimTransport(sim);
    const cameraSocketFactory: CameraSocketFactory = createSimDetectorCameraSocketFactory(
        sim,
        detectorConfig,
    );
    return function CameraSimDecorator(Story) {
        return (
            <OphydSimProvider sim={sim}>
                <OphydTransportProvider
                    transport={transport}
                    cameraSocketFactory={cameraSocketFactory}
                >
                    <Story />
                </OphydTransportProvider>
            </OphydSimProvider>
        );
    };
}

/**
 * Supplies a device-socket transport (e.g. a mock) to descendants. Used for the
 * `*Ophyd` components, which talk over the device socket that ophyd-sim's PV
 * transport doesn't serve.
 */
export function withDeviceTransport(deviceTransport: OphydDeviceTransport): Decorator {
    return function DeviceTransportDecorator(Story) {
        return (
            <OphydTransportProvider deviceTransport={deviceTransport}>
                <Story />
            </OphydTransportProvider>
        );
    };
}
