import { QSERVER_SOCKET_PATHS } from '@/api/qServer_new/sockets/socketPaths';
import type { QServerSocketChannel, WebSocketLike } from '@/api/qServer_new/sockets/types';
import { deriveStatus } from '../core/status';
import type { QServerSim } from '../core/QServerSim';
import type { Unsubscribe } from '../core/types';

export interface QServerSimSocketFactoryOptions {
    /** Reject a handshake that presents no credentials, with close code 4401. Default false. */
    requireAuth?: boolean;
    /** Accept only this exact key; anything else closes with 4001. */
    expectApiKey?: string;
    /** Replay recent console lines to a newly opened console socket. Default true. */
    replayConsoleOnOpen?: boolean;
    /** How many buffered lines to replay. Default 50. */
    replayLines?: number;
}

/** The factory shape `QServerSocketOptions.socketFactory` expects, plus a teardown helper. */
export type QServerSimSocketFactory = ((url: string) => WebSocketLike) & {
    /** Close every socket this factory produced. Call it when tearing down a story or test. */
    closeAll: () => void;
};

const CLOSE_NORMAL = 1000;
const CLOSE_AUTH_REQUIRED = 4401;
const CLOSE_INVALID_TOKEN = 4001;
const CLOSE_UNSUPPORTED = 1008;

/**
 * Build fake websockets served from the simulator.
 *
 * Drops straight into the real socket code: `createQServerSocket` and the channel hooks already
 * accept a `socketFactory`, so nothing in `src/api/qServer_new` changes.
 *
 * ```ts
 * const sim = defaultQServer();
 * const socketFactory = createQServerSimSocketFactory(sim);
 * const { status } = useQServerStatusSocket({ baseUrl: 'http://sim.local:60610', socketFactory });
 * ```
 *
 * Two behaviours are deliberate deviations from the real server, both listed in the README:
 * console output can be replayed on connect (a real server replays nothing, but a story mounted
 * after setup would otherwise show an empty console), and the info channel emits a single frame
 * rather than a stream.
 */
export function createQServerSimSocketFactory(
    sim: QServerSim,
    options: QServerSimSocketFactoryOptions = {},
): QServerSimSocketFactory {
    const sockets = new Set<QServerSimSocket>();

    const open = (url: string): WebSocketLike => {
        const socket = new QServerSimSocket(sim, url, options, () => sockets.delete(socket));
        sockets.add(socket);
        return socket;
    };

    // `closeAll` is attached to the function so the factory still matches the plain
    // `(url) => WebSocketLike` signature `socketFactory` expects.
    return Object.assign(open, {
        closeAll: () => {
            for (const socket of [...sockets]) socket.close(CLOSE_NORMAL, 'factory teardown');
        },
    });
}

/**
 * One simulated websocket.
 *
 * Every handler call is deferred to a microtask, because `createQServerSocket` assigns `onopen`
 * and `onmessage` *after* the factory returns — firing synchronously would lose the first frame.
 * A microtask rather than a timer means fake-timer tests need no timer advancing.
 */
class QServerSimSocket implements WebSocketLike {
    readyState = 0;
    onopen: ((event: unknown) => void) | null = null;
    onmessage: ((event: { data: unknown }) => void) | null = null;
    onerror: ((event: unknown) => void) | null = null;
    onclose: ((event: { code: number; reason?: string }) => void) | null = null;

    /** Everything a client sent, for test assertions. */
    readonly sent: string[] = [];

    private unsubscribe: Unsubscribe | null = null;
    private closed = false;

    constructor(
        private readonly sim: QServerSim,
        readonly url: string,
        private readonly options: QServerSimSocketFactoryOptions,
        private readonly onDispose: () => void,
    ) {
        queueMicrotask(() => this.open());
    }

