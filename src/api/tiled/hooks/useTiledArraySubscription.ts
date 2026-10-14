import { useEffect, useState } from 'react';
import type {
    ArrayDataMessage,
    ArrayRefMessage,
    ArraySchemaMessage,
} from '../client/websocket/types';
import {
    useTiledSubscription,
    type UseTiledSubscriptionOptions,
    type UseTiledSubscriptionResult,
} from './useTiledSubscription';

export interface UseTiledArraySubscriptionOptions<T> extends Omit<
    UseTiledSubscriptionOptions,
    'onMessage' | 'trackLastMessage'
> {
    onSchema?: (message: ArraySchemaMessage) => void;
    /** Called for every `array-data` message, payload included. */
    onData?: (message: ArrayDataMessage<T>) => void;
    /**
     * Called for every `array-ref` message: new data was registered and nothing was sent. Fetch
     * `message.uri` over HTTP when the UI actually needs the bytes.
     */
    onRef?: (message: ArrayRefMessage) => void;
    /**
     * Keep the newest message in `latest`, with its `shape`, re-rendering per message. Default `false`.
     * Only one message is ever kept; earlier payloads are not.
     */
    trackLatest?: boolean;
}

export interface UseTiledArraySubscriptionResult<T> extends Omit<
    UseTiledSubscriptionResult,
    'lastMessage'
> {
    /** The schema (dtype) from the most recent (re)connection. */
    schema?: ArraySchemaMessage;
    /** Only populated with `trackLatest`. */
    latest?: ArrayDataMessage<T> | ArrayRefMessage;
    /** Shape of `latest`, i.e. of the region that was written. Only populated with `trackLatest`. */
    shape?: number[];
}

/**
 * Stream writes to one array node, e.g. a detector image series.
 *
 * ```tsx
 * useTiledArraySubscription(`${uid}/primary/det_image`, {
 *     onData: (update) => drawImage(update.payload, update.shape, update.offset),
 * });
 * ```
 *
 * Tiled sends the **full payload** of every `array-data` write, and there is no way to ask it not to.
 * Ignoring the payload does not save bandwidth, so think twice before subscribing to a large detector.
 * Only data registered through `put_data_source` arrives as the lightweight `array-ref`.
 *
 * No history is kept. Payloads go to `onData` and are not retained unless `trackLatest` is set, and
 * even then only the newest one is kept.
 */
export function useTiledArraySubscription<T = unknown>(
    path: string,
    options: UseTiledArraySubscriptionOptions<T> = {},
): UseTiledArraySubscriptionResult<T> {
    const { onSchema, onData, onRef, trackLatest = false, ...rest } = options;

    const [schema, setSchema] = useState<ArraySchemaMessage>();
    const [latest, setLatest] = useState<ArrayDataMessage<T> | ArrayRefMessage>();

    useEffect(() => {
        setSchema(undefined);
        setLatest(undefined);
    }, [path, trackLatest]);

    const { lastMessage: _lastMessage, ...result } = useTiledSubscription(path, {
        ...rest,
        trackLastMessage: false,
        onMessage(message) {
            switch (message.type) {
                case 'array-schema':
                    setSchema(message);
                    onSchema?.(message);
                    break;
                case 'array-data': {
                    const data = message as ArrayDataMessage<T>;
                    if (trackLatest) setLatest(data);
                    onData?.(data);
                    break;
                }
                case 'array-ref':
                    if (trackLatest) setLatest(message);
                    onRef?.(message);
                    break;
            }
        },
    });

    return { ...result, schema, latest, shape: latest?.shape };
}
