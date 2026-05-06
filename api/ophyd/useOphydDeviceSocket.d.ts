import { OphydDevices } from 'src/types/deviceControllerTypes';
/**
 * Custom hook for managing WebSocket connections to Ophyd devices.
 * Provides real-time device state management and control functions.
 *
 * @param deviceNameList - Array of Ophyd device names to subscribe to
 * @param wsUrl - Optional WebSocket URL. If not provided, will use environment variables or default to localhost:8001
 * @returns Object containing device states and control functions
 */
export default function useOphydDeviceSocket(deviceNameList: string[], wsUrl?: string): {
    devices: OphydDevices;
    toggleDeviceLock: (deviceName: string) => void;
    handleSetValueRequest: (deviceName: string, value: string | number | boolean) => void;
    toggleExpand: (deviceName: string) => void;
};
//# sourceMappingURL=useOphydDeviceSocket.d.ts.map