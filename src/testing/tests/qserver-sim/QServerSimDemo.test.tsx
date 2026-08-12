import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { QServerApiProvider } from '../../../api/qServerRuntime/QServerApiProvider';
import { createQServerSimClient } from '../../../lib/qserver-sim/client/QServerSimClient';
import type { QServerSim } from '../../../lib/qserver-sim/core/QServerSim';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';
import { emptyQServer } from '../../../lib/qserver-sim/scenarios/emptyQServer';
import QServerSimDemo from '../../../components/QServerSimDemo/QServerSimDemo';

/**
 * Renders the demo against the simulator through the real provider boundary, which is the
 * end-to-end check that `QServerApiProvider` + sim client + component actually compose.
 *
 * `pollIntervalMs: 0` keeps the component from polling; the tests refresh explicitly so nothing
 * depends on timing.
 */
function renderDemo(sim: QServerSim) {
    render(
        <QServerApiProvider client={createQServerSimClient(sim)}>
            <QServerSimDemo pollIntervalMs={0} />
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

        await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
        expect(screen.getByRole('option', { name: 'grid_scan' })).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Run plan' }));

        await waitFor(() => {
            expect(screen.getByText(/Queued and started count/)).toBeInTheDocument();
        });
        expect(sim.getState().running?.item.name).toBe('count');
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
});
