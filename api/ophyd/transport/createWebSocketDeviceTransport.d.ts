import { OphydDeviceTransport } from './deviceTypes';
export interface CreateWebSocketDeviceTransportOptions {
    url: string;
}
/**
 * WebSocket-backed implementation of OphydDeviceTransport. Mirrors
 * createWebSocketTransport but speaks the device-socket protocol (messages
 * use `device` instead of `pv`).
 */
export declare function createWebSocketDeviceTransport(options: CreateWebSocketDeviceTransportOptions): OphydDeviceTransport;
//# sourceMappingURL=createWebSocketDeviceTransport.d.ts.map