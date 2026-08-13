import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createQServerConsoleSocket,
    createQServerInfoSocket,
    createQServerStatusSocket,
} from '../../../api/qServer_new/sockets/channelSockets';
import type {
    QServerConsoleFrame,
    QServerStatusFrame,
} from '../../../api/qServer_new/sockets/messageTypes';
import type { QServerSocketError } from '../../../api/qServer_new/sockets/types';
import { SIM_CONSOLE } from '../../../lib/qserver-sim/core/consoleMessages';
import { createQServerSimSocketFactory } from '../../../lib/qserver-sim/sockets/createQServerSimSocketFactory';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';

const BASE_URL = 'http://sim.local:60610';

/** The sim sockets only ever use microtasks, so this is all a test has to flush. */
async function flush(): Promise<void> {
    for (let index = 0; index < 5; index += 1) await Promise.resolve();
}

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('status channel', () => {
    it('opens and pushes an initial status frame', async () => {
        const sim = defaultQServer();
        const socketFactory = createQServerSimSocketFactory(sim);
        const frames: QServerStatusFrame[] = [];

        const transport = createQServerStatusSocket({
            baseUrl: BASE_URL,
            apiKey: 'k',
            socketFactory,
        });
        transport.onMessage((frame) => frames.push(frame));

        await flush();

        expect(transport.getStatus()).toBe('open');
        expect(frames).toHaveLength(1);
        expect(frames[0].msg.status.plan_queue_uid).toBe(sim.getStatus().plan_queue_uid);
        expect(frames[0].msg.status.items_in_queue).toBe(3);
    });

    it('pushes a frame when sim state changes', async () => {
        const sim = defaultQServer();
        const socketFactory = createQServerSimSocketFactory(sim);
        const frames: QServerStatusFrame[] = [];

        createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory }).onMessage((frame) =>
            frames.push(frame),
        );
        await flush();

        sim.addItem({ item: { name: 'count', item_type: 'plan' } });
        await flush();

        expect(frames).toHaveLength(2);
        expect(frames[1].msg.status.items_in_queue).toBe(4);
    });

    /** The change-gate: a run progressing must not fan out a frame on every tick. */
    it('pushes nothing for a progress tick', async () => {
        const sim = defaultQServer();
        const socketFactory = createQServerSimSocketFactory(sim);
        const frames: QServerStatusFrame[] = [];

        createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory }).onMessage((frame) =>
            frames.push(frame),
        );
        sim.startQueue();
        await flush();

        const before = frames.length;
        sim.advance(sim.getBehavior().runDurationMs / 3);
        await flush();

        expect(frames).toHaveLength(before);
    });
});

describe('console channel', () => {
    it('streams console lines in order', async () => {
        const sim = defaultQServer();
        const socketFactory = createQServerSimSocketFactory(sim, { replayConsoleOnOpen: false });
        const frames: QServerConsoleFrame[] = [];

        createQServerConsoleSocket({ baseUrl: BASE_URL, socketFactory }).onMessage((frame) =>
            frames.push(frame),
        );
        await flush();
        expect(frames).toHaveLength(0);

        sim.startQueue();
        await flush();

        // Realistic output: the two manager lines, then the whole plan-start block.
        const text = frames.map((frame) => frame.msg).join('');
        expect(text).toContain(SIM_CONSOLE.startingQueue);
        expect(text).toContain(SIM_CONSOLE.processingNextItem(2));
        expect(text).toContain('Starting the plan:');
        expect(text).toContain("New run was open: 'sim-run-1'");
        expect(frames.length).toBeGreaterThan(3);

        // Prefixed like the real server, except for bluesky's own bare output.
        expect(frames[0].msg).toMatch(/^\[I .+ bluesky_queueserver\.manager\.manager\] /);
        expect(frames.some((frame) => frame.msg.startsWith('Transient Scan ID:'))).toBe(true);
    });

    it('reports the run finishing', async () => {
        const sim = defaultQServer();
        const socketFactory = createQServerSimSocketFactory(sim, { replayConsoleOnOpen: false });
        const frames: QServerConsoleFrame[] = [];

        createQServerConsoleSocket({ baseUrl: BASE_URL, socketFactory }).onMessage((frame) =>
            frames.push(frame),
        );
        sim.startQueue();
        await flush();
        frames.length = 0;

        sim.advance(sim.getBehavior().runDurationMs);
        await flush();

        const text = frames.map((frame) => frame.msg).join('');
        expect(text).toContain("Run was closed: 'sim-run-1'");
        expect(text).toContain(SIM_CONSOLE.planExited('completed'));
    });

    it('replays a bounded backlog on connect', async () => {
        const sim = defaultQServer();
        sim.startQueue();

        const socketFactory = createQServerSimSocketFactory(sim, {
            replayConsoleOnOpen: true,
            replayLines: 2,
        });
        const frames: QServerConsoleFrame[] = [];

        createQServerConsoleSocket({ baseUrl: BASE_URL, socketFactory }).onMessage((frame) =>
            frames.push(frame),
        );
        await flush();

        expect(frames).toHaveLength(2);
        // The tail of the backlog: the last two messages the queue start produced.
        expect(frames.at(-1)?.msg).toContain("New stream: 'primary'");
    });
});

