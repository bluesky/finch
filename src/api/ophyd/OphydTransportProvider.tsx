import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useOphydApiUrls } from '@/utils/apiUtils';
import { createWebSocketTransport } from './transport/createWebSocketTransport';
import { createWebSocketDeviceTransport } from './transport/createWebSocketDeviceTransport';
import type { OphydPVTransport } from './transport/types';
import type { OphydDeviceTransport } from './transport/deviceTypes';

const PVTransportContext = createContext<OphydPVTransport | null>(null);
const DeviceTransportContext = createContext<OphydDeviceTransport | null>(null);

export interface OphydTransportProviderProps {
    /** Override the PV-socket transport (e.g. a simulator). */
    transport?: OphydPVTransport;
    /** Override the device-socket transport. */
    deviceTransport?: OphydDeviceTransport;
    children: ReactNode;
}

/**
 * Provides PV- and device-socket transports to descendant hooks. When no
 * override is supplied, hooks fall back to lazily-constructed real
 * WebSocket transports via `useOphydPVTransport` / `useOphydDeviceTransport`,
 * preserving the pre-refactor behavior for callers that never wrap in a
 * provider.
 */
export function OphydTransportProvider({
    transport,
    deviceTransport,
    children,
}: OphydTransportProviderProps) {
    return (
        <PVTransportContext.Provider value={transport ?? null}>
            <DeviceTransportContext.Provider value={deviceTransport ?? null}>
                {children}
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
