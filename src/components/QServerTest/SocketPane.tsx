import { useState } from 'react';
import {
    useQServerConsoleSocket,
    useQServerInfoSocket,
    useQServerStatusSocket,
    type QServerSocketAuth,
    type QServerSocketChannel,
    type QServerSocketStatus,
} from '@/api/qServer_new';
import JsonResultViewer from './JsonResultViewer';

export interface SocketPaneProps {
    channel: QServerSocketChannel;
    baseUrl: string;
    apiKey: string | null;
}

const STATUS_COLORS: Record<QServerSocketStatus, string> = {
    connecting: 'bg-amber-400',
    authenticating: 'bg-amber-400',
    open: 'bg-emerald-500',
    closed: 'bg-slate-400',
    error: 'bg-rose-500',
};

const CHANNEL_LABELS: Record<QServerSocketChannel, string> = {
    console: 'Console output — /api/console_output/ws',
    status: 'Status — /api/status/ws',
    info: 'System info — /api/info/ws',
};

/**
 * One live websocket, with a switch for both auth mechanisms.
 *
 * `query` mode puts the key in the URL (the only option a browser has at handshake time);
 * `message` mode connects bare and sends `{"type":"auth", …}` as the first frame.
 */
export default function SocketPane({ channel, baseUrl, apiKey }: SocketPaneProps) {
    const [connected, setConnected] = useState(false);
    const [authMode, setAuthMode] = useState<NonNullable<QServerSocketAuth['mode']>>('query');

    const options = { baseUrl, apiKey, authMode, enabled: connected };

    // All three hooks run so the pane keeps a stable hook order; only the matching channel
    // is enabled, and the others stay closed.
    const consoleSocket = useQServerConsoleSocket({
        ...options,
        enabled: connected && channel === 'console',
        maxLines: 500,
    });
    const statusSocket = useQServerStatusSocket({
        ...options,
        enabled: connected && channel === 'status',
    });
    const infoSocket = useQServerInfoSocket({
        ...options,
        enabled: connected && channel === 'info',
    });

    const socket =
        channel === 'console' ? consoleSocket : channel === 'status' ? statusSocket : infoSocket;

    return (
        <section
            data-testid={`qserver-socket-pane-${channel}`}
            className="rounded border border-slate-300 p-3 dark:border-slate-700"
        >
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className={`${STATUS_COLORS[socket.connectionStatus]} h-2.5 w-2.5 rounded-full`}
                />
                <span className="text-sm font-medium">{CHANNEL_LABELS[channel]}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {socket.connectionStatus} · {socket.frameCount} frames
                    {socket.droppedCount > 0 && ` · ${socket.droppedCount} dropped`}
                </span>

                <label className="ml-auto text-xs">
                    <span className="mr-1 text-slate-500 dark:text-slate-400">auth</span>
                    <select
                        value={authMode}
                        disabled={connected}
                        onChange={(event) =>
                            setAuthMode(
                                event.target.value as NonNullable<QServerSocketAuth['mode']>,
                            )
                        }
                        className="rounded border border-slate-300 px-1 py-0.5 text-xs disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800"
                    >
                        <option value="query">query param</option>
                        <option value="message">first message</option>
                        <option value="none">none</option>
                    </select>
                </label>

                <button
                    type="button"
                    onClick={() => setConnected((value) => !value)}
                    className="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-white dark:bg-slate-200 dark:text-slate-900"
                >
                    {connected ? 'Disconnect' : 'Connect'}
                </button>
                {connected && (
                    <button
                        type="button"
                        onClick={socket.reconnect}
                        className="rounded border border-slate-400 px-3 py-1 text-xs dark:border-slate-600"
                    >
                        Reconnect
                    </button>
                )}
                {channel === 'console' && (
                    <button
                        type="button"
                        onClick={consoleSocket.clear}
                        className="rounded border border-slate-400 px-3 py-1 text-xs dark:border-slate-600"
                    >
                        Clear
                    </button>
                )}
            </div>

            {socket.error && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {socket.error.kind}
                    {socket.error.code ? ` (${socket.error.code})` : ''}: {socket.error.message}
                </p>
            )}

            {/* Only for a socket that actually failed to stay connected — never for a live one. */}
            {socket.connectionStatus === 'error' &&
                socket.error?.kind === 'auth' &&
                authMode !== 'none' &&
                apiKey && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        A queue server running without authentication rejects the handshake when
                        credentials are supplied (it answers 500). Disconnect and switch auth to{' '}
                        <code>none</code> if that is your setup.
                    </p>
                )}

            {connected && (
                <div className="mt-2">
                    {channel === 'console' ? (
                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded bg-slate-950 px-2 py-1 font-mono text-xs text-slate-100">
                            {consoleSocket.text || '(waiting for output…)'}
                        </pre>
                    ) : (
                        <JsonResultViewer
                            value={
                                channel === 'status'
                                    ? (statusSocket.status ?? '(waiting for a status frame…)')
                                    : (infoSocket.info ?? '(waiting for an info frame…)')
                            }
                            maxHeightClass="max-h-64"
                        />
                    )}
                </div>
            )}
        </section>
    );
}
