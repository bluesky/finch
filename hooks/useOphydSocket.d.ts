import { Devices } from 'src/types/deviceControllerTypes';
export default function useOphydSocket(wsUrl: string, deviceNameList: string[]): {
    devices: Devices;
    toggleDeviceLock: (deviceName: string) => void;
    handleSetValueRequest: (deviceName: string, value: string | number | boolean) => void;
    toggleExpand: (deviceName: string) => void;
};
//# sourceMappingURL=useOphydSocket.d.ts.map