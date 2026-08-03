import type {
    OphydDeviceIncomingMessage,
    OphydDeviceMessageListener,
    OphydDeviceOutgoingMessage,
    OphydDeviceTransport,
} from './deviceTypes';
import type { OphydTransportStatus, OphydTransportStatusListener } from './types';

export interface CreateWebSocketDeviceTransportOptions {
    url: string;
}

/**
 * WebSocket-backed implementation of OphydDeviceTransport. Mirrors
 * createWebSocketTransport but speaks the device-socket protocol (messages
 * use `device` instead of `pv`).
 */
export function createWebSocketDeviceTransport(
    options: CreateWebSocketDeviceTransportOptions,
): OphydDeviceTransport {
    const messageListeners = new Set<OphydDeviceMessageListener>();
    const statusListeners = new Set<OphydTransportStatusListener>();
    let status: OphydTransportStatus = 'connecting';
    const buffer: OphydDeviceOutgoingMessage[] = [];
    let closedByUser = false;

    const ws = new WebSocket(options.url);

    const setStatus = (next: OphydTransportStatus): void => {
        status = next;
        for (const l of statusListeners) {
            try {
                l(next);
            } catch (err) {
                console.error('[ophyd-ws-device-transport] status listener threw:', err);
            }
        }
    };

    ws.onopen = () => {
        setStatus('open');
        while (buffer.length > 0) {
            const msg = buffer.shift()!;
            ws.send(JSON.stringify(msg));
        }
    };

    ws.onmessage = (event) => {
        let parsed: OphydDeviceIncomingMessage;
        try {
            parsed = JSON.parse(event.data);
        } catch (err) {
            console.error('[ophyd-ws-device-transport] failed to parse message:', err);
            return;
        }
        for (const listener of messageListeners) {
            try {
                listener(parsed);
            } catch (err) {
                console.error('[ophyd-ws-device-transport] message listener threw:', err);
            }
        }
    };

    ws.onerror = () => {
        setStatus('error');
    };

    ws.onclose = () => {
        setStatus('closed');
    };

    return {
        send(message) {
            if (closedByUser) return;
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            } else {
                buffer.push(message);
            }
        },
        onMessage(listener) {
            messageListeners.add(listener);
            return () => messageListeners.delete(listener);
        },
        onStatus(listener) {
            statusListeners.add(listener);
            listener(status);
            return () => statusListeners.delete(listener);
        },
        close() {
            closedByUser = true;
            if (ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
                ws.close();
            }
        },
    };
}