describe('info channel', () => {
    it('emits one frame on connect and nothing after', async () => {
        const sim = defaultQServer();
        const socketFactory = createQServerSimSocketFactory(sim);
        const frames: unknown[] = [];

        createQServerInfoSocket({ baseUrl: BASE_URL, socketFactory }).onMessage((frame) =>
            frames.push(frame),
        );
        await flush();
        expect(frames).toHaveLength(1);

        sim.addItem({ item: { name: 'count', item_type: 'plan' } });
        await flush();
        expect(frames).toHaveLength(1);
    });
});

describe('auth', () => {
    it('rejects a credential-less handshake with 4401 and does not reconnect', async () => {
        const sim = defaultQServer();
        const socketFactory = createQServerSimSocketFactory(sim, { requireAuth: true });
        const errors: QServerSocketError[] = [];

        const transport = createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory });
        transport.onError((error) => errors.push(error));

        await flush();
        // Well past every backoff step: an auth failure must not be retried.
        vi.advanceTimersByTime(60_000);
        await flush();

        expect(transport.getStatus()).toBe('error');
        expect(errors[0]).toMatchObject({ kind: 'auth', code: 4401 });
    });

    it('rejects a wrong key with 4001', async () => {
        const sim = defaultQServer();
        const socketFactory = createQServerSimSocketFactory(sim, { expectApiKey: 'right' });
        const errors: QServerSocketError[] = [];

        const transport = createQServerStatusSocket({
            baseUrl: BASE_URL,
            apiKey: 'wrong',
            socketFactory,
        });
        transport.onError((error) => errors.push(error));
        await flush();

        expect(errors[0]).toMatchObject({ kind: 'auth', code: 4001 });
    });

    it('accepts the expected key', async () => {
        const sim = defaultQServer();
        const socketFactory = createQServerSimSocketFactory(sim, { expectApiKey: 'right' });

        const transport = createQServerStatusSocket({
            baseUrl: BASE_URL,
            apiKey: 'right',
            socketFactory,
        });
        await flush();

        expect(transport.getStatus()).toBe('open');
    });
});

describe('lifecycle', () => {
    it('releases its sim subscription on close', async () => {
        const sim = defaultQServer();
        const socketFactory = createQServerSimSocketFactory(sim);

        const transport = createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory });
        await flush();
        expect(sim.listenerCounts().status).toBe(1);

        transport.close();
        await flush();

        expect(sim.listenerCounts().status).toBe(0);
        // And mutating afterwards is harmless.
        expect(() => sim.addItem({ item: { name: 'count', item_type: 'plan' } })).not.toThrow();
    });

    it('gets a fresh initial frame on reconnect', async () => {
        const sim = defaultQServer();
        const socketFactory = createQServerSimSocketFactory(sim);
        const frames: QServerStatusFrame[] = [];

        const transport = createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory });
        transport.onMessage((frame) => frames.push(frame));
        await flush();

        sim.addItem({ item: { name: 'count', item_type: 'plan' } });
        await flush();

        transport.reconnect();
        await flush();

        expect(frames.at(-1)?.msg.status.items_in_queue).toBe(4);
        expect(sim.listenerCounts().status).toBe(1);
    });

    it('closeAll tears down every socket it produced', async () => {
        const sim = defaultQServer();
        const socketFactory = createQServerSimSocketFactory(sim);

        createQServerStatusSocket({ baseUrl: BASE_URL, socketFactory });
        createQServerConsoleSocket({ baseUrl: BASE_URL, socketFactory });
        await flush();
        expect(sim.listenerCounts()).toMatchObject({ status: 1, console: 1 });

        socketFactory.closeAll();
        await flush();

        expect(sim.listenerCounts()).toMatchObject({ status: 0, console: 0 });
    });

    it('closes an unknown socket path instead of throwing', async () => {
        const sim = defaultQServer();
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const socketFactory = createQServerSimSocketFactory(sim);

        const socket = socketFactory('ws://sim.local:60610/api/nope/ws');
        const closes: { code: number }[] = [];
        socket.onclose = (event) => closes.push(event);
        await flush();

        expect(closes[0]?.code).toBe(1008);
        expect(warn).toHaveBeenCalled();
    });
});
