import { buildQServerSocketUrl } from '../client/urlUtils';
import { createQServerSocket } from './createQServerSocket';
import {
    isQServerConsoleFrame,
    isQServerInfoFrame,
    isQServerStatusFrame,
    type QServerConsoleFrame,
    type QServerInfoFrame,
    type QServerStatusFrame,
} from './messageTypes';
import { QSERVER_SOCKET_PATHS } from './socketPaths';
import type {
    QServerSocketAuth,
    QServerSocketChannel,
    QServerSocketOptions,
    QServerSocketReconnectOptions,
    QServerSocketTransport,
    WebSocketLike,
} from './types';

/**
 * Everything the typed channel helpers accept, minus the URL they build themselves.
 *
 * Credentials are flat rather than nested under `auth` so that the same object shape works
 * for the helpers and the React hooks.
 */
export interface QServerChannelSocketOptions {
    /** Server origin or HTTP base URL; converted to `ws(s)://` and stripped of `/api`. */
    baseUrl: string;
    apiKey?: string | null;
    accessToken?: string | null;
    /** `'query'` (default), `'message'` for the first-frame handshake, or `'none'`. */
    authMode?: QServerSocketAuth['mode'];
    reconnect?: QServerSocketReconnectOptions;
    socketFactory?: (url: string) => WebSocketLike;
}

function channelOptions<TFrame>(
    channel: QServerSocketChannel,
    options: QServerChannelSocketOptions,
    guard: (value: unknown) => value is TFrame,
): QServerSocketOptions<TFrame> {
    // Auth is appended by createQServerSocket in query mode, so the URL is built bare here.
    const url = buildQServerSocketUrl(options.baseUrl, QSERVER_SOCKET_PATHS[channel]);
    return {
        url,
        auth: {
            apiKey: options.apiKey,
            accessToken: options.accessToken,
            mode: options.authMode ?? 'query',
        },
        reconnect: options.reconnect,
        socketFactory: options.socketFactory,
        label: `qserver-ws:${channel}`,
        parse: (raw) => {
            const parsed: unknown = JSON.parse(raw);
            return guard(parsed) ? parsed : null;
        },
    };
}

/** Live console output — the websocket counterpart of `GET /api/console_output`. */
export function createQServerConsoleSocket(
    options: QServerChannelSocketOptions,
): QServerSocketTransport<QServerConsoleFrame> {
    return createQServerSocket(channelOptions('console', options, isQServerConsoleFrame));
}

/** Status changes pushed as they happen, instead of polling `GET /api/status`. */
export function createQServerStatusSocket(
    options: QServerChannelSocketOptions,
): QServerSocketTransport<QServerStatusFrame> {
    return createQServerSocket(channelOptions('status', options, isQServerStatusFrame));
}

/** General system-info messages. */
export function createQServerInfoSocket(
    options: QServerChannelSocketOptions,
): QServerSocketTransport<QServerInfoFrame> {
    return createQServerSocket(channelOptions('info', options, isQServerInfoFrame));
}
