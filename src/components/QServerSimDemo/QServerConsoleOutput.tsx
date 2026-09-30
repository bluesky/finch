import { useEffect, useRef, useState } from 'react';
import { useQServerConsoleSocket } from '@/api/qServer';
import { useQServerSocketFactory } from '@/api/qServerRuntime';

export interface QServerConsoleOutputProps {
    /** Open the socket on mount. Default true. */
    autoConnect?: boolean;
    /** Lines retained before the oldest are dropped. Default 500. */
    maxLines?: number;
    className?: string;
}

const STATUS_COLORS: Record<string, string> = {
    connecting: 'bg-amber-400',
    authenticating: 'bg-amber-400',
    open: 'bg-emerald-500',
    closed: 'bg-slate-400',
    error: 'bg-rose-500',
};

/**
 * Live console output from `/api/console_output/ws`.
 *
 * Uses the ordinary `useQServerConsoleSocket` hook, so this is a real websocket against a real
 * server and a simulated one in Storybook — the only difference is the socket factory the provider
 * hands over.
 *
 * The server splits its output into `[I <timestamp> <logger>] message` lines; those are dimmed here
 * so the message itself reads clearly, which is the same treatment `QSConsole` gives them.
 */
export default function QServerConsoleOutput({
    autoConnect = true,
    maxLines = 500,
    className = '',
}: QServerConsoleOutputProps) {
    const socketFactory = useQServerSocketFactory();
    const [connected, setConnected] = useState(autoConnect);
    const [follow, setFollow] = useState(true);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const { lines, connectionStatus, frameCount, error, clear, reconnect } =
        useQServerConsoleSocket({
            socketFactory,
            enabled: connected,
            maxLines,
        });

    useEffect(() => {
        if (!follow || !scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [lines, follow]);

    return (
        <section
            data-testid="qserver-console-output"
            className={
                'rounded border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950 ' +
                className
            }
        >
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                <span
                    className={`${STATUS_COLORS[connectionStatus] ?? 'bg-slate-400'} h-2.5 w-2.5 rounded-full`}
                />
                <h3 className="text-sm font-medium">Console output</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    /api/console_output/ws · {connectionStatus} · {frameCount} messages
                </span>

                <label className="ml-auto flex items-center gap-1 text-xs">
                    <input
                        type="checkbox"
                        checked={follow}
                        onChange={(event) => setFollow(event.target.checked)}
                    />
                    follow
                </label>
                <button
                    type="button"
                    onClick={() => setConnected((value) => !value)}
                    className="rounded bg-slate-800 px-2 py-1 text-xs font-medium text-white dark:bg-slate-200 dark:text-slate-900"
                >
                    {connected ? 'Disconnect' : 'Connect'}
                </button>
                {connected && (
                    <button
                        type="button"
                        onClick={reconnect}
                        className="rounded border border-slate-400 px-2 py-1 text-xs dark:border-slate-600"
                    >
                        Reconnect
                    </button>
                )}
                <button
                    type="button"
                    onClick={clear}
                    className="rounded border border-slate-400 px-2 py-1 text-xs dark:border-slate-600"
                >
                    Clear
                </button>
            </div>

            {error && (
                <p className="px-3 py-1 text-xs text-rose-600 dark:text-rose-400">
                    {error.kind}
                    {error.code ? ` (${error.code})` : ''}: {error.message}
                </p>
            )}

            {/* Fixed height, not max-height: growing from empty to full shifted the page on the
                first message. */}
            <div
                ref={scrollRef}
                className="h-72 overflow-y-auto rounded-b bg-slate-950 px-3 py-2 font-mono text-xs leading-relaxed text-slate-100"
            >
                {lines.length === 0 ? (
                    <p className="text-slate-500">{emptyMessage(connected, connectionStatus)}</p>
                ) : (
                    lines.map((line, index) => {
                        const { bracket, message } = splitBracket(line.msg);
                        return (
                            <pre
                                // Console lines are an append-only stream with no ids of their own.
                                key={`${index}-${line.time}`}
                                className="whitespace-pre-wrap break-words"
                            >
                                {bracket && <span className="text-slate-500">{bracket}</span>}
                                <span>{message}</span>
                            </pre>
                        );
                    })
                )}
            </div>
        </section>
    );
}

/**
 * What to show before any line has arrived.
 *
 * Distinguishing "connected, nothing has happened yet" from "never connected" matters: a socket
 * stuck at `connecting` looks identical to a quiet server otherwise, which is exactly how a missing
 * socket factory hides itself.
 */
function emptyMessage(connected: boolean, status: string): string {
    if (!connected) return 'disconnected';
    if (status === 'open') return 'connected — waiting for output…';
    if (status === 'error') return 'connection failed; see the error above';
    return `${status}… no console output yet`;
}

/** Split a leading `[I … logger]` block off, the way `QSConsole` does. */
function splitBracket(msg: string): { bracket: string; message: string } {
    const text = msg.replace(/\n$/, '');
    if (!text.startsWith('[')) return { bracket: '', message: text };

    const end = text.indexOf(']');
    if (end === -1) return { bracket: '', message: text };
    return { bracket: text.slice(0, end + 1), message: text.slice(end + 1) };
}
