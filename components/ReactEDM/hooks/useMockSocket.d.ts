import { Devices } from 'src/types/deviceControllerTypes';
export default function useMockOphydSocket(deviceNameList: string[]): {
    devices: Devices;
    handleSetValueRequest: (deviceName: string, value: string | number | boolean) => void;
};
//# sourceMappingURL=useMockSocket.d.ts.map