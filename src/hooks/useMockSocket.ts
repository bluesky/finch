import { useState, useEffect } from 'react';
import { Device, Devices } from 'src/types/deviceControllerTypes';
import { deviceMessages } from './deviceMessages';


export default function useMockOphydSocket(deviceNameList: string[]) {
    const [devices, setDevices] = useState<Devices>({});

    // Initialize devices state
    useEffect(() => {
        console.log('initializing mock devices state');
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

    // Process mock messages
    useEffect(() => {
        if (deviceNameList.length === 0) {
            return;
        }

        console.log('processing mock messages');

        // Process each device in the mock data
        Object.keys(deviceMessages).forEach((key) => {
            const deviceName = key;
            const messages = deviceMessages[key as keyof typeof deviceMessages] as any[];

            // Only process if this device is in our deviceNameList
            if (!deviceNameList.includes(deviceName)) return;

            // Process messages in order to simulate the real behavior
            // Process messages in order to simulate the real behavior
            messages.forEach((messageWrapper, index) => {
                setTimeout(() => {
                    const message = messageWrapper.data;

                    setDevices((prevDevices) => {
                        if (!prevDevices[deviceName]) return prevDevices;

                        let updatedDevice = { ...prevDevices[deviceName] };

                        // Handle meta updates
                        if ('update' in message && message.update.sub_type === 'meta') {
                            updatedDevice = {
                                ...updatedDevice,
                                ...message.update,
                                min: message.update.lower_ctrl_limit,
                                max: message.update.upper_ctrl_limit,
                            };
                        }
                        // Handle value updates (when update exists but no sub_type)
                        else if ('update' in message && !message.update.sub_type) {
                            updatedDevice = {
                                ...updatedDevice,
                                ...message.update,
                            };
                        }
                        // Handle direct messages with 'pv' field
                        else if ('pv' in message) {
                            updatedDevice = {
                                ...updatedDevice,
                                ...message,
                            };
                        }

                        return {
                            ...prevDevices,
                            [deviceName]: updatedDevice,
                        };
                    });
                }, index * 100);
            });
        });
    }, [deviceNameList]);
    const handleSetValueRequest = (deviceName: string, value: string | number | boolean) => {
    console.log(`Mock setting device "${deviceName}" to value:`, value);
    
    setDevices((prevDevices) => {
        // Check if the device exists
        if (!prevDevices[deviceName]) {
            console.warn(`Device "${deviceName}" not found`);
            return prevDevices;
        }

        const currentTimestamp = Date.now() / 1000; // Convert to seconds to match EPICS timestamp format
        let updatedDevices = { ...prevDevices };

        // Update the main device with the new value and timestamp
        updatedDevices[deviceName] = {
            ...prevDevices[deviceName],
            value: value,
            timestamp: currentTimestamp,
        };

        // Check if there's a corresponding RBV device and update it too
        const rbvDeviceName = `${deviceName}_RBV`;
        if (updatedDevices[rbvDeviceName]) {
            console.log(`Also updating RBV device "${rbvDeviceName}" to value:`, value);
            updatedDevices[rbvDeviceName] = {
                ...updatedDevices[rbvDeviceName],
                value: value,
                timestamp: currentTimestamp,
            };
        }

        return updatedDevices;
    });
};
    return {
        devices,
        handleSetValueRequest,
    };
}