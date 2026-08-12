import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createQServerConsoleSocket,
    createQServerInfoSocket,
    createQServerStatusSocket,
} from '../../api/qServer_new/sockets/channelSockets';
import { createQServerSocket } from '../../api/qServer_new/sockets/createQServerSocket';
import {
    QSERVER_WS_AUTH_TIMEOUT_MS,
    QSERVER_WS_CLOSE_AUTH_REQUIRED,
    QSERVER_WS_CLOSE_INVALID_TOKEN,
} from '../../api/qServer_new/sockets/socketPaths';
import type {
    QServerSocketError,
    QServerSocketStatus,
    WebSocketLike,
} from '../../api/qServer_new/sockets/types';

const BASE_URL = 'http://qserver.test:60610';

/** Minimal scriptable stand-in for a browser `WebSocket`. */
class FakeSocket implements WebSocketLike {
    static instances: FakeSocket[] = [];

    readyState = 0;
    sent: string[] = [];
    onopen: ((event: unknown) => void) | null = null;
    onmessage: ((event: { data: unknown }) => void) | null = null;
    onerror: ((event: unknown) => void) | null = null;
    onclose: ((event: { code: number; reason?: string }) => void) | null = null;

    constructor(readonly url: string) {
        FakeSocket.instances.push(this);
    }

    send(data: string): void {
        this.sent.push(data);
    }

    close(): void {
        this.readyState = 3;
    }

    open(): void {
        this.readyState = 1;
        this.onopen?.({});
    }

    emit(payload: unknown): void {
        this.onmessage?.({ data: typeof payload === 'string' ? payload : JSON.stringify(payload) });
    }

    serverClose(code: number): void {
        this.readyState = 3;
        this.onclose?.({ code });
    }
}

const factory = (url: string) => new FakeSocket(url);
const latest = () => FakeSocket.instances[FakeSocket.instances.length - 1];

beforeEach(() => {
    FakeSocket.instances = [];
    vi.useFakeTimers();
    // Removes jitter so backoff delays are exactly predictable.
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('queue server socket URLs', () => {
    it('targets the documented path per channel and converts http to ws', () => {
        createQServerConsoleSocket({ baseUrl: BASE_URL, apiKey: 'k', socketFactory: factory });
        expect(latest().url).toBe('ws://qserver.test:60610/api/console_output/ws?api_key=k');

        createQServerStatusSocket({ baseUrl: BASE_URL, apiKey: 'k', socketFactory: factory });
        expect(latest().url).toBe('ws://qserver.test:60610/api/status/ws?api_key=k');

        createQServerInfoSocket({ baseUrl: BASE_URL, apiKey: 'k', socketFactory: factory });
        expect(latest().url).toBe('ws://qserver.test:60610/api/info/ws?api_key=k');
    });

    it('upgrades https to wss and strips a trailing /api', () => {
        createQServerStatusSocket({
            baseUrl: 'https://qserver.test:60610/api',
            apiKey: 'k',
            socketFactory: factory,
        });
        expect(latest().url).toBe('wss://qserver.test:60610/api/status/ws?api_key=k');
    });

    it('prefers an access token over an api key', () => {
        createQServerStatusSocket({
            baseUrl: BASE_URL,
            apiKey: 'k',
            accessToken: 'jwt',
            socketFactory: factory,
        });
        expect(latest().url).toContain('access_token=jwt');
        expect(latest().url).not.toContain('api_key');
    });

    it('sends no credentials in none mode', () => {
        createQServerStatusSocket({
            baseUrl: BASE_URL,
            apiKey: 'k',
            socketFactory: factory,
        });
        expect(latest().url).toContain('api_key=k');

        createQServerSocket({
            url: 'ws://host/api/status/ws',
            auth: { apiKey: 'k', mode: 'none' },
            socketFactory: factory,
        });
        expect(latest().url).toBe('ws://host/api/status/ws');
    });
});

describe('first-message auth mode', () => {
    it('sends exactly one auth frame and nothing else', () => {
        const socket = createQServerStatusSocket({
            baseUrl: BASE_URL,
            apiKey: 'secret',
            authMode: 'message',
            socketFactory: factory,
        });
        const ws = latest();

        expect(ws.url).not.toContain('api_key');
        ws.open();
        expect(socket.getStatus()).toBe('authenticating');
        expect(ws.sent).toEqual([JSON.stringify({ type: 'auth', api_key: 'secret' })]);

        ws.emit({ time: 1, msg: { status: { manager_state: 'idle' } } });
        expect(socket.getStatus()).toBe('open');
        // Still only the auth frame: these sockets are strictly server-to-client afterwards.
        expect(ws.sent).toHaveLength(1);
    });

    it('treats a socket still open after the auth window as authenticated', () => {
        // The server acknowledges a good credentials frame with silence, and a quiet channel
        // may send no frames for minutes — so surviving the window IS the success signal.
        const errors: QServerSocketError[] = [];
        const socket = createQServerSocket({
            url: 'ws://host/api/status/ws',
            auth: { apiKey: 'k', mode: 'message' },
            socketFactory: factory,
        });
        socket.onError((error) => errors.push(error));

        latest().open();
        expect(socket.getStatus()).toBe('authenticating');

        vi.advanceTimersByTime(QSERVER_WS_AUTH_TIMEOUT_MS);

        expect(socket.getStatus()).toBe('open');
        expect(errors).toEqual([]);
    });

    it('reports a rejected credentials frame, not a timeout, when the server closes', () => {
        const errors: QServerSocketError[] = [];
        const socket = createQServerSocket({
            url: 'ws://host/api/status/ws',
            auth: { apiKey: 'bad', mode: 'message' },
            socketFactory: factory,
        });
        socket.onError((error) => errors.push(error));

        latest().open();
        latest().serverClose(QSERVER_WS_CLOSE_INVALID_TOKEN);
        vi.advanceTimersByTime(QSERVER_WS_AUTH_TIMEOUT_MS * 2);

        expect(socket.getStatus()).toBe('error');
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ kind: 'auth', code: QSERVER_WS_CLOSE_INVALID_TOKEN });
        // The pending window timer must not resurrect the socket after a close.
        expect(FakeSocket.instances).toHaveLength(1);
    });
});

