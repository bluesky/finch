import type {
    OphydPVIncomingMessage,
    OphydPVMessageListener,
    OphydPVOutgoingMessage,
    OphydPVTransport,
    OphydTransportStatus,
    OphydTransportStatusListener,
} from './types';

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
export function createWebSocketTransport(
    options: CreateWebSocketTransportOptions,
): OphydPVTransport {
    const messageListeners = new Set<OphydPVMessageListener>();
    const statusListeners = new Set<OphydTransportStatusListener>();
    let status: OphydTransportStatus = 'connecting';
    const buffer: OphydPVOutgoingMessage[] = [];
    let closedByUser = false;

    const ws = new WebSocket(options.url);

    const setStatus = (next: OphydTransportStatus): void => {
        status = next;
        for (const l of statusListeners) {
            try {
                l(next);
            } catch (err) {
                console.error('[ophyd-ws-transport] status listener threw:', err);
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
        let parsed: OphydPVIncomingMessage;
        try {
            parsed = JSON.parse(event.data);
        } catch (err) {
            console.error('[ophyd-ws-transport] failed to parse message:', err);
            return;
        }
        for (const listener of messageListeners) {
            try {
                listener(parsed);
            } catch (err) {
                console.error('[ophyd-ws-transport] message listener threw:', err);
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
