import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isTiledSchemaMessage } from '@/api/tiled';
import type { TiledStreamMessage } from '@/api/tiled';

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

/** Above this many array elements, a payload is left out of the log entry. */
const MAX_LOGGED_ELEMENTS = 2_000;
const RATE_WINDOW_MS = 5_000;

/**
 * A bounded, newest-first event log that re-renders at most once per animation frame.
 *
 * This is the pattern the hooks' docs recommend for high-frequency streams: messages land in a ref
 * from a callback, and React state is updated on a schedule, not once per message. A burst of a
 * hundred frames costs one render.
 */
export function useStreamLog(limit = 200): StreamLog {
    const bufferRef = useRef<StreamLogEntry[]>([]);
    const countsRef = useRef<Record<string, number>>({});
    const totalRef = useRef(0);
    const lastSequenceRef = useRef<number | undefined>(undefined);
    const arrivalsRef = useRef<number[]>([]);
    const nextIdRef = useRef(1);
    const frameRef = useRef<number | null>(null);

    const [snapshot, setSnapshot] = useState({
        entries: [] as StreamLogEntry[],
        counts: {} as Record<string, number>,
        total: 0,
        lastSequence: undefined as number | undefined,
        rate: 0,
    });

    const flush = useCallback(() => {
        frameRef.current = null;
        const now = Date.now();
        arrivalsRef.current = arrivalsRef.current.filter((at) => now - at < RATE_WINDOW_MS);
        setSnapshot({
            entries: bufferRef.current.slice(),
            counts: { ...countsRef.current },
            total: totalRef.current,
            lastSequence: lastSequenceRef.current,
            rate: arrivalsRef.current.length / (RATE_WINDOW_MS / 1000),
        });
    }, []);

    const schedule = useCallback(() => {
        if (frameRef.current !== null) return;
        frameRef.current = requestAnimationFrame(flush);
    }, [flush]);

    const add = useCallback(
        (entry: Omit<StreamLogEntry, 'id' | 'receivedAt'>) => {
            bufferRef.current.unshift({
                ...entry,
                id: nextIdRef.current++,
                receivedAt: Date.now(),
            });
            if (bufferRef.current.length > limit) bufferRef.current.length = limit;
            schedule();
        },
        [limit, schedule],
    );

    const pushMessage = useCallback(
        (message: TiledStreamMessage) => {
            countsRef.current[message.type] = (countsRef.current[message.type] ?? 0) + 1;
            totalRef.current += 1;
            arrivalsRef.current.push(Date.now());
            const sequence = isTiledSchemaMessage(message) ? undefined : message.sequence;
            if (sequence !== undefined) lastSequenceRef.current = sequence;
            add({
                kind: message.type,
                sequence,
                summary: summarizeMessage(message),
                detail: withoutLargePayload(message),
            });
        },
        [add],
    );

    const pushNote = useCallback(
        (kind: 'status' | 'error', summary: string) => add({ kind, summary }),
        [add],
    );

    const clear = useCallback(() => {
        bufferRef.current = [];
        countsRef.current = {};
        totalRef.current = 0;
        lastSequenceRef.current = undefined;
        arrivalsRef.current = [];
        schedule();
    }, [schedule]);

    useEffect(
        () => () => {
            if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        },
        [],
    );

    return useMemo(
        () => ({ ...snapshot, pushMessage, pushNote, clear }),
        [snapshot, pushMessage, pushNote, clear],
    );
}

/** One line describing a message, for the log. */
export function summarizeMessage(message: TiledStreamMessage): string {
    switch (message.type) {
        case 'container-schema':
        case 'ragged-schema':
            return `schema v${message.version}`;
        case 'table-schema':
            return `schema v${message.version} · arrow schema ${message.arrow_schema.length.toLocaleString()} chars`;
        case 'array-schema': {
            const { kind, itemsize, endianness } = message.data_type;
            return `dtype ${kind ?? '?'}${itemsize ?? ''} ${endianness ?? ''}`.trim();
        }
        case 'container-child-created': {
            const specs = message.specs.map((spec) => spec.name).join(', ');
            return `${message.key} [${message.structure_family}]${specs ? ` · ${specs}` : ''}`;
        }
        case 'container-child-metadata-updated': {
            const keys = Object.keys(message.metadata).join(', ') || '(empty)';
            const revision =
                message.revision_number !== undefined ? ` · rev ${message.revision_number}` : '';
            return `${message.key} · metadata keys: ${keys}${revision}`;
        }
        case 'table-data': {
            const columns = Object.keys(message.payload ?? {});
            const rows = columns.length ? (message.payload[columns[0]]?.length ?? 0) : 0;
            return `${rows} row${rows === 1 ? '' : 's'} · ${columns.join(', ')} · partition ${
                message.partition ?? '-'
            }${message.append ? ' · append' : ''}`;
        }
        case 'array-data':
            return `shape [${message.shape.join(', ')}]${
                message.offset ? ` at offset [${message.offset.join(', ')}]` : ' · full write'
            }`;
        case 'array-ref':
            return `ref shape [${message.shape.join(', ')}]${
                message.patch ? ` · patch at [${message.patch.offset.join(', ')}]` : ''
            }`;
        case 'ragged-data':
            return 'ragged data';
    }
}

function withoutLargePayload(message: TiledStreamMessage): unknown {
    if (message.type !== 'array-data' && message.type !== 'ragged-data') return message;
    const elements =
        message.type === 'array-data' ? message.shape.reduce((product, n) => product * n, 1) : 0;
    if (elements <= MAX_LOGGED_ELEMENTS) return message;
    return { ...message, payload: `(${elements.toLocaleString()} values left out of the log)` };
}
