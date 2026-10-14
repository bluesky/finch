import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
    TILED_WS_CLOSE,
    TiledSubscription,
    TiledWebSocketClient,
    buildTiledWebSocketUrl,
    parseTiledStreamMessage,
} from '../../api/tiled/client/websocket';
import type {
    ContainerChildCreatedMessage,
    TiledConnectionStatus,
    TiledStreamMessage,
    TiledSubscriptionConfig,
    TiledSubscriptionError,
} from '../../api/tiled/client/websocket';
import { FakeSocket, STREAM_FIXTURES, fakeSocketFactory } from './tiledStreamFixtures';

const API_URL = 'http://tiled.test:8000/api/v1';

function makeSubscription(overrides: Partial<TiledSubscriptionConfig> = {}) {
    const subscription = new TiledSubscription({
        baseUrl: API_URL,
        path: 'run/primary/internal',
        socketFactory: fakeSocketFactory,
        ...overrides,
    });
    const statuses: TiledConnectionStatus[] = [];
    const messages: TiledStreamMessage[] = [];
    const errors: TiledSubscriptionError[] = [];
    subscription.onStatus((status) => statuses.push(status));
    subscription.onMessage((message) => messages.push(message));
    subscription.onError((error) => errors.push(error));
    return { subscription, statuses, messages, errors };
}

/** Open the latest socket and deliver its schema, as the server does on every connection. */
function connectLatest(schema: object = STREAM_FIXTURES['table-schema']): FakeSocket {
    const socket = FakeSocket.latest();
    socket.open();
    socket.emit(schema);
    return socket;
}

