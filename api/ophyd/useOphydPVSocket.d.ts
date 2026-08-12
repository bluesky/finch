import { Devices } from '../../types/deviceControllerTypes';
/**
 * Manage subscriptions to a set of EPICS PVs and surface their values as a
 * Devices map.
 *
 * Connection lifecycle is delegated to a transport read from
 * OphydTransportProvider — see [src/api/ophyd/OphydTransportProvider.tsx].
 * When no provider is mounted, a fallback transport pointed at the
 * configured ophyd-websocket backend is created lazily (one per
 * consumer-URL pair). To make two hook calls observe the same state, wrap
 * the tree in an OphydTransportProvider with a shared transport.
 *
 * @param deviceNameList - EPICS PVs to subscribe to.
 * @param wsUrl - Optional URL override that builds an ad-hoc WebSocket
 *   transport for this consumer only. Ignored when an OphydTransportProvider
 *   supplies a transport.
 */
export default function useOphydPVSocket(deviceNameList: string[], wsUrl?: string): {
    devices: Devices;
    toggleDeviceLock: (deviceName: string) => void;
    handleSetValueRequest: (deviceName: string, value: string | number | boolean) => void;
    toggleExpand: (deviceName: string) => void;
};
//# sourceMappingURL=useOphydPVSocket.d.ts.map