    send(data: string): void {
        this.sent.push(data);
        // The only client frame the server honours is the first-message auth handshake.
        if (!this.options.expectApiKey) return;
        try {
            const parsed = JSON.parse(data) as { type?: string; api_key?: string };
            if (parsed.type !== 'auth') return;
            if (parsed.api_key !== this.options.expectApiKey) {
                this.close(CLOSE_INVALID_TOKEN, 'Invalid token');
            }
        } catch {
            // Not JSON; a real server would ignore it too.
        }
    }

    close(code = CLOSE_NORMAL, reason = 'sim close'): void {
        if (this.closed) return;
        this.closed = true;
        this.readyState = 3;
        this.unsubscribe?.();
        this.unsubscribe = null;
        this.onDispose();
        queueMicrotask(() => this.onclose?.({ code, reason }));
    }

    private open(): void {
        if (this.closed) return;

        const channel = resolveChannel(this.url);
        if (!channel) {
            console.warn(`[qserver-sim] unknown websocket path: ${this.url}`);
            this.close(CLOSE_UNSUPPORTED, 'Unknown socket path');
            return;
        }

        const authFailure = this.checkAuth();
        if (authFailure) {
            this.close(authFailure.code, authFailure.reason);
            return;
        }

        this.readyState = 1;
        this.onopen?.({});
        this.subscribe(channel);
    }

    private checkAuth(): { code: number; reason: string } | null {
        const credentials = readCredentials(this.url);
        const { requireAuth, expectApiKey } = this.options;

        if (!credentials.apiKey && !credentials.accessToken) {
            // With first-message auth the credentials arrive later, so only `requireAuth` can
            // reject here; `expectApiKey` is checked in `send`.
            return requireAuth ? { code: CLOSE_AUTH_REQUIRED, reason: 'Auth required' } : null;
        }
        if (expectApiKey && credentials.apiKey && credentials.apiKey !== expectApiKey) {
            return { code: CLOSE_INVALID_TOKEN, reason: 'Invalid token' };
        }
        return null;
    }

    private subscribe(channel: QServerSocketChannel): void {
        if (channel === 'status') {
            // `subscribeStatus` replays the current status synchronously, which *is* the initial
            // frame — emitting one here as well would double up. Subsequent pushes are
            // change-gated by the simulator, so a run merely progressing sends nothing.
            this.unsubscribe = this.sim.subscribeStatus((status) => {
                this.emit({ time: this.sim.now() / 1000, msg: { status } });
            });
            return;
        }

        if (channel === 'console') {
            if (this.options.replayConsoleOnOpen ?? true) {
                const limit = this.options.replayLines ?? 50;
                for (const message of this.sim.getState().console.slice(-limit)) {
                    this.emit({ time: message.time, msg: message.msg });
                }
            }
            this.unsubscribe = this.sim.subscribeConsole((message) => {
                this.emit({ time: message.time, msg: message.msg });
            });
            return;
        }

        // The real info channel is low-traffic and nothing in Finch consumes it, so one frame
        // on connect is enough to prove the plumbing.
        this.emit({
            time: this.sim.now() / 1000,
            msg: { sim: true, version: deriveStatus(this.sim.getState()).msg },
        });
    }

    private emit(frame: unknown): void {
        if (this.closed) return;
        const data = JSON.stringify(frame);
        queueMicrotask(() => {
            if (this.closed) return;
            this.onmessage?.({ data });
        });
    }
}

function resolveChannel(url: string): QServerSocketChannel | null {
    const [pathname] = url.split('?');
    for (const [channel, path] of Object.entries(QSERVER_SOCKET_PATHS)) {
        if (pathname.endsWith(path)) return channel as QServerSocketChannel;
    }
    return null;
}

function readCredentials(url: string): { apiKey?: string; accessToken?: string } {
    const queryString = url.split('?')[1];
    if (!queryString) return {};
    const params = new URLSearchParams(queryString);
    return {
        apiKey: params.get('api_key') ?? undefined,
        accessToken: params.get('access_token') ?? undefined,
    };
}