beforeEach(() => {
    FakeSocket.reset();
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('buildTiledWebSocketUrl', () => {
    it('swaps http for ws and https for wss', () => {
        expect(buildTiledWebSocketUrl('http://localhost:8000/api/v1', 'a')).toBe(
            'ws://localhost:8000/api/v1/stream/single/a?envelope_format=json',
        );
        expect(buildTiledWebSocketUrl('https://tiled.example.org/api/v1', 'a')).toBe(
            'wss://tiled.example.org/api/v1/stream/single/a?envelope_format=json',
        );
    });

    it('keeps the trailing slash the root container route needs', () => {
        expect(buildTiledWebSocketUrl('http://localhost:8000/api/v1/', '')).toBe(
            'ws://localhost:8000/api/v1/stream/single/?envelope_format=json',
        );
        expect(buildTiledWebSocketUrl(API_URL, '/')).toMatch(/\/stream\/single\/\?/);
    });

    it('encodes each segment but keeps separators', () => {
        expect(buildTiledWebSocketUrl(API_URL, '/run 1//primary/a?b#c/')).toBe(
            'ws://tiled.test:8000/api/v1/stream/single/run%201/primary/a%3Fb%23c?envelope_format=json',
        );
    });

    it('adds envelope_format and start, including start=0', () => {
        const url = new URL(
            buildTiledWebSocketUrl(API_URL, 'x', { envelopeFormat: 'msgpack', start: 0 }),
        );
        expect(url.searchParams.get('envelope_format')).toBe('msgpack');
        expect(url.searchParams.get('start')).toBe('0');
    });

    it('never carries credentials', () => {
        const client = new TiledWebSocketClient({
            baseUrl: API_URL,
            apiKey: 'secret',
            socketFactory: fakeSocketFactory,
        });
        client.subscribe('x').connect();
        expect(FakeSocket.latest().url).not.toContain('secret');
        expect(FakeSocket.latest().url).not.toContain('api_key');
    });
});

describe('parseTiledStreamMessage', () => {
    it.each(Object.entries(STREAM_FIXTURES))('parses %s', (type, fixture) => {
        const parsed = parseTiledStreamMessage(JSON.stringify(fixture));
        expect(parsed).toEqual(fixture);
        expect(parsed?.type).toBe(type);
    });

    it.each([
        ['invalid JSON', '{nope'],
        ['a non-object', '42'],
        ['null', 'null'],
        ['a missing type', '{"sequence": 1}'],
        ['an unknown type', '{"type": "stream-closed", "sequence": 1}'],
        ['a data message without a sequence', '{"type": "table-data", "payload": {}}'],
    ])('drops %s', (_label, raw) => {
        expect(parseTiledStreamMessage(raw)).toBeNull();
    });

    it('drops binary frames', () => {
        expect(parseTiledStreamMessage(new ArrayBuffer(4))).toBeNull();
    });

    it('narrows on type without casts', () => {
        const message = parseTiledStreamMessage(
            JSON.stringify(STREAM_FIXTURES['container-child-created']),
        );
        if (message?.type === 'container-child-created') {
            expectTypeOf(message).toEqualTypeOf<ContainerChildCreatedMessage>();
            expect(message.key).toBe('ws-probe');
        } else {
            throw new Error('expected container-child-created');
        }
        if (message.type === 'container-child-created') {
            expectTypeOf(message.specs[0].name).toEqualTypeOf<string>();
        }
    });
});

describe('TiledSubscription lifecycle', () => {
    it('goes idle -> connecting -> connected and sends no auth frame without credentials', () => {
        const { subscription, statuses } = makeSubscription();
        expect(subscription.getStatus()).toBe('idle');
        subscription.connect();
        expect(FakeSocket.instances).toHaveLength(1);
        const socket = connectLatest();
        expect(statuses).toEqual(['idle', 'connecting', 'connected']);
        expect(socket.sent).toEqual([]);
    });

    it('does not connect until connect() is called', () => {
        new TiledWebSocketClient({ baseUrl: API_URL, socketFactory: fakeSocketFactory }).subscribe(
            'x',
        );
        expect(FakeSocket.instances).toHaveLength(0);
    });

    it('sends a first-frame api key, preferring an access token when both are set', () => {
        makeSubscription({ apiKey: 'k' }).subscription.connect();
        FakeSocket.latest().open();
        expect(JSON.parse(FakeSocket.latest().sent[0])).toEqual({ type: 'auth', api_key: 'k' });

        makeSubscription({ apiKey: 'k', accessToken: 't' }).subscription.connect();
        FakeSocket.latest().open();
        expect(JSON.parse(FakeSocket.latest().sent[0])).toEqual({
            type: 'auth',
            access_token: 't',
        });
    });

    it('treats 4003 as an auth error and does not reconnect', () => {
        vi.useFakeTimers();
        const { subscription, errors } = makeSubscription({ apiKey: 'bad' });
        subscription.connect();
        FakeSocket.latest().open();
        FakeSocket.latest().serverClose(TILED_WS_CLOSE.AUTH_FAILED, 'Authentication failed');
        expect(subscription.getStatus()).toBe('error');
        expect(errors.at(-1)).toMatchObject({ kind: 'auth', code: 4003 });
        vi.advanceTimersByTime(60_000);
        expect(FakeSocket.instances).toHaveLength(1);
    });

    it('treats a server close with 1000 as the end of the stream', () => {
        vi.useFakeTimers();
        const { subscription } = makeSubscription();
        subscription.connect();
        connectLatest();
        FakeSocket.latest().serverClose(1000, 'Producer ended stream');
        expect(subscription.getStatus()).toBe('closed');
        vi.advanceTimersByTime(60_000);
        expect(FakeSocket.instances).toHaveLength(1);
    });

    it('does not reconnect after an intentional disconnect', () => {
        vi.useFakeTimers();
        const { subscription, statuses } = makeSubscription();
        subscription.connect();
        const socket = connectLatest();
        subscription.disconnect();
        expect(socket.closedWith).toBe(1000);
        expect(statuses.at(-1)).toBe('closed');
        vi.advanceTimersByTime(60_000);
        expect(FakeSocket.instances).toHaveLength(1);
    });

    it('reconnects after an unexpected drop with exponential backoff that resets on success', () => {
        vi.useFakeTimers();
        vi.spyOn(Math, 'random').mockReturnValue(0.5); // no jitter
        const { subscription, statuses } = makeSubscription({
            reconnectDelay: 100,
            maxReconnectDelay: 350,
        });
        subscription.connect();
        connectLatest();

        FakeSocket.latest().serverClose(1006);
        expect(subscription.getStatus()).toBe('reconnecting');
        vi.advanceTimersByTime(99);
        expect(FakeSocket.instances).toHaveLength(1);
        vi.advanceTimersByTime(1);
        expect(FakeSocket.instances).toHaveLength(2);

        // The handshake fails twice: 200ms, then capped at 350ms.
        FakeSocket.latest().serverClose(1006);
        vi.advanceTimersByTime(200);
        expect(FakeSocket.instances).toHaveLength(3);
        FakeSocket.latest().serverClose(1006);
        vi.advanceTimersByTime(349);
        expect(FakeSocket.instances).toHaveLength(3);
        vi.advanceTimersByTime(1);
        expect(FakeSocket.instances).toHaveLength(4);

        // A successful connection resets the schedule.
        connectLatest();
        expect(subscription.getStatus()).toBe('connected');
        FakeSocket.latest().serverClose(1006);
        vi.advanceTimersByTime(100);
        expect(FakeSocket.instances).toHaveLength(5);
        expect(statuses).toContain('reconnecting');
    });

    it('gives up after maxReconnectAttempts', () => {
        vi.useFakeTimers();
        const { subscription, errors } = makeSubscription({
            reconnectDelay: 10,
            maxReconnectAttempts: 2,
        });
        subscription.connect();
        for (let i = 0; i < 3; i += 1) {
            FakeSocket.latest().serverClose(1006);
            vi.advanceTimersByTime(1_000);
        }
        expect(FakeSocket.instances).toHaveLength(3);
        expect(subscription.getStatus()).toBe('error');
        expect(errors.at(-1)?.kind).toBe('reconnect-exhausted');
    });

    it('does not reconnect when reconnect is false', () => {
        vi.useFakeTimers();
        const { subscription } = makeSubscription({ reconnect: false });
        subscription.connect();
        FakeSocket.latest().serverClose(1006);
        vi.advanceTimersByTime(60_000);
        expect(FakeSocket.instances).toHaveLength(1);
        expect(subscription.getStatus()).toBe('error');
    });
});

describe('TiledSubscription sequences', () => {
    const tableData = (sequence: number) => ({ ...STREAM_FIXTURES['table-data'], sequence });

    it('tracks the last sequence and resumes at last + 1 on reconnect', () => {
        vi.useFakeTimers();
        const { subscription } = makeSubscription({ start: 0 });
        subscription.connect();
        expect(new URL(FakeSocket.latest().url).searchParams.get('start')).toBe('0');
        connectLatest();
        FakeSocket.latest().emit(tableData(1));
        FakeSocket.latest().emit(tableData(2));
        expect(subscription.getLastSequence()).toBe(2);

        FakeSocket.latest().serverClose(1006);
        vi.advanceTimersByTime(60_000);
        expect(new URL(FakeSocket.latest().url).searchParams.get('start')).toBe('3');
    });

    it('drops duplicate and older sequences within a connection', () => {
        const { subscription, messages } = makeSubscription();
        subscription.connect();
        const socket = connectLatest();
        for (const sequence of [1, 2, 2, 1, 3]) socket.emit(tableData(sequence));
        expect(messages.filter((m) => m.type === 'table-data').map((m) => m.sequence)).toEqual([
            1, 2, 3,
        ]);
    });

    it('delivers the schema on every connection', () => {
        vi.useFakeTimers();
        const { subscription, messages } = makeSubscription();
        subscription.connect();
        connectLatest();
        FakeSocket.latest().serverClose(1006);
        vi.advanceTimersByTime(60_000);
        connectLatest();
        expect(messages.filter((m) => m.type === 'table-schema')).toHaveLength(2);
    });

    it('starts a new epoch when the server counter resets between connections', () => {
        vi.useFakeTimers();
        const { subscription, messages } = makeSubscription();
        subscription.connect();
        connectLatest();
        FakeSocket.latest().emit(tableData(7));
        FakeSocket.latest().serverClose(1006);
        vi.advanceTimersByTime(60_000);

        // The server restarted with an in-memory cache, so its counter is back at 1.
        connectLatest();
        FakeSocket.latest().emit(tableData(1));
        FakeSocket.latest().emit(tableData(1));
        FakeSocket.latest().emit(tableData(2));
        expect(messages.filter((m) => m.type === 'table-data').map((m) => m.sequence)).toEqual([
            7, 1, 2,
        ]);
        expect(subscription.getLastSequence()).toBe(2);
    });

    it('forgets the sequence when the producer ends the stream', () => {
        const { subscription } = makeSubscription();
        subscription.connect();
        connectLatest();
        FakeSocket.latest().emit(tableData(5));
        FakeSocket.latest().serverClose(1000);
        subscription.connect();
        expect(new URL(FakeSocket.latest().url).searchParams.has('start')).toBe(false);
    });

    it('counts unparseable frames as dropped and keeps streaming', () => {
        const { subscription, messages, errors } = makeSubscription();
        subscription.connect();
        const socket = connectLatest();
        socket.emit('{nope');
        socket.emitRaw(new ArrayBuffer(2));
        socket.emit(tableData(1));
        expect(subscription.getDroppedCount()).toBe(2);
        expect(errors.filter((e) => e.kind === 'parse')).toHaveLength(2);
        expect(messages.at(-1)?.type).toBe('table-data');
    });
});

describe('TiledSubscription listeners', () => {
    it('fans out to every listener, isolates a throwing one, and unsubscribes cleanly', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const subscription = new TiledSubscription({
            baseUrl: API_URL,
            path: '',
            socketFactory: fakeSocketFactory,
        });
        const first = vi.fn(() => {
            throw new Error('boom');
        });
        const second = vi.fn();
        const offFirst = subscription.onMessage(first);
        subscription.onMessage(second);
        subscription.connect();
        connectLatest(STREAM_FIXTURES['container-schema']);
        expect(first).toHaveBeenCalledTimes(1);
        expect(second).toHaveBeenCalledTimes(1);

        offFirst();
        FakeSocket.latest().emit(STREAM_FIXTURES['container-child-created']);
        expect(first).toHaveBeenCalledTimes(1);
        expect(second).toHaveBeenCalledTimes(2);
    });

    it('replays the current status to a new status listener', () => {
        const subscription = new TiledSubscription({
            baseUrl: API_URL,
            path: '',
            socketFactory: fakeSocketFactory,
        });
        subscription.connect();
        const listener = vi.fn();
        subscription.onStatus(listener);
        expect(listener).toHaveBeenCalledWith('connecting');
    });

    it('ignores events from a socket it has already replaced', () => {
        const { subscription, messages } = makeSubscription();
        subscription.connect();
        const stale = connectLatest();
        subscription.reconnect();
        stale.emit({ ...STREAM_FIXTURES['table-data'], sequence: 9 });
        stale.serverClose(1006);
        expect(messages.some((m) => m.type === 'table-data')).toBe(false);
        expect(FakeSocket.instances).toHaveLength(2);
    });
});
