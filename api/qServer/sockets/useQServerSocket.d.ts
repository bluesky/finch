import { QServerSocketError, QServerSocketStatus, QServerSocketTransport } from './types';
export interface UseQServerSocketResult<TFrame> {
    connectionStatus: QServerSocketStatus;
    lastFrame: TFrame | null;
    frameCount: number;
    /** Frames the parser rejected — malformed JSON, or the wrong shape for this channel. */
    droppedCount: number;
    error: QServerSocketError | null;
    reconnect: () => void;
    close: () => void;
}
/**
 * Subscribe to a socket transport and mirror it into React state.
 *
 * `createTransport` is called whenever its identity changes, so callers should memoize it
 * (the channel hooks below do). `enabled: false` keeps the socket closed entirely, which is
 * how the manual test harness starts each pane disconnected.
 */
export declare function useQServerSocket<TFrame>(createTransport: () => QServerSocketTransport<TFrame>, options?: {
    enabled?: boolean;
    onFrame?: (frame: TFrame) => void;
}): UseQServerSocketResult<TFrame>;
//# sourceMappingURL=useQServerSocket.d.ts.map