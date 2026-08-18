import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import Experiment from '../../../components/Experiment/Experiment';
import { QServerApiProvider } from '../../../api/qServerRuntime/QServerApiProvider';
import { createQServerSimClient } from '../../../lib/qserver-sim/client/QServerSimClient';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';
import type { QServerSim } from '../../../lib/qserver-sim/core/QServerSim';

/**
 * The generic `Experiment` panel against the simulator.
 *
 * Tiled is not simulated, so the plot and the history table are stubbed out — what is under test here
 * is the queue-server half: reading `plans_allowed` / `devices_allowed`, generating a form from the
 * selected plan's parameter metadata, and executing it.
 */
vi.mock('@/components/Tiled/TiledWriterScatterPlot', () => ({
    default: ({ tiledTrace }: { tiledTrace: { x: string; y: string } }) => (
        <div data-testid="scatter-plot" data-x={tiledTrace.x} data-y={tiledTrace.y} />
    ),
}));

vi.mock('@/components/Experiment/ExperimentHistory', () => ({
    default: () => <div data-testid="history" />,
}));

function renderExperiment(sim: QServerSim) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <QServerApiProvider client={createQServerSimClient(sim)}>{children}</QServerApiProvider>
        </QueryClientProvider>
    );
    return render(<Experiment />, { wrapper });
}

beforeEach(() => {
    vi.clearAllMocks();
});

/** The text input inside the field whose label reads `label`. */
function fieldInput(label: string): HTMLElement {
    const field = screen.getByText(label).closest('div');
    return within(field as HTMLElement).getByRole('textbox');
}

/**
 * Pick a device from one of the two device widgets.
 *
 * A multi-device parameter renders a text input that opens its list on focus; a single-device one
 * renders a clickable row instead. Both then show the options as list items.
 */
async function pickDevice(label: string, device: string) {
    const field = screen.getByText(label).closest('div') as HTMLElement;
    const textbox = within(field).queryByRole('textbox');
    if (textbox) {
        // Multi-device parameter: the list opens when the input takes focus.
        await userEvent.click(textbox);
    } else {
        // Single-device parameter: the handler sits on the row below the label, not on the
        // container, so clicking the container itself does nothing.
        const rows = Array.from(field.children).filter((child) => child.tagName === 'DIV');
        await userEvent.click(rows[rows.length - 1]);
    }
    await userEvent.click(await within(field).findByText(device));
}

