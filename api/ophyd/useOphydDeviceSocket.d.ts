import { OphydDevices } from '../../types/deviceControllerTypes';
/**
 * Device-socket counterpart of {@link useOphydPVSocket}. Uses the
 * device-channel protocol where messages key on `device` instead of `pv`.
 *
 * See OphydTransportProvider for the transport context. When no provider is
 * mounted, a fallback WebSocket transport is constructed lazily.
 */
export default function useOphydDeviceSocket(deviceNameList: string[], wsUrl?: string): {
    devices: OphydDevices;
    toggleDeviceLock: (deviceName: string) => void;
    handleSetValueRequest: (deviceName: string, value: string | number | boolean) => void;
    toggleExpand: (deviceName: string) => void;
};
//# sourceMappingURL=useOphydDeviceSocket.d.ts.map