import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Devices } from '@/types/deviceControllerTypes';
import { useOphydPVTransport } from './OphydTransportContext';
import type { OphydPVTransport } from './transport/types';

/**
 * Manage subscriptions to a set of EPICS PVs and surface their values as a
 * Devices map.
 *
 * Connection lifecycle is delegated to a transport read from
 * OphydTransportProvider — see [src/api/ophyd/OphydTransportProvider.tsx].
 * When no provider is mounted, a fallback transport pointed at the
 * configured ophyd-websocket backend is created lazily (one per
 * consumer-URL pair). To make two hook calls observe the same state, wrap
 * the tree in an OphydTransportProvider with a shared transport.
 *
 * @param deviceNameList - EPICS PVs to subscribe to.
 * @param wsUrl - Optional URL override that builds an ad-hoc WebSocket
 *   transport for this consumer only. Ignored when an OphydTransportProvider
 *   supplies a transport.
 */
export default function useOphydPVSocket(deviceNameList: string[], wsUrl?: string) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedDeviceNames = useMemo(() => deviceNameList, [JSON.stringify(deviceNameList)]);
    const transport: OphydPVTransport = useOphydPVTransport(wsUrl);

    const [devices, setDevices] = useState<Devices>(() => initialDevices(memoizedDeviceNames));
    const hasRenderedOnlyOnce = useRef(false);

    const toggleDeviceLock = useCallback((deviceName: string) => {
        setDevices((prevDevices) => ({
            ...prevDevices,
            [deviceName]: {
                ...prevDevices[deviceName],
                locked: !prevDevices[deviceName].locked,
            },
        }));
    }, []);

    const handleSetValueRequest = useCallback(
        (deviceName: string, value: string | number | boolean) => {
            transport.send({ action: 'set', pv: deviceName, value });
        },
        [transport],
    );

    const toggleExpand = useCallback((deviceName: string) => {
        setDevices((prevDevices) => ({
            ...prevDevices,
            [deviceName]: {
                ...prevDevices[deviceName],
                expanded: !prevDevices[deviceName].expanded,
            },
        }));
    }, []);

    useEffect(() => {
        if (hasRenderedOnlyOnce.current) {
            setDevices(initialDevices(memoizedDeviceNames));
        } else {
            hasRenderedOnlyOnce.current = true;
        }
    }, [memoizedDeviceNames]);

    useEffect(() => {
        if (memoizedDeviceNames.length === 0) return;

        // Register the message listener before sending subscribe — the sim
        // transport replays the initial meta+value synchronously inside
        // send(subscribe), so a listener attached afterward would miss it.
        const unsubscribeMessages = transport.onMessage((message) => {
            if ('sub_type' in message && message.sub_type === 'meta') {
                setDevices((prevDevices) =>
                    prevDevices[message.pv]
                        ? {
                              ...prevDevices,
                              [message.pv]: {
                                  ...prevDevices[message.pv],
                                  ...message,
                                  min: message.lower_ctrl_limit,
                                  max: message.upper_ctrl_limit,
                              },
                          }
                        : prevDevices,
                );
            } else if ('pv' in message) {
                const deviceName = message.pv;
                setDevices((prevDevices) =>
                    prevDevices[deviceName]
                        ? {
                              ...prevDevices,
                              [deviceName]: {
                                  ...prevDevices[deviceName],
                                  ...message,
                              },
                          }
                        : prevDevices,
                );
            } else if ('error' in message) {
                console.error('Ophyd PV socket error:', message.error);
            }
        });

        for (const deviceName of memoizedDeviceNames) {
            transport.send({ action: 'subscribe', pv: deviceName });
        }

        return () => {
            unsubscribeMessages();
            for (const deviceName of memoizedDeviceNames) {
                transport.send({ action: 'unsubscribe', pv: deviceName });
            }
        };
    }, [transport, memoizedDeviceNames]);

    return {
        devices,
        toggleDeviceLock,
        handleSetValueRequest,
        toggleExpand,
    };
}

function initialDevices(names: string[]): Devices {
    const map: Devices = {};
    for (const deviceName of names) {
        map[deviceName] = {
            name: deviceName,
            value: '',
            connected: false,
            locked: false,
            timestamp: 0,
            expanded: false,
            pv: deviceName,
            read_access: false,
            write_access: false,
        };
    }
    return map;
}
