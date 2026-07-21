import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useOphydApiUrls } from '@/utils/apiUtils';
import { createWebSocketTransport } from './transport/createWebSocketTransport';
import { createWebSocketDeviceTransport } from './transport/createWebSocketDeviceTransport';
import { createFallbackTransport } from './transport/createFallbackTransport';
import type { OphydPVTransport } from './transport/types';
import type { OphydDeviceTransport } from './transport/deviceTypes';
import type { CameraSocketFactory, CameraSocketLike } from '@/lib/ophyd-sim';

const PVTransportContext = createContext<OphydPVTransport | null>(null);
const DeviceTransportContext = createContext<OphydDeviceTransport | null>(null);
const CameraSocketFactoryContext = createContext<CameraSocketFactory | null>(null);

/**
 * Default camera socket: a thin wrapper over the real browser `WebSocket`. The
 * real socket's surface is wider than {@link CameraSocketLike} (its `onmessage`
 * carries a full `MessageEvent`), so we cast — consumers only touch the subset
 * the interface declares.
 */
const defaultCameraSocketFactory: CameraSocketFactory = (url) =>
    new WebSocket(url) as unknown as CameraSocketLike;

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

/**
 * Read the PV-socket transport from context, or construct a default
 * WebSocket transport pointed at the configured ophyd backend.
 *
 * The fallback transport is memoized per URL so re-renders of consumers
 * don't churn connections.
 */
export function useOphydPVTransport(overrideUrl?: string): OphydPVTransport {
    const fromContext = useContext(PVTransportContext);
    const configWsUrl = useOphydApiUrls().getWsUrl('pv-socket');
    const url = overrideUrl ?? configWsUrl;

    // Construct fallback transports on demand. useMemo keyed on url means we
    // get one transport per (url) per consumer that lacks a provider. This
    // matches the prior per-hook WebSocket behavior — see plan for the
    // shared-state caveat that motivated the refactor.
    const fallback = useMemo(() => {
        if (fromContext) return null;
        return createWebSocketTransport({ url });
    }, [fromContext, url]);

    if (fromContext) return fromContext;
    if (!fallback) {
        throw new Error('useOphydPVTransport: no transport available');
    }
    return fallback;
}

export function useOphydDeviceTransport(overrideUrl?: string): OphydDeviceTransport {
    const fromContext = useContext(DeviceTransportContext);
    const configWsUrl = useOphydApiUrls().getWsUrl('device-socket');
    const url = overrideUrl ?? configWsUrl;

    const fallback = useMemo(() => {
        if (fromContext) return null;
        return createWebSocketDeviceTransport({ url });
    }, [fromContext, url]);

    if (fromContext) return fromContext;
    if (!fallback) {
        throw new Error('useOphydDeviceTransport: no transport available');
    }
    return fallback;
}

/**
 * Read the camera socket factory from context, or fall back to one that wraps
 * the real browser `WebSocket`. Unlike the transport hooks this never throws —
 * a default always exists, so cameras work with no provider present.
 */
export function useCameraSocketFactory(): CameraSocketFactory {
    return useContext(CameraSocketFactoryContext) ?? defaultCameraSocketFactory;
}
