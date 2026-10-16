import { TiledStreamMessage } from '../../api/tiled';
/** One row in a subscription's event log. */
export interface StreamLogEntry {
    id: number;
    receivedAt: number;
    /** A message `type`, or `status` / `error` for lifecycle notes the harness adds itself. */
    kind: string;
    sequence?: number;
    summary: string;
    /** The message as received, except that large array payloads are replaced by a placeholder. */
    detail?: unknown;
}
export interface StreamLog {
    entries: StreamLogEntry[];
    /** Messages received per type since the last clear. Lifecycle notes are not counted. */
    counts: Record<string, number>;
    total: number;
    /** Sequence of the newest sequenced message delivered, whatever the hook mirrors into state. */
    lastSequence?: number;
    /** Messages per second over the last few seconds. */
    rate: number;
    pushMessage: (message: TiledStreamMessage) => void;
    pushNote: (kind: 'status' | 'error', summary: string) => void;
    clear: () => void;
}
/**
 * A bounded, newest-first event log that re-renders at most once per animation frame.
 *
 * This is the pattern the hooks' docs recommend for high-frequency streams: messages land in a ref
 * from a callback, and React state is updated on a schedule, not once per message. A burst of a
 * hundred frames costs one render.
 */
export declare function useStreamLog(limit?: number): StreamLog;
/** One line describing a message, for the log. */
export declare function summarizeMessage(message: TiledStreamMessage): string;
//# sourceMappingURL=useStreamLog.d.ts.map