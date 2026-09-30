import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { QServerApiProvider } from '../../../api/qServerRuntime/QServerApiProvider';
import { createQServerSimClient } from '../../../lib/qserver-sim/client/QServerSimClient';
import { createQServerSimSocketFactory } from '../../../lib/qserver-sim/sockets/createQServerSimSocketFactory';
import type { QServerSim } from '../../../lib/qserver-sim/core/QServerSim';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';
import { emptyQServer } from '../../../lib/qserver-sim/scenarios/emptyQServer';
import QServerSimDemo from '../../../components/QServerSimDemo/QServerSimDemo';
import QServerSimDocDemo from '../../../stories/demos/QServerSimDocDemo';

/**
 * Renders the demo against the simulator through the real provider boundary, which is the
 * end-to-end check that `QServerApiProvider` + sim client + component actually compose.
 *
 * `pollIntervalMs: 0` keeps the component from polling; the tests refresh explicitly so nothing
 * depends on timing. The console panel is off unless a test asks for it, because without a
 * simulated socket factory it would open a real websocket from jsdom.
 */
function renderDemo(sim: QServerSim, { showConsole = false, withSocketFactory = true } = {}) {
    render(
        <QServerApiProvider
            client={createQServerSimClient(sim)}
            socketFactory={
                showConsole && withSocketFactory ? createQServerSimSocketFactory(sim) : undefined
            }
        >
            <QServerSimDemo pollIntervalMs={0} showConsole={showConsole} />
        </QServerApiProvider>,
    );
}

