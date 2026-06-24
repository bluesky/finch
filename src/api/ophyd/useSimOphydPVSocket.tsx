import { useState, useRef, useEffect, useCallback } from 'react';
import { Devices } from 'src/types/deviceControllerTypes';

/**
 * Simulated drop-in replacement for `useOphydPVSocket` that requires no real
 * backend or WebSocket connection.
 *
 * Special device name keywords:
 *   - `"sineSignal"` — value continuously tracks a sine wave (0–100, period ~6 s)
 *   - `"noisySignal"` — value is random noise between 0 and 100
 *
 * All other device names behave as a dummy motor: connected and readable, but
 * their value only changes when `handleSetValueRequest` is called for them.
 *
 * @param deviceNameList - Array of PV names to simulate
 * @param _wsUrl - Ignored; present only for API compatibility with `useOphydPVSocket`
 */
export default function useSimOphydPVSocket(deviceNameList: string[], _wsUrl?: string) {
    const [devices, setDevices] = useState<Devices>(() => {
        const initial: Devices = {};
        deviceNameList.forEach((name) => {
            initial[name] = makeDevice(name, 0);
        });
        return initial;
    });

    // Tick counter drives animated signals
    const tickRef = useRef(0);

    // Update animated devices every 100 ms
    useEffect(() => {
        const interval = setInterval(() => {
            tickRef.current += 1;
            const t = tickRef.current * 0.1; // seconds

            setDevices((prev) => {
                let changed = false;
                const next = { ...prev };

                deviceNameList.forEach((name) => {
                    if (name === 'sineSignal') {
                        const value = Math.sin((2 * Math.PI * t) / 6) * 50 + 50; // 0–100, ~6 s period
                        next[name] = { ...prev[name], value, timestamp: Date.now() };
                        changed = true;
                    } else if (name === 'noisySignal') {
                        const value = Math.random() * 100;
                        next[name] = { ...prev[name], value, timestamp: Date.now() };
                        changed = true;
                    }
                });

                return changed ? next : prev;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [deviceNameList]);

    // Reset devices when the list changes
    useEffect(() => {
        setDevices((prev) => {
            const next: Devices = {};
            deviceNameList.forEach((name) => {
                next[name] = prev[name] ?? makeDevice(name, 0);
            });
            return next;
        });
    }, [deviceNameList]);

    const toggleDeviceLock = useCallback((deviceName: string) => {
        setDevices((prev) => ({
            ...prev,
            [deviceName]: {
                ...prev[deviceName],
                locked: !prev[deviceName]?.locked,
            },
        }));
    }, []);

    const handleSetValueRequest = useCallback(
        (deviceName: string, value: string | number | boolean) => {
            // For animated signals ignore set requests; for motors apply immediately
            if (deviceName === 'sineSignal' || deviceName === 'noisySignal') return;
            setDevices((prev) => ({
                ...prev,
                [deviceName]: {
                    ...prev[deviceName],
                    value,
                    timestamp: Date.now(),
                },
            }));
        },
        [],
    );

    const toggleExpand = useCallback((deviceName: string) => {
        setDevices((prev) => ({
            ...prev,
            [deviceName]: {
                ...prev[deviceName],
                expanded: !prev[deviceName]?.expanded,
            },
        }));
    }, []);

    return { devices, toggleDeviceLock, handleSetValueRequest, toggleExpand };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDevice(name: string, initialValue: number): Devices[string] {
    return {
        name,
        pv: name,
        value: initialValue,
        connected: true,
        locked: false,
        timestamp: Date.now(),
        expanded: false,
        read_access: true,
        write_access: name !== 'sineSignal' && name !== 'noisySignal',
        units: name === 'sineSignal' || name === 'noisySignal' ? 'arb.' : 'mm',
    };
}
