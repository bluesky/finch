/**
 * Old hook kept for backwards compatibility, replaced by useOphydPVSocket.
 * Provides real-time device state management and control functions.
 *
 * @param deviceNameList - Array of EPICS PVs to subscribe to
 * @param wsUrl - Optional WebSocket URL. If not provided, will use environment variables or default to localhost:8001
 * @returns Object containing device states and control functions
 */
export default function useOphydSocket(deviceNameList: string[], wsUrl?: string): {
    devices: import('../..').Devices;
    toggleDeviceLock: (deviceName: string) => void;
    handleSetValueRequest: (deviceName: string, value: string | number | boolean) => void;
    toggleExpand: (deviceName: string) => void;
};
//# sourceMappingURL=useOphydSocket.d.ts.map