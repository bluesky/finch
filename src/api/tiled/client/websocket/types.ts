import type { Spec } from '../../types/generatedAliases';

/**
 * Wire types for Tiled's streaming websocket, `GET /api/v1/stream/single/{path}`.
 *
 * Every shape here was checked against a live server (Tiled 0.2.15) and its source
 * (`tiled/catalog/adapter.py`, `tiled/server/core.py`), not just the docs. The route is not in
 * `openapi.json`, so nothing here is generated.
 *
 * Each connection first sends a `*-schema` message, which has no `sequence`. After that, every message
 * carries a per-node `sequence` that starts at 1 and increases by one. A container's sequence counts
 * child events, so it is unrelated to any child's own sequence.
 */

// #region messages

/** Sent first on every connection to a container. Carries no sequence. */
export interface ContainerSchemaMessage {
    type: 'container-schema';
    version: number;
}

/** A direct child was created. Nested descendants do **not** produce this on the parent. */
export interface ContainerChildCreatedMessage {
    type: 'container-child-created';
    sequence: number;
    /** Server-local ISO timestamp with no timezone, e.g. `2026-10-06T18:56:21.633871`. */
    timestamp: string;
    key: string;
    structure_family: string;
    specs: Spec[];
    metadata: Record<string, unknown>;
    data_sources: unknown[];
    access_blob: Record<string, unknown>;
}

/** A direct child's metadata or specs were replaced or patched. */
export interface ContainerChildMetadataUpdatedMessage {
    type: 'container-child-metadata-updated';
    sequence: number;
    timestamp: string;
    key: string;
    specs: Spec[];
    metadata: Record<string, unknown>;
    /** Missing when the update was made with `drop_revision`. */
    revision_number?: number;
}

/** Sent first on every connection to a table. Carries no sequence and no rows. */
export interface TableSchemaMessage {
    type: 'table-schema';
    version: number;
    /**
     * The table's Arrow schema. Over JSON it arrives as a
     * `data:application/vnd.apache.arrow.file;base64,…` URL holding an Arrow IPC message. Finch does
     * not decode it, so it is typed as an opaque string.
     */
    arrow_schema: string;
}

/**
 * Rows written to a table.
 *
 * In JSON envelopes the server transcodes the Arrow body to a **columnar** object, `{column: values[]}`,
 * hence the default `T`.
 *
 * Tiled streams the write *before* it persists it. If persisting fails and the writer retries, each
 * retry arrives as a fresh `table-data` with a new sequence, so sequence de-duplication cannot merge
 * them.
 */
export interface TableDataMessage<T = Record<string, unknown[]>> {
    type: 'table-data';
    sequence: number;
    timestamp: string;
    /** Media type of the original upload, e.g. `application/vnd.apache.arrow.file`. */
    mimetype: string;
    /** Media type of `payload` as sent: `application/json` in JSON envelopes. */
    'content-type'?: string;
    partition: number | null;
    append: boolean;
    payload: T;
}

/** The fields of Tiled's `BuiltinDtype`. Structured dtypes carry extra keys. */
export interface TiledStreamDataType {
    endianness?: string;
    kind?: string;
    itemsize?: number;
    dt_units?: string | null;
    [key: string]: unknown;
}

/** Sent first on every connection to an array. Carries no sequence. */
export interface ArraySchemaMessage {
    type: 'array-schema';
    version: number;
    data_type: TiledStreamDataType;
}

/**
 * Array data that was written, sent in full, payload included.
 *
 * - `shape` is the shape of `payload`, not of the whole array.
 * - `offset` is where a patch starts. It can have fewer entries than `shape` has dimensions; for
 *   example a `[1, 3]` patch at row 2 arrives with `offset: [2]`.
 * - `offset` and `block` are both `null` for a full overwrite.
 *
 * The server cannot leave the payload out of this message, so subscribing to a large detector array
 * costs the full bandwidth.
 */
export interface ArrayDataMessage<T = unknown> {
    type: 'array-data';
    sequence: number;
    timestamp: string;
    mimetype: string;
    'content-type'?: string;
    shape: number[];
    offset: number[] | null;
    block: number[] | null;
    payload: T;
}

/**
 * Says that new array data was registered, without sending the data.
 *
 * Tiled sends this only when a data source is attached with `put_data_source`, which is how externally
 * written files (HDF5, TIFF, …) are registered. An ordinary PUT/PATCH of array data produces
 * `array-data` instead. To get the bytes, fetch `uri` over HTTP when the UI needs them.
 */
export interface ArrayRefMessage {
    type: 'array-ref';
    sequence: number;
    timestamp: string;
    data_source: Record<string, unknown>;
    patch: { offset: number[]; shape: number[]; [key: string]: unknown } | null;
    shape: number[];
    /** An `/array/full/{path}?slice=…` URL covering the new region. */
    uri: string;
}

