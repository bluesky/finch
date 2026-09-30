import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import QSConsole from '../../../components/QServer/QSConsole';
import { QServerApiProvider } from '../../../api/qServerRuntime/QServerApiProvider';
import { createQServerSimClient } from '../../../lib/qserver-sim/client/QServerSimClient';
import { createQServerSimSocketFactory } from '../../../lib/qserver-sim/sockets/createQServerSimSocketFactory';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';
import type { QServerSim } from '../../../lib/qserver-sim/core/QServerSim';

/**
 * `QSConsole` against the simulator's console websocket.
 *
 * The panel used to manage a `WebSocket` by hand, pointed at the **ophyd** API's `qs-console-socket`
 * relay. It now uses `useQServerConsoleSocket`, which talks to the queue server directly — and reads a
 * socket factory off `QServerApiProvider`, which is what makes this test possible at all.
 */
function renderConsole(sim: QServerSim, processConsoleMessage = vi.fn()) {
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QServerApiProvider
            client={createQServerSimClient(sim)}
            socketFactory={createQServerSimSocketFactory(sim)}
        >
            {children}
        </QServerApiProvider>
    );

    const result = render(<QSConsole processConsoleMessage={processConsoleMessage} />, { wrapper });
    return { ...result, processConsoleMessage };
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('QSConsole against the simulator', () => {
    it('opens the console socket on mount, with no ophyd service involved', async () => {
        const sim = defaultQServer();
        renderConsole(sim);

        await waitFor(() =>
            expect(
                screen.getByText(/Listening for Queue Server console output/i),
            ).toBeInTheDocument(),
        );
        expect(sim.listenerCounts().console).toBe(1);
    });

    it('renders lines the server emits, with the [I …] prefix split off', async () => {
        const sim = defaultQServer();
        renderConsole(sim);

        await waitFor(() => expect(sim.listenerCounts().console).toBe(1));
        sim.closeEnvironment();

        await waitFor(() =>
            expect(screen.getByText(/Closing existing RE environment/i)).toBeInTheDocument(),
        );
        // The bracketed logger block is stripped before rendering, so the row shows the message only.
        expect(screen.queryByText(/bluesky_queueserver/)).not.toBeInTheDocument();
    });

    it('reports each line to processConsoleMessage exactly once', async () => {
        const sim = defaultQServer();
        const { processConsoleMessage } = renderConsole(sim);

        await waitFor(() => expect(sim.listenerCounts().console).toBe(1));
        sim.closeEnvironment();

        await waitFor(() => expect(processConsoleMessage).toHaveBeenCalled());
        const reported = processConsoleMessage.mock.calls.map(([text]) => text as string);
        const opening = reported.filter((text) => /Closing existing RE environment/i.test(text));

        // The environment starts open in this scenario, so closing it is what produces output.
        // Exactly once matters: the keyword watcher upstream refetches the queue when it sees certain
        // phrases, so a duplicate line means a duplicate request.
        expect(opening).toHaveLength(1);
        // The text handed over is the message without its logger prefix, already trimmed.
        expect(opening[0]).not.toMatch(/^\[/);
        expect(opening[0]).toBe(opening[0].trim());
    });

    it('closes the socket when the output is toggled off, and reopens on toggle', async () => {
        const sim = defaultQServer();
        renderConsole(sim);

        await waitFor(() => expect(sim.listenerCounts().console).toBe(1));

        screen.getByRole('button', { name: '' }).click();
        await waitFor(() => expect(sim.listenerCounts().console).toBe(0));
        // `findByText`, not `getByText`: the simulator drops its listener as soon as the socket
        // closes, which is before React has committed the status change, so a synchronous assertion
        // here races the re-render and fails under load.
        expect(await screen.findByText(/Waiting for initialization/i)).toBeInTheDocument();

        screen.getByRole('button', { name: '' }).click();
        await waitFor(() => expect(sim.listenerCounts().console).toBe(1));
    });

    it('tears the socket down on unmount', async () => {
        const sim = defaultQServer();
        const { unmount } = renderConsole(sim);

        await waitFor(() => expect(sim.listenerCounts().console).toBe(1));
        unmount();
        await waitFor(() => expect(sim.listenerCounts().console).toBe(0));
    });
});
