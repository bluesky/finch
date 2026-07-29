import { createContext, useContext, useMemo } from 'react';
import { useOphydApiUrls } from '@/utils/apiUtils';
import { createWebSocketTransport } from './transport/createWebSocketTransport';
import { createWebSocketDeviceTransport } from './transport/createWebSocketDeviceTransport';
import type { OphydPVTransport } from './transport/types';
import type { OphydDeviceTransport } from './transport/deviceTypes';
import type { CameraSocketFactory, CameraSocketLike } from '@/lib/ophyd-sim';

export const PVTransportContext = createContext<OphydPVTransport | null>(null);
export const DeviceTransportContext = createContext<OphydDeviceTransport | null>(null);
export const CameraSocketFactoryContext = createContext<CameraSocketFactory | null>(null);

/**
 * Default camera socket: a thin wrapper over the real browser `WebSocket`. The
 * real socket's surface is wider than {@link CameraSocketLike} (its `onmessage`
 * carries a full `MessageEvent`), so we cast — consumers only touch the subset
 * the interface declares.
 */
const defaultCameraSocketFactory: CameraSocketFactory = (url) =>
    new WebSocket(url) as unknown as CameraSocketLike;

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
