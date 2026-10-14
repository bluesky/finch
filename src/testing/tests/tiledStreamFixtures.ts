import type { TiledStreamMessage, WebSocketLike } from '../../api/tiled/client/websocket/types';

/**
 * One envelope of every Tiled stream type, taken from frames a live Tiled 0.2.15 server sent with
 * `envelope_format=json`. Payloads are trimmed but keep their shape.
 */
export const STREAM_FIXTURES = {
    'container-schema': { type: 'container-schema', version: 1 },
    'container-child-created': {
        type: 'container-child-created',
        sequence: 1,
        timestamp: '2026-10-06T18:56:21.633871',
        key: 'ws-probe',
        structure_family: 'container',
        specs: [{ name: 'BlueskyRun', version: '3.0' }],
        metadata: { start: { uid: 'abc' } },
        data_sources: [],
        access_blob: {},
    },
    'container-child-metadata-updated': {
        type: 'container-child-metadata-updated',
        key: 'ws-probe',
        sequence: 2,
        timestamp: '2026-10-06T18:56:21.657096',
        specs: [],
        metadata: { start: { uid: 'abc' }, stop: { exit_status: 'success' } },
        revision_number: 1,
    },
    'table-schema': {
        type: 'table-schema',
        version: 1,
        arrow_schema: 'data:application/vnd.apache.arrow.file;base64,/////wADAAAQAAAA',
    },
    'table-data': {
        type: 'table-data',
        sequence: 2,
        timestamp: '2026-10-06T18:56:37.326508',
        mimetype: 'application/vnd.apache.arrow.file',
        partition: 0,
        append: true,
        'content-type': 'application/json',
        payload: { x: [3], y: [2.5] },
    },
    'array-schema': {
        type: 'array-schema',
        version: 1,
        data_type: { endianness: 'little', kind: 'f', itemsize: 4, dt_units: null },
    },
    'array-data': {
        type: 'array-data',
        sequence: 4,
        timestamp: '2026-10-06T18:57:24.918589',
        mimetype: 'application/octet-stream',
        shape: [1, 3],
        offset: [2],
        block: null,
        'content-type': 'application/json',
        payload: [[1.0, 1.0, 1.0]],
    },
    'array-ref': {
        type: 'array-ref',
        sequence: 3,
        timestamp: '2026-10-06T18:57:30.000000',
        data_source: { mimetype: 'application/x-hdf5', assets: [] },
        patch: { offset: [2, 0], shape: [1, 3] },
        shape: [3, 3],
        uri: 'http://localhost:8000/api/v1/array/full/run/det?slice=2:3,0:3',
    },
    'ragged-schema': { type: 'ragged-schema', version: 1 },
    'ragged-data': {
        type: 'ragged-data',
        sequence: 1,
        timestamp: '2026-10-06T18:58:00.000000',
        mimetype: 'application/json',
        payload: [[1, 2], [3]],
    },
} satisfies { [K in TiledStreamMessage['type']]: Extract<TiledStreamMessage, { type: K }> };

/** A scriptable stand-in for a browser `WebSocket`, matching the queue-server tests. */
export class FakeSocket implements WebSocketLike {
    static instances: FakeSocket[] = [];

    readyState = 0;
    sent: string[] = [];
    closedWith: number | undefined;
    onopen: ((event: unknown) => void) | null = null;
    onmessage: ((event: { data: unknown }) => void) | null = null;
    onerror: ((event: unknown) => void) | null = null;
    onclose: ((event: { code: number; reason?: string }) => void) | null = null;

    constructor(readonly url: string) {
        FakeSocket.instances.push(this);
    }

    static latest(): FakeSocket {
        const socket = FakeSocket.instances.at(-1);
        if (!socket) throw new Error('No socket has been opened.');
        return socket;
    }

    static reset(): void {
        FakeSocket.instances = [];
    }

    send(data: string): void {
        this.sent.push(data);
    }

    close(code?: number): void {
        this.readyState = 3;
        this.closedWith = code;
    }

    open(): void {
        this.readyState = 1;
        this.onopen?.({});
    }

    emit(payload: unknown): void {
        this.onmessage?.({
            data: typeof payload === 'string' ? payload : JSON.stringify(payload),
        });
    }

    emitRaw(data: unknown): void {
        this.onmessage?.({ data });
    }

    serverClose(code: number, reason?: string): void {
        this.readyState = 3;
        this.onerror?.({});
        this.onclose?.({ code, reason });
    }
}

export const fakeSocketFactory = (url: string): FakeSocket => new FakeSocket(url);