/** Sent first on every connection to a ragged array. */
export interface RaggedSchemaMessage {
    type: 'ragged-schema';
    version: number;
    [key: string]: unknown;
}

/** Ragged data that was written. Over JSON the payload is nested lists. */
export interface RaggedDataMessage<T = unknown> {
    type: 'ragged-data';
    sequence: number;
    timestamp: string;
    mimetype: string;
    'content-type'?: string;
    payload: T;
    [key: string]: unknown;
}

/** Every message a Tiled stream can deliver. Narrow it on `type`. */
export type TiledStreamMessage =
    | ContainerSchemaMessage
    | ContainerChildCreatedMessage
    | ContainerChildMetadataUpdatedMessage
    | TableSchemaMessage
    | TableDataMessage
    | ArraySchemaMessage
    | ArrayDataMessage
    | ArrayRefMessage
    | RaggedSchemaMessage
    | RaggedDataMessage;

export type TiledStreamMessageType = TiledStreamMessage['type'];

/** The message sent first on every (re)connection. */
export type TiledSchemaMessage = Extract<TiledStreamMessage, { type: `${string}-schema` }>;

/** Messages that carry a `sequence`, i.e. everything except the schema message. */
export type TiledSequencedMessage = Exclude<TiledStreamMessage, TiledSchemaMessage>;

// #endregion

// #region connection

/**
 * - `idle`: created or disabled, with no socket opened yet.
 * - `connecting`: the handshake is in flight.
 * - `connected`: the first frame (the schema) has arrived.
 * - `reconnecting`: the connection dropped and a retry is scheduled.
 * - `closed`: closed on purpose, either by `disconnect()` or by the producer ending the stream.
 * - `error`: a failure that will not be retried (bad credentials, reconnects exhausted).
 */
export type TiledConnectionStatus =
    | 'idle'
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'closed'
    | 'error';

/**
 * - `auth`: the server rejected the credentials (close 4001 or 4003). Not retried.
 * - `transport`: the socket errored or dropped. Retried when reconnect is on.
 * - `parse`: a frame was not a known message. Dropped, and the stream continues.
 * - `reconnect-exhausted`: `maxReconnectAttempts` ran out.
 */
export type TiledSubscriptionErrorKind = 'auth' | 'transport' | 'parse' | 'reconnect-exhausted';

export interface TiledSubscriptionError {
    kind: TiledSubscriptionErrorKind;
    message: string;
    /** Websocket close code, when the error came from a close frame. */
    code?: number;
}

export type Unsubscribe = () => void;

/**
 * The part of the `WebSocket` API this module uses, so tests can inject a fake.
 *
 * This is the same shape as the queue server's `WebSocketLike`. It is declared again here so the two
 * API modules stay independent.
 */
export interface WebSocketLike {
    readyState: number;
    send(data: string): void;
    close(code?: number, reason?: string): void;
    onopen: ((event: unknown) => void) | null;
    onmessage: ((event: { data: unknown }) => void) | null;
    onerror: ((event: unknown) => void) | null;
    onclose: ((event: { code: number; reason?: string }) => void) | null;
}

export type TiledSocketFactory = (url: string) => WebSocketLike;

/** Credentials and transport shared by every subscription a `TiledWebSocketClient` creates. */
export interface TiledWebSocketClientOptions {
    /** The Tiled API URL, **including `/api/v1`**, as for the HTTP client. */
    baseUrl: string;
    apiKey?: string | null;
    accessToken?: string | null;
    /** Defaults to `new WebSocket(url)`. */
    socketFactory?: TiledSocketFactory;
}

/** Options for one subscription. */
export interface TiledSubscriptionOptions {
    /**
     * Replay from this sequence number (inclusive), as far back as the server's streaming cache still
     * holds data. `0` replays everything that is retained. Leave it out to get only new events.
     */
    start?: number;
    /** Only `'json'` is decoded today. `'msgpack'` is reserved, and its binary frames are dropped. */
    envelopeFormat?: 'json' | 'msgpack';
    /** Reconnect after an unexpected drop. Default `true`. */
    reconnect?: boolean;
    /** First retry delay in ms. Default 1000. */
    reconnectDelay?: number;
    /** Ceiling for the exponential backoff in ms. Default 30000. */
    maxReconnectDelay?: number;
    /** Default unlimited. */
    maxReconnectAttempts?: number;
}

/** Everything a `TiledSubscription` needs: one node, plus the shared credentials and transport. */
export interface TiledSubscriptionConfig
    extends TiledWebSocketClientOptions, TiledSubscriptionOptions {
    /** Node path relative to the API root. `''` is the root container. */
    path: string;
}

// #endregion
