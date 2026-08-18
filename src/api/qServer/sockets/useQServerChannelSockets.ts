import { useCallback, useMemo, useRef, useState } from 'react';
import { useQueueServerApiUrls } from '@/utils/apiUtils';
import { normalizeQServerBaseUrl } from '../client/urlUtils';
import type { GetStatusResponse } from '../types/status';
import {
    createQServerConsoleSocket,
    createQServerInfoSocket,
    createQServerStatusSocket,
    type QServerChannelSocketOptions,
} from './channelSockets';
import type { QServerConsoleFrame, QServerInfoFrame, QServerStatusFrame } from './messageTypes';
import { useQServerSocket, type UseQServerSocketResult } from './useQServerSocket';
import type { QServerSocketAuth, QServerSocketReconnectOptions, WebSocketLike } from './types';

/**
 * Options common to the three channel hooks.
 *
 * `baseUrl` and `apiKey` default to whatever `useQueueServerApiUrls()` resolves from
 * `FinchConfigProvider`, so a component inside the normal app tree needs no arguments.
 */
export interface UseQServerChannelOptions {
    baseUrl?: string;
    apiKey?: string | null;
    accessToken?: string | null;
    /** `'query'` (default) or `'message'` for the first-frame handshake. */
    authMode?: QServerSocketAuth['mode'];
    enabled?: boolean;
    reconnect?: QServerSocketReconnectOptions;
    /** Test seam: build a fake socket instead of a real `WebSocket`. */
    socketFactory?: (url: string) => WebSocketLike;
}

function useChannelSocketOptions(options: UseQServerChannelOptions): QServerChannelSocketOptions {
    const { httpBaseUrl, apiKey: configApiKey } = useQueueServerApiUrls();
    const baseUrl = normalizeQServerBaseUrl(options.baseUrl ?? httpBaseUrl);
    const apiKey = options.apiKey !== undefined ? options.apiKey : configApiKey;
    const { accessToken, authMode, reconnect, socketFactory } = options;

    return useMemo(
        () => ({
            baseUrl,
            apiKey,
            accessToken,
            authMode: authMode ?? 'query',
            reconnect,
            socketFactory,
        }),
        [baseUrl, apiKey, accessToken, authMode, reconnect, socketFactory],
    );
}

export interface UseQServerStatusSocketResult extends UseQServerSocketResult<QServerStatusFrame> {
    /** Latest status payload, equivalent to the body of `GET /api/status`. */
    status: GetStatusResponse | null;
}

/** Push-based replacement for polling `GET /api/status`. */
export function useQServerStatusSocket(
    options: UseQServerChannelOptions = {},
): UseQServerStatusSocketResult {
    const socketOptions = useChannelSocketOptions(options);
    const createTransport = useCallback(
        () => createQServerStatusSocket(socketOptions),
        [socketOptions],
    );
    const socket = useQServerSocket(createTransport, { enabled: options.enabled });

    return useMemo(() => ({ ...socket, status: socket.lastFrame?.msg?.status ?? null }), [socket]);
}

export interface UseQServerConsoleSocketResult extends UseQServerSocketResult<QServerConsoleFrame> {
    /** Ring buffer of received lines, oldest first. */
    lines: QServerConsoleFrame[];
    /** The buffer joined for rendering in a `<pre>`. */
    text: string;
    clear: () => void;
}

/**
 * Live console output.
 *
 * The buffer is bounded because the server's own queue is bounded (1000 messages,
 * drop-oldest), so a client that hoards everything only postpones the same loss.
 */
export function useQServerConsoleSocket(
    options: UseQServerChannelOptions & { maxLines?: number } = {},
): UseQServerConsoleSocketResult {
    const { maxLines = 1000 } = options;
    const socketOptions = useChannelSocketOptions(options);
    const [lines, setLines] = useState<QServerConsoleFrame[]>([]);
    const maxLinesRef = useRef(maxLines);
    maxLinesRef.current = maxLines;

    const createTransport = useCallback(
        () => createQServerConsoleSocket(socketOptions),
        [socketOptions],
    );

    const onFrame = useCallback((frame: QServerConsoleFrame) => {
        setLines((current) => {
            const next = [...current, frame];
            return next.length > maxLinesRef.current
                ? next.slice(next.length - maxLinesRef.current)
                : next;
        });
    }, []);

    const socket = useQServerSocket(createTransport, { enabled: options.enabled, onFrame });
    const clear = useCallback(() => setLines([]), []);
    const text = useMemo(() => lines.map((line) => line.msg).join(''), [lines]);

    return useMemo(() => ({ ...socket, lines, text, clear }), [socket, lines, text, clear]);
}

export interface UseQServerInfoSocketResult extends UseQServerSocketResult<QServerInfoFrame> {
    info: Record<string, unknown> | null;
}

/** General system-info messages from `/api/info/ws`. */
export function useQServerInfoSocket(
    options: UseQServerChannelOptions = {},
): UseQServerInfoSocketResult {
    const socketOptions = useChannelSocketOptions(options);
    const createTransport = useCallback(
        () => createQServerInfoSocket(socketOptions),
        [socketOptions],
    );
    const socket = useQServerSocket(createTransport, { enabled: options.enabled });

    return useMemo(() => ({ ...socket, info: socket.lastFrame?.msg ?? null }), [socket]);
}
