//Instructions
// This here is a copy-paste from useOphydPVSocket.tsx
// This contains alll the code we need to talk to Ophyd Websocket for EPICS pvs.
// Modify this source code so that we return an additional 'messages' state variable
// that can then be dispalyed in 'OphydSocketViewer'

// To do:
// Modify this code so that first, it prints out every message going
// out to the websocket, and every message that comes back from the websocket.

// Once you have that done, the next step is to save each message into a React
// state variable, which is returned from this hook.
//After that's done, you can wire this hook up in TestPage.tsx to replace useOphydPVSocket

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Devices } from 'src/types/deviceControllerTypes';
import { useOphydApiUrls } from '@/utils/apiUtils';
import {
    MessageResponse,
    ErrorResponse,
    ValueUpdateResponse,
    MetaUpdateResponse,
} from '@/api/ophyd/ophydPVSocketTypes';

/**
 * Custom hook for managing WebSocket connections to Ophyd devices.
 * Provides real-time device state management and control functions.
 *
 * @param deviceNameList - Array of EPICS PVs to subscribe to
 * @param wsUrl - Optional WebSocket URL. If not provided, will use environment variables or default to localhost:8001
 * @returns Object containing device states, control functions, and message history
 */
export default function useOphydPVSocket(deviceNameList: string[], wsUrl?: string) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedDeviceNames = useMemo(() => deviceNameList, [JSON.stringify(deviceNameList)]);
    const configWsUrl = useOphydApiUrls().getWsUrl('pv-socket');
    const apiUrl: string = wsUrl ?? configWsUrl;

    const [devices, setDevices] = useState<Devices>(() => {
        const initialDevices: Devices = {};
        memoizedDeviceNames.forEach((deviceName) => {
            initialDevices[deviceName] = {
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
        });
        return initialDevices;
    });

    // --- NEW STATE FOR MESSAGES ---
    const [messages, setMessages] = useState<{ direction: 'SENT' | 'RCVD'; data: string }[]>([]);

    const wsRef = useRef<WebSocket | null>(null);
    const hasRenderedOnlyOnce = useRef(false);

    /**
     * Helper to log and store websocket messages
     */
    const logMessage = useCallback((direction: 'SENT' | 'RCVD', data: string) => {
        console.log(`[WebSocket ${direction}]:`, data);
        setMessages((prev) => [...prev, { direction, data }]);
    }, []);

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
            if (wsRef.current) {
                const setValueMessage = {
                    action: 'set',
                    pv: deviceName,
                    value: value,
                };
                const payload = JSON.stringify(setValueMessage);

                // Log outgoing message
                logMessage('SENT', payload);
                wsRef.current.send(payload);
            }
        },
        [logMessage],
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
            const initialDevices: Devices = {};
            memoizedDeviceNames.forEach((deviceName) => {
                initialDevices[deviceName] = {
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
            });
            setDevices(initialDevices);
        } else {
            hasRenderedOnlyOnce.current = true;
        }
    }, [memoizedDeviceNames]);

    useEffect(() => {
        if (memoizedDeviceNames.length === 0) {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            return;
        }

        const ws = new WebSocket(apiUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            memoizedDeviceNames.forEach((deviceName) => {
                const subscribeMessage = {
                    action: 'subscribe',
                    pv: deviceName,
                };
                const payload = JSON.stringify(subscribeMessage);

                // Log outgoing subscription messages
                logMessage('SENT', payload);
                ws.send(payload);
            });
        };

        ws.onmessage = (event) => {
            // Log incoming message
            logMessage('RCVD', event.data);

            try {
                const message:
                    | MessageResponse
                    | ErrorResponse
                    | ValueUpdateResponse
                    | MetaUpdateResponse = JSON.parse(event.data);
                if ('sub_type' in message && message.sub_type === 'meta') {
                    setDevices((prevDevices) => ({
                        ...prevDevices,
                        [message.pv]: {
                            ...prevDevices[message.pv],
                            ...message,
                            min: message.lower_ctrl_limit,
                            max: message.upper_ctrl_limit,
                        },
                    }));
                } else if ('pv' in message) {
                    const deviceName = message.pv;
                    setDevices((prevDevices) => ({
                        ...prevDevices,
                        [deviceName]: {
                            ...prevDevices[deviceName],
                            ...message,
                        },
                    }));
                }
                if ('error' in message) {
                    console.error('WebSocket error message:', message.error);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            // Optional: log closure to messages state
            // logMessage('RCVD', 'Connection Closed');
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [wsUrl, memoizedDeviceNames, apiUrl, logMessage]);

    return {
        devices,
        messages, // Now returning the history of messages
        toggleDeviceLock,
        handleSetValueRequest,
        toggleExpand,
    };
}