describe('QServerSimDemo', () => {
    it('lists the queue and history from the simulator', async () => {
        renderDemo(defaultQServer());

        await waitFor(() => {
            expect(screen.getByTestId('qserver-sim-demo-queue')).toBeInTheDocument();
        });

        const queue = within(screen.getByTestId('qserver-sim-demo-queue'));
        expect(queue.getByText('count')).toBeInTheDocument();
        expect(queue.getByText('scan')).toBeInTheDocument();
        expect(queue.getByText('grid_scan')).toBeInTheDocument();

        const history = within(screen.getByTestId('qserver-sim-demo-history'));
        expect(history.getAllByText('completed')).toHaveLength(2);

        expect(screen.getByText(/manager idle/)).toBeInTheDocument();
        expect(screen.getByText(/queued 3/)).toBeInTheDocument();
    });

    it('offers the simulator plans and runs the selected one', async () => {
        const sim = defaultQServer();
        renderDemo(sim);

        // Wait for the catalog itself, not just the empty select.
        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'grid_scan' })).toBeInTheDocument(),
        );

        await userEvent.click(screen.getByRole('button', { name: 'Run plan' }));

        await waitFor(() => {
            expect(screen.getByText(/Queued and started count/)).toBeInTheDocument();
        });
        expect(sim.getState().running?.item.name).toBe('count');
    });

    it('adds a plan to the queue without starting it', async () => {
        const sim = defaultQServer();
        renderDemo(sim);

        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'grid_scan' })).toBeInTheDocument(),
        );
        await userEvent.selectOptions(screen.getByRole('combobox'), 'grid_scan');
        await userEvent.click(screen.getByRole('button', { name: 'Add plan' }));

        await waitFor(() =>
            expect(
                screen.getByText(/Added grid_scan to the queue \(4 queued\)/),
            ).toBeInTheDocument(),
        );
        expect(sim.getStatus().items_in_queue).toBe(4);
        // Queued only — nothing started.
        expect(sim.getState().running).toBeNull();
        expect(sim.getStatus().manager_state).toBe('idle');
    });

    it('reports why a plan cannot start with the environment closed', async () => {
        const sim = emptyQServer();
        renderDemo(sim);

        await waitFor(() => expect(screen.getByRole('button', { name: 'Run plan' })).toBeEnabled());
        await userEvent.click(screen.getByRole('button', { name: 'Run plan' }));

        await waitFor(() => {
            expect(screen.getByText(/did not start/)).toBeInTheDocument();
        });
        // The item is queued even though the queue could not start.
        expect(sim.getStatus().items_in_queue).toBe(1);
        expect(sim.getState().running).toBeNull();
    });

    it('shows a plan moving from the queue to history', async () => {
        const sim = defaultQServer();
        renderDemo(sim);

        await waitFor(() => expect(screen.getByText(/queued 3/)).toBeInTheDocument());

        sim.startQueue();
        sim.advance(sim.getBehavior().runDurationMs);

        await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));

        await waitFor(() => {
            const history = within(screen.getByTestId('qserver-sim-demo-history'));
            expect(history.getAllByText('completed')).toHaveLength(3);
        });
        expect(screen.getByText(/Running/)).toBeInTheDocument();
    });

    it('opens the environment on request', async () => {
        const sim = emptyQServer();
        renderDemo(sim);

        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Open environment' })).toBeEnabled(),
        );
        await userEvent.click(screen.getByRole('button', { name: 'Open environment' }));

        await waitFor(() => expect(screen.getByText(/env idle/)).toBeInTheDocument());
        expect(sim.getStatus().worker_environment_exists).toBe(true);
    });

    it('adds a close-environment control that shuts the worker down', async () => {
        const sim = defaultQServer();
        renderDemo(sim);

        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Close environment' })).toBeEnabled(),
        );
        await userEvent.click(screen.getByRole('button', { name: 'Close environment' }));

        await waitFor(() => expect(screen.getByText(/env closed/)).toBeInTheDocument());
        expect(sim.getStatus().worker_environment_exists).toBe(false);
        expect(sim.getStatus().re_state).toBeNull();
    });

    it('refuses to close the environment while a plan is running', async () => {
        const sim = defaultQServer();
        sim.startQueue();
        renderDemo(sim);

        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Close environment' })).toBeEnabled(),
        );
        await userEvent.click(screen.getByRole('button', { name: 'Close environment' }));

        await waitFor(() =>
            expect(screen.getByText(/Close environment failed/)).toBeInTheDocument(),
        );
        expect(sim.getStatus().worker_environment_exists).toBe(true);
    });

    it('streams console output over the simulated websocket', async () => {
        const sim = defaultQServer();
        renderDemo(sim, { showConsole: true });

        const panel = await waitFor(() => screen.getByTestId('qserver-console-output'));
        await waitFor(() => expect(within(panel).getByText(/open/)).toBeInTheDocument());

        sim.startQueue();

        await waitFor(() => {
            expect(within(panel).getByText(/Starting queue processing/)).toBeInTheDocument();
        });
        // The bracket prefix is rendered separately from the message body.
        expect(within(panel).getAllByText(/bluesky_queueserver\.manager/).length).toBeGreaterThan(
            0,
        );
        expect(within(panel).getByText(/New stream: 'primary'/)).toBeInTheDocument();
    });

    it('says so when the socket never connects, instead of looking merely quiet', async () => {
        // No socket factory: the hook opens a real websocket, which goes nowhere in jsdom.
        renderDemo(defaultQServer(), { showConsole: true, withSocketFactory: false });

        const panel = await waitFor(() => screen.getByTestId('qserver-console-output'));
        await waitFor(() =>
            expect(
                within(panel).getByText(/no console output yet|connection failed/),
            ).toBeInTheDocument(),
        );
        expect(within(panel).queryByText(/connected — waiting/)).not.toBeInTheDocument();
    });
});

/**
 * Guards the documentation page's live demo.
 *
 * It is easy to build a provider without a socket factory — which is exactly what happened once —
 * and the symptom is a console panel that looks quiet rather than broken.
 */
describe('QServerSimDocDemo', () => {
    it('connects its console and shows the environment startup narration', async () => {
        render(<QServerSimDocDemo />);

        const panel = await waitFor(() => screen.getByTestId('qserver-console-output'));
        await waitFor(() => expect(within(panel).getByText(/· open ·/)).toBeInTheDocument());
        await waitFor(() =>
            expect(within(panel).getByText(/RE Environment is ready/)).toBeInTheDocument(),
        );
    });

    it('offers the plans from its own custom beamline catalog', async () => {
        render(<QServerSimDocDemo />);
        await waitFor(() =>
            expect(screen.getByRole('option', { name: 'xafs_scan' })).toBeInTheDocument(),
        );
    });
});
