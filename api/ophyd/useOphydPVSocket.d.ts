import { Devices } from 'src/types/deviceControllerTypes';
/**
 * Custom hook for managing WebSocket connections to Ophyd devices.
 * Provides real-time device state management and control functions.
 *
 * @param deviceNameList - Array of EPICS PVs to subscribe to
 * @param wsUrl - Optional WebSocket URL. If not provided, will use environment variables or default to localhost:8001
 * @returns Object containing device states and control functions
 */
export default function useOphydPVSocket(deviceNameList: string[], wsUrl?: string): {
    devices: Devices;
    toggleDeviceLock: (deviceName: string) => void;
    handleSetValueRequest: (deviceName: string, value: string | number | boolean) => void;
    toggleExpand: (deviceName: string) => void;
};
//# sourceMappingURL=useOphydPVSocket.d.ts.map