describe('Experiment against the simulator', () => {
    it('lists the plans the queue server allows, alphabetically', async () => {
        const sim = defaultQServer();
        renderExperiment(sim);

        const select = await screen.findByLabelText('Plan:');
        await waitFor(() =>
            expect(within(select).getAllByRole('option').length).toBeGreaterThan(1),
        );

        const options = within(select)
            .getAllByRole('option')
            .map((option) => option.textContent);
        expect(options).toEqual([...options].sort());
        expect(options).toContain('count');
        expect(options).toContain('scan');
    });

    it('generates a form from the selected plan, and switches it when the plan changes', async () => {
        const sim = defaultQServer();
        renderExperiment(sim);

        // `count` is first alphabetically, so it is selected on load: detectors, num, delay, md.
        // `detectors` has no default in the plan signature and so is required; the rest have one.
        await waitFor(() => expect(screen.getByText('detectors (required)')).toBeInTheDocument());
        expect(screen.getByText('num (optional)')).toBeInTheDocument();
        expect(screen.getByText('delay (optional)')).toBeInTheDocument();
        expect(screen.queryByText('motor (required)')).not.toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText('Plan:'), 'scan');

        // `scan` has motor/start/stop, which `count` does not.
        await waitFor(() => expect(screen.getByText('motor (required)')).toBeInTheDocument());
        expect(screen.getByText('start (required)')).toBeInTheDocument();
        expect(screen.getByText('stop (required)')).toBeInTheDocument();
        expect(screen.queryByText('delay (optional)')).not.toBeInTheDocument();
    });

    it('keeps execute disabled until every required parameter has a value', async () => {
        const sim = defaultQServer();
        renderExperiment(sim);

        await waitFor(() => expect(screen.getByText('detectors (required)')).toBeInTheDocument());

        // `detectors` has no default in the plan signature, so it is required.
        const execute = screen.getByRole('button', { name: /Execute count Plan/i });
        expect(execute).toBeDisabled();
        expect(screen.getByText(/Fill in every required parameter/i)).toBeInTheDocument();
    });

    it('executes the selected plan with the kwargs from the form', async () => {
        const sim = defaultQServer();
        renderExperiment(sim);

        await waitFor(() => expect(screen.getByText('detectors (required)')).toBeInTheDocument());

        // Pick a detector — the one required parameter of `count`. The multi-select opens its list on
        // focus, so this is the same sequence a user performs.
        await pickDevice('detectors (required)', 'det1');

        const execute = await screen.findByRole('button', { name: /Execute count Plan/i });
        await waitFor(() => expect(execute).toBeEnabled());
        await userEvent.click(execute);

        await waitFor(() => {
            const running = sim.getState().running?.item;
            expect(running?.name).toBe('count');
            expect(running?.kwargs?.detectors).toEqual(['det1']);
        });
    });

    it('accepts numeric required parameters, which TextInput reports as numbers', async () => {
        const sim = defaultQServer();
        renderExperiment(sim);

        await waitFor(() =>
            expect(
                within(screen.getByLabelText('Plan:')).getByRole('option', { name: 'scan' }),
            ).toBeInTheDocument(),
        );
        await userEvent.selectOptions(screen.getByLabelText('Plan:'), 'scan');
        await waitFor(() => expect(screen.getByText('start (required)')).toBeInTheDocument());

        // detectors, motor, start and stop are all required for `scan`.
        await pickDevice('detectors (required)', 'det1');
        await pickDevice('motor (required)', 'motor1');
        // `start` and `stop` are in TextInput's float list, so these arrive as numbers, not strings —
        // and a length check on a number reads every value as missing. `0` has to count too.
        await userEvent.type(fieldInput('start (required)'), '0');
        await userEvent.type(fieldInput('stop (required)'), '5');

        const execute = await screen.findByRole('button', { name: /Execute scan Plan/i });
        await waitFor(() => expect(execute).toBeEnabled());
        expect(screen.queryByText(/Fill in every required parameter/i)).not.toBeInTheDocument();

        await userEvent.click(execute);
        await waitFor(() => {
            const running = sim.getState().running?.item;
            expect(running?.name).toBe('scan');
            expect(running?.kwargs?.start).toBe(0);
            expect(running?.kwargs?.stop).toBe(5);
        });
    });

    it('treats a half-typed number as no value at all', async () => {
        const sim = defaultQServer();
        renderExperiment(sim);

        await waitFor(() =>
            expect(
                within(screen.getByLabelText('Plan:')).getByRole('option', { name: 'scan' }),
            ).toBeInTheDocument(),
        );
        await userEvent.selectOptions(screen.getByLabelText('Plan:'), 'scan');
        await waitFor(() => expect(screen.getByText('start (required)')).toBeInTheDocument());

        await pickDevice('detectors (required)', 'det1');
        await pickDevice('motor (required)', 'motor1');
        await userEvent.type(fieldInput('start (required)'), '1');
        // A lone minus sign parses to NaN, which must not pass as a value — nor be sent as JSON null.
        await userEvent.type(fieldInput('stop (required)'), '-');

        const execute = await screen.findByRole('button', { name: /Execute scan Plan/i });
        await waitFor(() => expect(execute).toBeDisabled());
    });

    it('plots seq_num against time by default, and follows the axis inputs', async () => {
        const sim = defaultQServer();
        renderExperiment(sim);

        const plot = await screen.findByTestId('scatter-plot');
        expect(plot).toHaveAttribute('data-x', 'seq_num');
        expect(plot).toHaveAttribute('data-y', 'time');

        const xInput = screen.getByLabelText('X axis column:');
        await userEvent.clear(xInput);
        await userEvent.type(xInput, 'motor');

        await waitFor(() =>
            expect(screen.getByTestId('scatter-plot')).toHaveAttribute('data-x', 'motor'),
        );

        await userEvent.click(screen.getByRole('button', { name: /reset axes/i }));
        await waitFor(() =>
            expect(screen.getByTestId('scatter-plot')).toHaveAttribute('data-x', 'seq_num'),
        );
    });
});
