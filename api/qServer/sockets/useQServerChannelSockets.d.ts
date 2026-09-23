import { GetStatusResponse } from '../types/status';
import { QServerConsoleFrame, QServerInfoFrame, QServerStatusFrame } from './messageTypes';
import { UseQServerSocketResult } from './useQServerSocket';
import { QServerSocketAuth, QServerSocketReconnectOptions, WebSocketLike } from './types';
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
export interface UseQServerStatusSocketResult extends UseQServerSocketResult<QServerStatusFrame> {
    /** Latest status payload, equivalent to the body of `GET /api/status`. */
    status: GetStatusResponse | null;
}
/** Push-based replacement for polling `GET /api/status`. */
export declare function useQServerStatusSocket(options?: UseQServerChannelOptions): UseQServerStatusSocketResult;
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
export declare function useQServerConsoleSocket(options?: UseQServerChannelOptions & {
    maxLines?: number;
}): UseQServerConsoleSocketResult;
export interface UseQServerInfoSocketResult extends UseQServerSocketResult<QServerInfoFrame> {
    info: Record<string, unknown> | null;
}
/** General system-info messages from `/api/info/ws`. */
export declare function useQServerInfoSocket(options?: UseQServerChannelOptions): UseQServerInfoSocketResult;
//# sourceMappingURL=useQServerChannelSockets.d.ts.map