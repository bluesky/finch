import { useEffect, useState } from 'react';
import type { TableDataMessage, TableSchemaMessage } from '../client/websocket/types';
import {
    useTiledSubscription,
    type UseTiledSubscriptionOptions,
    type UseTiledSubscriptionResult,
} from './useTiledSubscription';

/** Columnar rows, the shape Tiled's JSON envelope gives a table payload. */
export type TiledColumnarRows = Record<string, unknown[]>;

export interface UseTiledTableSubscriptionOptions<T> extends Omit<
    UseTiledSubscriptionOptions,
    'onMessage' | 'trackLastMessage'
> {
    onSchema?: (message: TableSchemaMessage) => void;
    /** Called for every `table-data` message. This is the preferred path for live plots. */
    onData?: (message: TableDataMessage<T>) => void;
    /**
     * Concatenate every payload into `rows`, re-rendering per message. Default `false`, because a long
     * scan would otherwise grow without bound in React state. Assumes the columnar JSON payload.
     *
     * Every payload is appended, including a non-`append` partition overwrite; reconstructing a table
     * from overwrites is not attempted.
     */
    accumulate?: boolean;
    /** With `accumulate`, keep only the newest this many rows. */
    maxRows?: number;
    /** Keep the newest message in `latest`, re-rendering per message. Implied by `accumulate`. */
    trackLatest?: boolean;
}

export interface UseTiledTableSubscriptionResult<T> extends Omit<
    UseTiledSubscriptionResult,
    'lastMessage'
> {
    /** The schema from the most recent (re)connection. */
    schema?: TableSchemaMessage;
    /** Only populated with `trackLatest` or `accumulate`. */
    latest?: TableDataMessage<T>;
    /** Only populated with `accumulate`. Rows sent before the subscription started are not included. */
    rows?: TiledColumnarRows;
}

/**
 * Stream rows appended to one table node, e.g. a Bluesky run's `primary/internal`.
 *
 * ```tsx
 * useTiledTableSubscription(`${uid}/primary/internal`, {
 *     onData: (update) => chart.append(update.payload),
 * });
 *
 * const { rows } = useTiledTableSubscription(path, { accumulate: true, maxRows: 10_000 });
 * ```
 *
 * The schema message describes the columns, not the rows already in the table. Fetch those once over
 * HTTP (`useTiledTableFullAsJSONQuery`), or pass `start: 0` to replay what the streaming cache still
 * holds.
 */
export function useTiledTableSubscription<T = TiledColumnarRows>(
    path: string,
    options: UseTiledTableSubscriptionOptions<T> = {},
): UseTiledTableSubscriptionResult<T> {
    const { onSchema, onData, accumulate = false, maxRows, trackLatest = false, ...rest } = options;
    const keepLatest = trackLatest || accumulate;

    const [schema, setSchema] = useState<TableSchemaMessage>();
    const [latest, setLatest] = useState<TableDataMessage<T>>();
    const [rows, setRows] = useState<TiledColumnarRows>();

    // A new target starts from nothing.
    useEffect(() => {
        setSchema(undefined);
        setLatest(undefined);
        setRows(undefined);
    }, [path, accumulate]);

    const { lastMessage: _lastMessage, ...result } = useTiledSubscription(path, {
        ...rest,
        trackLastMessage: false,
        onMessage(message) {
            if (message.type === 'table-schema') {
                setSchema(message);
                onSchema?.(message);
            } else if (message.type === 'table-data') {
                const data = message as TableDataMessage<T>;
                if (keepLatest) setLatest(data);
                if (accumulate) {
                    setRows((current) =>
                        appendColumnarRows(current, data.payload as TiledColumnarRows, maxRows),
                    );
                }
                onData?.(data);
            }
        },
    });

    return { ...result, schema, latest, rows: accumulate ? (rows ?? {}) : undefined };
}

/**
 * Append columnar `next` to `current`, keeping the newest `maxRows` rows.
 *
 * A column that appears part-way through is back-filled with `null`, and a column missing from `next`
 * is padded with `null`, so every column always has the same length.
 */
export function appendColumnarRows(
    current: TiledColumnarRows | undefined,
    next: TiledColumnarRows | null | undefined,
    maxRows?: number,
): TiledColumnarRows {
    const base = current ?? {};
    if (!next || typeof next !== 'object') return base;

    const existingLength = columnLength(base);
    const incomingLength = columnLength(next);
    const merged: TiledColumnarRows = {};

    for (const column of new Set([...Object.keys(base), ...Object.keys(next)])) {
        const before = base[column] ?? new Array<unknown>(existingLength).fill(null);
        const added = Array.isArray(next[column])
            ? next[column]
            : new Array<unknown>(incomingLength).fill(null);
        let values = before.concat(added);
        if (maxRows !== undefined && values.length > maxRows) {
            values = values.slice(values.length - maxRows);
        }
        merged[column] = values;
    }
    return merged;
}

function columnLength(rows: TiledColumnarRows): number {
    let length = 0;
    for (const values of Object.values(rows)) {
        if (Array.isArray(values)) length = Math.max(length, values.length);
    }
    return length;
}
