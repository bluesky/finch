import type { GetStatusResponse } from '../types/status';

/**
 * Frame envelope shared by all three sockets: the server sends one JSON object per text
 * frame via `websocket.send_text(json.dumps(msg))`, with no wrapper or message-type field.
 */
export interface QServerSocketFrame<T> {
    /** Unix timestamp in seconds, as produced by Python's `time.time()`. */
    time: number;
    msg: T;
}

/** Console frames carry a formatted log line, sometimes with a `stream` marker. */
export type QServerConsoleFrame = QServerSocketFrame<string> & {
    stream?: string;
    [key: string]: unknown;
};

/** Status frames wrap the same payload as `GET /api/status`. */
export type QServerStatusFrame = QServerSocketFrame<{ status: GetStatusResponse }>;

/** Info frames are general system-info messages; their shape is not pinned by the server. */
export type QServerInfoFrame = QServerSocketFrame<Record<string, unknown>>;

function isFrame(value: unknown): value is QServerSocketFrame<unknown> {
    return (
        !!value &&
        typeof value === 'object' &&
        'msg' in (value as Record<string, unknown>) &&
        typeof (value as { time?: unknown }).time === 'number'
    );
}

/**
 * Guards are deliberately tolerant — these frames are not described by the spec, so extra
 * keys are accepted and only the fields we read are checked.
 */
export function isQServerConsoleFrame(value: unknown): value is QServerConsoleFrame {
    return isFrame(value) && typeof value.msg === 'string';
}

export function isQServerStatusFrame(value: unknown): value is QServerStatusFrame {
    if (!isFrame(value) || !value.msg || typeof value.msg !== 'object') return false;
    return 'status' in (value.msg as Record<string, unknown>);
}

export function isQServerInfoFrame(value: unknown): value is QServerInfoFrame {
    return isFrame(value) && !!value.msg && typeof value.msg === 'object';
}
