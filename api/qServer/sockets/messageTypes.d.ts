import { GetStatusResponse } from '../types/status';
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
export type QServerStatusFrame = QServerSocketFrame<{
    status: GetStatusResponse;
}>;
/** Info frames are general system-info messages; their shape is not pinned by the server. */
export type QServerInfoFrame = QServerSocketFrame<Record<string, unknown>>;
/**
 * Guards are deliberately tolerant — these frames are not described by the spec, so extra
 * keys are accepted and only the fields we read are checked.
 */
export declare function isQServerConsoleFrame(value: unknown): value is QServerConsoleFrame;
export declare function isQServerStatusFrame(value: unknown): value is QServerStatusFrame;
export declare function isQServerInfoFrame(value: unknown): value is QServerInfoFrame;
//# sourceMappingURL=messageTypes.d.ts.map