describe('socket lifecycle', () => {
    it('replays the current status to a late subscriber', () => {
        const socket = createQServerStatusSocket({
            baseUrl: BASE_URL,
            socketFactory: factory,
        });
        latest().open();

        const seen: QServerSocketStatus[] = [];
        socket.onStatus((status) => seen.push(status));
        expect(seen).toEqual(['open']);
    });

    it('drops malformed frames without killing the socket', () => {
        const frames: unknown[] = [];
        const errors: QServerSocketError[] = [];
        const socket = createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory: factory });
        socket.onMessage((frame) => frames.push(frame));
        socket.onError((error) => errors.push(error));

        const ws = latest();
        ws.open();
        ws.emit('not json at all');
        ws.emit({ time: 1, msg: { nothing: 'useful' } }); // right envelope, wrong channel shape
        ws.emit({ time: 2, msg: { status: { manager_state: 'idle' } } });

        expect(frames).toHaveLength(1);
        expect(socket.getDroppedCount()).toBe(2);
        expect(errors.every((error) => error.kind === 'parse')).toBe(true);
        expect(socket.getStatus()).toBe('open');
    });

    it('does not reconnect after an auth-related close', () => {
        const errors: QServerSocketError[] = [];
        const socket = createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory: factory });
        socket.onError((error) => errors.push(error));

        latest().serverClose(QSERVER_WS_CLOSE_AUTH_REQUIRED);
        vi.advanceTimersByTime(60_000);

        expect(FakeSocket.instances).toHaveLength(1);
        expect(socket.getStatus()).toBe('error');
        expect(errors[0]).toMatchObject({ kind: 'auth', code: QSERVER_WS_CLOSE_AUTH_REQUIRED });
    });

    it('does not reconnect after an invalid-token close', () => {
        const socket = createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory: factory });
        latest().serverClose(QSERVER_WS_CLOSE_INVALID_TOKEN);
        vi.advanceTimersByTime(60_000);

        expect(FakeSocket.instances).toHaveLength(1);
        expect(socket.getStatus()).toBe('error');
    });

    it('backs off exponentially and caps the delay', () => {
        createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory: factory });

        const delays = [500, 1000, 2000, 4000, 8000, 15000, 15000];
        for (const delay of delays) {
            const before = FakeSocket.instances.length;
            latest().serverClose(1006);
            vi.advanceTimersByTime(delay - 1);
            expect(FakeSocket.instances).toHaveLength(before);
            vi.advanceTimersByTime(1);
            expect(FakeSocket.instances).toHaveLength(before + 1);
        }
    });

    it('resets the backoff after a successful connection', () => {
        createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory: factory });
        latest().serverClose(1006);
        vi.advanceTimersByTime(500);
        latest().serverClose(1006);
        vi.advanceTimersByTime(1000);

        latest().open();
        latest().serverClose(1006);

        const before = FakeSocket.instances.length;
        vi.advanceTimersByTime(500);
        expect(FakeSocket.instances).toHaveLength(before + 1);
    });

    it('stops reconnecting once closed by the caller', () => {
        const socket = createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory: factory });
        socket.close();
        latest().serverClose(1006);
        vi.advanceTimersByTime(60_000);

        expect(FakeSocket.instances).toHaveLength(1);
        expect(socket.getStatus()).toBe('closed');
    });

    it('gives up after maxAttempts', () => {
        const errors: QServerSocketError[] = [];
        const socket = createQServerSocket({
            url: 'ws://host/api/status/ws',
            reconnect: { maxAttempts: 2 },
            socketFactory: factory,
        });
        socket.onError((error) => errors.push(error));

        for (let i = 0; i < 4; i += 1) {
            latest().serverClose(1006);
            vi.advanceTimersByTime(60_000);
        }

        expect(FakeSocket.instances).toHaveLength(3); // initial + 2 retries
        expect(errors.some((error) => error.kind === 'reconnect-exhausted')).toBe(true);
    });

    it('reconnects immediately on request', () => {
        const socket = createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory: factory });
        latest().open();
        socket.reconnect();

        expect(FakeSocket.instances).toHaveLength(2);
        expect(socket.getStatus()).toBe('connecting');
    });
});

describe('channel frame typing', () => {
    it('accepts console strings and rejects status-shaped frames', () => {
        const frames: unknown[] = [];
        const socket = createQServerConsoleSocket({ baseUrl: BASE_URL, socketFactory: factory });
        socket.onMessage((frame) => frames.push(frame));

        const ws = latest();
        ws.open();
        ws.emit({ time: 1, msg: 'a console line\n' });
        ws.emit({ time: 2, msg: { status: {} } });

        expect(frames).toEqual([{ time: 1, msg: 'a console line\n' }]);
        expect(socket.getDroppedCount()).toBe(1);
    });
});
