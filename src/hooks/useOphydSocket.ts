import { useState, useRef, useEffect, useCallback } from 'react';
import { Device, Devices } from 'src/types/deviceControllerTypes';
import {
    MessageResponse,
    ErrorResponse,
    ValueUpdateResponse,
    MetaUpdateResponse,
} from 'src/types/ophydSocketTypes';

export default function useOphydSocket(deviceNameList: string[], wsUrl?: string) {
    //user provided wsUrl takes precedence, otherwise check for env variable, then check env variable for port
    const address = window.location.hostname;
    const apiPort:string = (import.meta.env.VITE_OPHYD_API_PORT || `8001`);
    const path = 'pv-socket'
    const apiUrl:string = wsUrl ? wsUrl : (import.meta.env.VITE_OPHYD_WS ? `${import.meta.env.VITE_OPHYD_WS}/${path}` : `ws://${address}:${apiPort}/api/v1/${path}`);
    const [devices, setDevices] = useState<Devices>({});
    const wsRef = useRef<WebSocket | null>(null);
    // Toggle device lock
    const toggleDeviceLock = useCallback((deviceName: string) => {
        setDevices((prevDevices) => ({
            ...prevDevices,
            [deviceName]: {
                ...prevDevices[deviceName],
                locked: !prevDevices[deviceName].locked,
            },
        }));
    }, []);

    //Callback function to send device updates thru websocket
    const handleSetValueRequest = useCallback((deviceName: string, value: string | number | boolean) => {
        if (wsRef.current) {
            const setValueMessage = {
                action: 'set',
                pv: deviceName,
                value: value,
            };
            wsRef.current.send(JSON.stringify(setValueMessage));
        }
    }, []);

    const toggleExpand = useCallback((deviceName: string) => {
        setDevices((prevDevices) => ({
            ...prevDevices,
            [deviceName]: {
                ...prevDevices[deviceName],
                expanded: !prevDevices[deviceName].expanded,
            },
        }));
    }, []);

    // Initialize devices state
    useEffect(() => {
        console.log('initializing devices state');
        const initialDevices: Devices = {};
        deviceNameList.forEach((deviceName) => {
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
    }, [deviceNameList]);

    // Initialize WebSocket connection
    useEffect(() => {
        // Don't connect if no devices to subscribe to
        if (deviceNameList.length === 0) {
            // Close existing connection if devices list becomes empty
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            return;
        }

        console.log('initializing WebSocket connection');
        const ws = new WebSocket(apiUrl);
        wsRef.current = ws;

        // Open WebSocket connection and subscribe to devices
        ws.onopen = () => {
            console.log('WebSocket connection opened');
            deviceNameList.forEach((deviceName) => {
                const subscribeMessage = {
                    action: 'subscribe',
                    pv: deviceName,
                };
                ws.send(JSON.stringify(subscribeMessage));
            });
        };

        // Handle incoming WebSocket messages
        ws.onmessage = (event) => {
            try {
                const message: MessageResponse | ErrorResponse | ValueUpdateResponse | MetaUpdateResponse = JSON.parse(event.data);

                if ('sub_type' in message && message.sub_type === 'meta') {
                    //meta updates occur when we first subscribe to a device, or if the connection changes (lost or regained EPICS connection)
                    setDevices((prevDevices) => ({
                        ...prevDevices,
                        [message.pv]: {
                            ...prevDevices[message.pv],
                            ...message,
                            //connected: message.connected,
                            //units: message.units,
                            min: message.lower_ctrl_limit,
                            max: message.upper_ctrl_limit,
                            
                        },
                    }));
                } else if ('pv' in message) {
                    //pv is in the message on regular updates to the device value
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

        // Handle WebSocket errors
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Handle WebSocket closure
        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Cleanup WebSocket connection on unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [wsUrl, deviceNameList]);

    return {
        devices,
        toggleDeviceLock,
        handleSetValueRequest,
        toggleExpand,
    };
}