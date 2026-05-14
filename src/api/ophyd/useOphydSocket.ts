import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';

/**
 * Old hook kept for backwards compatibility, replaced by useOphydPVSocket.
 * Provides real-time device state management and control functions.
 *
 * @param deviceNameList - Array of EPICS PVs to subscribe to
 * @param wsUrl - Optional WebSocket URL. If not provided, will use environment variables or default to localhost:8001
 * @returns Object containing device states and control functions
 */
export default function useOphydSocket(deviceNameList: string[], wsUrl?: string) {
    const { devices, toggleDeviceLock, handleSetValueRequest, toggleExpand } = useOphydPVSocket(
        deviceNameList,
        wsUrl,
    );
    return {
        devices,
        toggleDeviceLock,
        handleSetValueRequest,
        toggleExpand,
    };
}
