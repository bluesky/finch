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
export default function useSimOphydPVSocket(deviceNameList: string[], _wsUrl?: string): {
    devices: Devices;
    toggleDeviceLock: (deviceName: string) => void;
    handleSetValueRequest: (deviceName: string, value: string | number | boolean) => void;
    toggleExpand: (deviceName: string) => void;
};
//# sourceMappingURL=useSimOphydPVSocket.d.ts.map