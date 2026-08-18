import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { QServerSocketError, QServerSocketStatus, QServerSocketTransport } from './types';

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
export function useQServerSocket<TFrame>(
    createTransport: () => QServerSocketTransport<TFrame>,
    options: { enabled?: boolean; onFrame?: (frame: TFrame) => void } = {},
): UseQServerSocketResult<TFrame> {
    const { enabled = true, onFrame } = options;

    const [connectionStatus, setConnectionStatus] = useState<QServerSocketStatus>('closed');
    const [lastFrame, setLastFrame] = useState<TFrame | null>(null);
    const [frameCount, setFrameCount] = useState(0);
    const [droppedCount, setDroppedCount] = useState(0);
    const [error, setError] = useState<QServerSocketError | null>(null);
    const [generation, setGeneration] = useState(0);

    const transportRef = useRef<QServerSocketTransport<TFrame> | null>(null);
    // Kept in a ref so a changing callback does not tear down the socket.
    const onFrameRef = useRef(onFrame);
    onFrameRef.current = onFrame;

    useEffect(() => {
        if (!enabled) {
            setConnectionStatus('closed');
            return;
        }

        const transport = createTransport();
        transportRef.current = transport;
        setError(null);

        const unsubscribers = [
            transport.onStatus(setConnectionStatus),
            transport.onMessage((frame) => {
                setLastFrame(frame);
                setFrameCount((count) => count + 1);
                onFrameRef.current?.(frame);
            }),
            transport.onError((socketError) => {
                setError(socketError);
                if (socketError.kind === 'parse') {
                    setDroppedCount(transport.getDroppedCount());
                }
            }),
        ];

        return () => {
            for (const unsubscribe of unsubscribers) unsubscribe();
            transport.close();
            transportRef.current = null;
        };
    }, [createTransport, enabled, generation]);

    const reconnect = useCallback(() => {
        setError(null);
        // Rebuild rather than reusing the transport, so a changed key or URL takes effect.
        setGeneration((value) => value + 1);
    }, []);

    const close = useCallback(() => {
        transportRef.current?.close();
    }, []);

    return useMemo(
        () => ({
            connectionStatus,
            lastFrame,
            frameCount,
            droppedCount,
            error,
            reconnect,
            close,
        }),
        [connectionStatus, lastFrame, frameCount, droppedCount, error, reconnect, close],
    );
}
