import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { OphydDevices } from '@/types/deviceControllerTypes';
import { useOphydDeviceTransport } from './OphydTransportContext';
import type { OphydDeviceTransport } from './transport/deviceTypes';

/**
 * Device-socket counterpart of {@link useOphydPVSocket}. Uses the
 * device-channel protocol where messages key on `device` instead of `pv`.
 *
 * See OphydTransportProvider for the transport context. When no provider is
 * mounted, a fallback WebSocket transport is constructed lazily.
 */
export default function useOphydDeviceSocket(deviceNameList: string[], wsUrl?: string) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedDeviceNames = useMemo(() => deviceNameList, [JSON.stringify(deviceNameList)]);
    const transport: OphydDeviceTransport = useOphydDeviceTransport(wsUrl);

    const [devices, setDevices] = useState<OphydDevices>(() => initialDevices(memoizedDeviceNames));
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
            transport.send({ action: 'set', device: deviceName, value });
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

        // Register the listener before sending subscribe — the sim transport
        // emits the initial meta+value synchronously, so a listener attached
        // afterward would miss it.
        const unsubscribeMessages = transport.onMessage((message) => {
            if ('sub_type' in message && message.sub_type === 'meta') {
                setDevices((prevDevices) =>
                    prevDevices[message.device]
                        ? {
                              ...prevDevices,
                              [message.device]: {
                                  ...prevDevices[message.device],
                                  ...message,
                                  min: message.lower_ctrl_limit,
                                  max: message.upper_ctrl_limit,
                              },
                          }
                        : prevDevices,
                );
            } else if ('device' in message) {
                const deviceName = message.device;
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
                console.error('Ophyd device socket error:', message.error);
            }
        });

        for (const deviceName of memoizedDeviceNames) {
            transport.send({ action: 'subscribe', device: deviceName });
        }

        return () => {
            unsubscribeMessages();
            for (const deviceName of memoizedDeviceNames) {
                transport.send({ action: 'unsubscribe', device: deviceName });
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

function initialDevices(names: string[]): OphydDevices {
    const map: OphydDevices = {};
    for (const deviceName of names) {
        map[deviceName] = {
            name: deviceName,
            value: '',
            connected: false,
            locked: false,
            timestamp: 0,
            expanded: false,
            device: deviceName,
            read_access: false,
            write_access: false,
        };
    }
    return map;
}
