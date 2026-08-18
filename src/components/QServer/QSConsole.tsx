import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { EraserIcon } from '@phosphor-icons/react';
import { useQServerConsoleSocket } from '@/api/qServer';
import type { QServerConsoleFrame } from '@/api/qServer';
import { useQServerSocketFactory } from '@/api/qServerRuntime';
import { WidgetStyleProps } from './Widget';
import './styles/qserver.css';

//import ToggleSlider from '../library/ToggleSlider'; //to do  - see if this can be refactored to include the functionality for turning off if connection fails

type ConsoleMessage = {
    mainText: string;
    bracketText: string;
    time: string;
    id: number;
};

type QSConsoleProps = WidgetStyleProps & {
    processConsoleMessage: (message: string) => void;
};

/**
 * Live queue-server console output.
 *
 * The socket comes from `useQServerConsoleSocket` — `/api/queue_server/console_output/ws` on the queue
 * server itself, with its URL and API key resolved from `FinchConfigProvider`. It used to be a
 * hand-managed `WebSocket` pointed at the **ophyd** API's `qs-console-socket` relay, which meant this
 * panel needed a separate service running to show queue-server output.
 *
 * The hook owns the connection lifecycle (handshake, reconnect with backoff, teardown on unmount) and
 * keeps a bounded buffer, so this component only formats frames and renders them.
 */
