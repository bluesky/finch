import { OphydPVTransport } from './types';
export interface CreateWebSocketTransportOptions {
    url: string;
}
/**
 * WebSocket-backed implementation of OphydPVTransport. One transport owns
 * one WebSocket. Outgoing messages are buffered until the connection opens.
 *
 * Errors and closure are surfaced through the status channel. Reconnect
 * logic is not yet implemented — consumers can recreate the transport.
 */
export declare function createWebSocketTransport(options: CreateWebSocketTransportOptions): OphydPVTransport;
//# sourceMappingURL=createWebSocketTransport.d.ts.map