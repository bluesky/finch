import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import QSConsole from '../../components/QServer/QSConsole';
import { QServerApiProvider } from '../../api/qServerRuntime/QServerApiProvider';
import type { WebSocketLike } from '../../api/qServer/sockets/types';
import { createQServerSimClient } from '../../lib/qserver-sim/client/QServerSimClient';
import { defaultQServer } from '../../lib/qserver-sim/scenarios/defaultQServer';

/**
 * How `QSConsole` renders what the Run Engine actually prints.
 *
 * The Run Engine's `LiveTable` output is ASCII art aligned with runs of spaces, and every console
 * message arrives with its own trailing newline. Both of those are easy to lose: HTML collapses
 * whitespace by default, and a preserved trailing newline doubles the height of every row. These
 * frames are copied from a real capture — `src/api/qServer/references/console_output_ws.txt`.
 */
const CAPTURED_FRAMES = [
    "[I 2026-08-13 10:15:43,575 bluesky_queueserver.manager.plan_monitoring] New run was open: 'cb75fc37'\n",
    "New stream: 'primary'\n",
    '+-----------+------------+------------+\n',
    '|   seq_num |       time |       det1 |\n',
    '+-----------+------------+------------+\n',
    '|         1 | 10:15:43.6 |      5.000 |\n',
    '+-----------+------------+------------+\n',
    '\n',
];

/** A socket that reports open and then replays the captured frames on demand. */
function makeReplaySocket() {
    let socket: WebSocketLike | undefined;

    const socketFactory = (_url: string): WebSocketLike => {
        socket = {
            readyState: 1,
            send: vi.fn(),
            close: vi.fn(),
            onopen: null,
            onmessage: null,
            onerror: null,
            onclose: null,
        };
        // The transport wires its handlers synchronously after construction.
        queueMicrotask(() => socket?.onopen?.({}));
        return socket;
    };

    const replay = async () => {
        for (const [index, msg] of CAPTURED_FRAMES.entries()) {
            await act(async () => {
                socket?.onmessage?.({
                    data: JSON.stringify({ time: 1_770_000_000 + index, msg }),
                });
            });
        }
    };

    return { socketFactory, replay };
}

function renderConsole(socketFactory: (url: string) => WebSocketLike) {
    const sim = defaultQServer();
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QServerApiProvider client={createQServerSimClient(sim)} socketFactory={socketFactory}>
            {children}
        </QServerApiProvider>
    );
    return render(<QSConsole processConsoleMessage={vi.fn()} />, { wrapper });
}

/** Text matching normalizes whitespace by default, which is exactly what must not happen here. */
const verbatim = { normalizer: (text: string) => text };

describe('QSConsole rendering of real console output', () => {
    it('preserves the runs of spaces a LiveTable aligns its columns with', async () => {
        const { socketFactory, replay } = makeReplaySocket();
        renderConsole(socketFactory);

        await waitFor(() =>
            expect(
                screen.getByText(/Listening for Queue Server console output/i),
            ).toBeInTheDocument(),
        );
        await replay();

        // Not "| seq_num | time | det1 |" — the padding is what lines the table up.
        expect(
            screen.getByText('|   seq_num |       time |       det1 |', verbatim),
        ).toBeInTheDocument();
        expect(
            screen.getByText('|         1 | 10:15:43.6 |      5.000 |', verbatim),
        ).toBeInTheDocument();
    });

    it('renders the table in a monospaced box that keeps whitespace', async () => {
        const { socketFactory, replay } = makeReplaySocket();
        renderConsole(socketFactory);
        await waitFor(() =>
            expect(
                screen.getByText(/Listening for Queue Server console output/i),
            ).toBeInTheDocument(),
        );
        await replay();

        // Preserved spaces are useless in a proportional font, so the two go together.
        const row = screen.getByText('|   seq_num |       time |       det1 |', verbatim);
        expect(row.className).toContain('font-mono');
        expect(row.className).toContain('whitespace-pre-wrap');
    });

    it('strips the trailing newline each message carries, so no row is double height', async () => {
        const { socketFactory, replay } = makeReplaySocket();
        renderConsole(socketFactory);
        await waitFor(() =>
            expect(
                screen.getByText(/Listening for Queue Server console output/i),
            ).toBeInTheDocument(),
        );
        await replay();

        const row = screen.getByText('|   seq_num |       time |       det1 |', verbatim);
        expect(row.textContent).not.toMatch(/\n$/);
    });

    it('aligns prefixed narration with unprefixed plan output at column 0', async () => {
        const { socketFactory, replay } = makeReplaySocket();
        renderConsole(socketFactory);
        await waitFor(() =>
            expect(
                screen.getByText(/Listening for Queue Server console output/i),
            ).toBeInTheDocument(),
        );
        await replay();

        // The `[I … logger]` block is dropped along with the single space that separated it, so this
        // line starts where the table's `+---` does rather than one column to its right.
        const narration = screen.getByText("New run was open: 'cb75fc37'", verbatim);
        expect(narration).toBeInTheDocument();
        expect(narration.textContent?.startsWith(' ')).toBe(false);
    });

    it('drops frames that are only a newline', async () => {
        const { socketFactory, replay } = makeReplaySocket();
        renderConsole(socketFactory);
        await waitFor(() =>
            expect(
                screen.getByText(/Listening for Queue Server console output/i),
            ).toBeInTheDocument(),
        );
        await replay();

        // Eight frames went in; the bare newline is not a row.
        expect(screen.getAllByRole('listitem')).toHaveLength(CAPTURED_FRAMES.length - 1);
    });
});
