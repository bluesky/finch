import { useMemo, type ReactNode } from 'react';
import { useOphydApiUrls } from '@/utils/apiUtils';
import { createWebSocketTransport } from './transport/createWebSocketTransport';
import { createWebSocketDeviceTransport } from './transport/createWebSocketDeviceTransport';
import { createFallbackTransport } from './transport/createFallbackTransport';
import type { OphydPVTransport } from './transport/types';
import type { OphydDeviceTransport } from './transport/deviceTypes';
import type { CameraSocketFactory } from '@/lib/ophyd-sim';
import {
    PVTransportContext,
    DeviceTransportContext,
    CameraSocketFactoryContext,
} from './OphydTransportContext';

export interface OphydTransportProviderProps {
    /** Override the PV-socket transport (e.g. a simulator). */
    transport?: OphydPVTransport;
    /** Override the device-socket transport. */
    deviceTransport?: OphydDeviceTransport;
    /**
     * When true, the provided override transports are wrapped so that, if they
     * report `'error'` or `'closed'`, descendants seamlessly switch to the real
     * WebSocket backend (URLs from config). No-op when no override is supplied.
     * Defaults to false, preserving the prior pass-through behavior.
     */
    fallbackToReal?: boolean;
    /**
     * Override how the camera image socket is created (e.g. a simulator from
     * `createSimCameraSocketFactory()`). Descendant `CameraCanvas`es read this
     * via {@link useCameraSocketFactory}; when omitted they default to the real
     * `WebSocket`. This is the seam that lets a subtree run a mock camera
     * without prop-drilling a factory through every intermediate component.
     */
    cameraSocketFactory?: CameraSocketFactory;
    children: ReactNode;
}

/**
 * Provides PV- and device-socket transports to descendant hooks. When no
 * override is supplied, hooks fall back to lazily-constructed real
 * WebSocket transports via `useOphydPVTransport` / `useOphydDeviceTransport`,
 * preserving the pre-refactor behavior for callers that never wrap in a
 * provider.
 *
 * With `fallbackToReal`, an override transport (e.g. a simulator) becomes the
 * primary and the real WebSocket backend becomes a live fallback — see
 * {@link createFallbackTransport}.
 */
export function OphydTransportProvider({
    transport,
    deviceTransport,
    fallbackToReal = false,
    cameraSocketFactory,
    children,
}: OphydTransportProviderProps) {
    const apiUrls = useOphydApiUrls();
    const pvUrl = apiUrls.getWsUrl('pv-socket');
    const deviceUrl = apiUrls.getWsUrl('device-socket');

    const pvValue = useMemo(() => {
        if (!transport) return null;
        if (!fallbackToReal) return transport;
        return createFallbackTransport(transport, () => createWebSocketTransport({ url: pvUrl }));
    }, [transport, fallbackToReal, pvUrl]);

    const deviceValue = useMemo(() => {
        if (!deviceTransport) return null;
        if (!fallbackToReal) return deviceTransport;
        return createFallbackTransport(deviceTransport, () =>
            createWebSocketDeviceTransport({ url: deviceUrl }),
        );
    }, [deviceTransport, fallbackToReal, deviceUrl]);

    return (
        <PVTransportContext.Provider value={pvValue}>
            <DeviceTransportContext.Provider value={deviceValue}>
                <CameraSocketFactoryContext.Provider value={cameraSocketFactory ?? null}>
                    {children}
                </CameraSocketFactoryContext.Provider>
            </DeviceTransportContext.Provider>
        </PVTransportContext.Provider>
    );
}