export default function QSConsole({ processConsoleMessage = () => {} }: QSConsoleProps) {
    // The panel starts listening on mount, as it always has.
    const [isToggleOn, setIsToggleOn] = useState(true);
    const [statusMessage, setStatusMessage] = useState<string>('');

    // Present only when a `QServerApiProvider` supplies one — that is how qserver-sim drives this
    // panel in Storybook and tests. In the normal app tree it is undefined and a real socket opens.
    const socketFactory = useQServerSocketFactory();

    const { lines, frameCount, connectionStatus, error, clear } = useQServerConsoleSocket({
        enabled: isToggleOn,
        socketFactory,
    });

    const isOpened = connectionStatus === 'open';
    const messageContainerRef = useRef<HTMLDivElement | null>(null);

    const toggleSwitch = () => {
        const next = !isToggleOn;
        setIsToggleOn(next);
        if (!next) {
            setStatusMessage('Manually disconnected from websocket at ' + timestamp());
        }
    };

    /**
     * Frames formatted for display, oldest first.
     *
     * `id` is the message's position in the whole session rather than in the buffer, so the numbers
     * keep climbing once the buffer starts dropping its oldest entries.
     */
    const messages = useMemo<ConsoleMessage[]>(() => {
        const firstId = frameCount - lines.length;
        return lines.flatMap((frame, index) => {
            const message = formatConsoleFrame(frame, firstId + index);
            return message ? [message] : [];
        });
    }, [lines, frameCount]);

    // Report each new line to the parent exactly once. The keyword watcher upstream refetches the
    // queue and history when it sees certain phrases, so a duplicate here means a duplicate request —
    // which is why this counts what it has already reported instead of reacting to every render.
    const reportedCountRef = useRef(0);
    useEffect(() => {
        if (messages.length < reportedCountRef.current) {
            // The buffer was cleared, so start over.
            reportedCountRef.current = 0;
        }
        for (const message of messages.slice(reportedCountRef.current)) {
            processConsoleMessage(message.mainText.trim());
        }
        reportedCountRef.current = messages.length;
        // `processConsoleMessage` is intentionally not a dependency: callers pass an inline arrow, so
        // depending on it would re-report the whole buffer on every parent render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    // Surface the connection state where the old implementation used alert() and a pile of refs.
    useEffect(() => {
        if (!isToggleOn) return;
        if (connectionStatus === 'connecting' || connectionStatus === 'authenticating') {
            setStatusMessage('Attempting WS Connection');
        } else if (connectionStatus === 'open') {
            setStatusMessage('Opened connection ' + timestamp());
        }
    }, [connectionStatus, isToggleOn]);

    useEffect(() => {
        if (!error) return;
        setStatusMessage(`Websocket ${error.kind} error at ${timestamp()}: ${error.message}`);
    }, [error]);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <main className="h-full bg-white rounded-b-lg relative">
            {/* Toggle Switch & Status Header */}
            <div className="flex items-start justify-start space-x-12 pl-12 pt-1 absolute top-0 z-10">
                <div className="flex w-fit items-center space-x-2">
                    <p className={`${isToggleOn ? 'text-gray-400' : 'text-gray-800'}`}>OFF</p>
                    <button
                        onClick={toggleSwitch}
                        className={`w-16 h-5 flex items-center bg-gray-300 rounded-full px-1 cursor-pointer ${
                            isToggleOn ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                    >
                        <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                isToggleOn ? 'translate-x-10' : 'translate-x-0'
                            }`}
                        ></div>
                    </button>
                    <p className={`${isToggleOn ? 'text-green-600' : 'text-gray-400'}`}>ON</p>
                </div>
                <p className="text-slate-500">{statusMessage}</p>
                {messages.length > 0 && (
                    <button
                        onClick={clear}
                        title="Clear console output"
                        aria-label="Clear console output"
                        className="text-slate-400 hover:text-slate-600 flex items-center gap-1"
                    >
                        clear console
                        <EraserIcon size={18} />
                    </button>
                )}
            </div>
            {/* Main Body */}
            <div className="h-full w-full rounded-b-lg absolute top-0 pt-8">
                <section
                    ref={messageContainerRef}
                    className="overflow-auto h-full w-full rounded-b-lg scrollbar-always-visible"
                >
                    {isOpened ? (
                        <p className="text-slate-400 pl-4">
                            Connection Opened. Listening for Queue Server console output.
                        </p>
                    ) : (
                        <p className="animate-pulse text-white pl-4">
                            Waiting for initialization...
                        </p>
                    )}
                    <ul className="flex flex-col">
                        {messages.map((msg) => {
                            return (
                                <li key={msg.id} className="w-full flex text-slate-600">
                                    <p className="w-1/12 shrink-0 text-center text-slate-500">
                                        {' '}
                                        {msg.id}{' '}
                                    </p>
                                    {/* Monospaced with whitespace preserved: the Run Engine prints
                                        LiveTable output as ASCII art, so collapsing runs of spaces (or
                                        rendering them in a proportional font) turns its columns into
                                        gibberish. `pre-wrap` rather than `pre` so a line wider than the
                                        panel wraps instead of sliding under the timestamp column. */}
                                    <p className="w-9/12 min-w-0 whitespace-pre-wrap break-words font-mono">
                                        {msg.mainText}
                                    </p>
                                    <p className="w-1/6 shrink-0 text-sky-600 text-center">
                                        {msg.time}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </div>
        </main>
    );
}

function timestamp() {
    return dayjs().format('hh:mm A');
}

/**
 * Turn one console frame into a display row, or `null` for a bare newline.
 *
 * RE Manager prefixes most of its own narration with a
 * `[I 2026-08-18 12:00:00,000 bluesky_queueserver.…]` block, which is noise once you are reading a
 * column of them — so it is split off and only `mainText` is rendered and matched against. Anything
 * the plan itself prints (`LiveTable`, `print()`) arrives with no prefix at all.
 */
function formatConsoleFrame(frame: QServerConsoleFrame, id: number): ConsoleMessage | null {
    // Each message carries its own trailing newline — which is why the socket hook joins its buffer
    // with '' rather than '\n'. That newline has to come off before rendering, or every row would
    // occupy two lines now that whitespace is preserved.
    const text = frame.msg.replace(/\r?\n$/, '');
    if (text.length === 0) return null;

    const time =
        typeof frame.time === 'number'
            ? dayjs.unix(frame.time).format('hh:mm:ss::SSS a')
            : dayjs().format('hh:mm:ss::SSS a');

    if (text.startsWith('[')) {
        const closingBracketIndex = text.indexOf(']');
        return {
            bracketText: text.slice(0, closingBracketIndex + 1),
            // Exactly one space separates `]` from the message. Dropping it — and only it — puts
            // prefixed lines in the same column as the Run Engine's unprefixed table output, which
            // matters now that whitespace is rendered rather than collapsed.
            mainText: text.slice(closingBracketIndex + 1).replace(/^ /, ''),
            time,
            id,
        };
    }

    return { bracketText: '', mainText: text, time, id };
}
