import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Capture the props TiledLinePlotMaker forwards to the plot.
vi.mock('@/components/Tiled/TiledWriterMultiScatterPlot', () => ({
    default: ({
        tiledTrace,
        blueskyRunIds,
        traceNames,
        title,
    }: {
        tiledTrace?: { x?: string; y?: string };
        blueskyRunIds?: string[];
        traceNames?: string[];
        title?: string;
    }) => (
        <div
            data-testid="multi-scatter-plot"
            data-x={tiledTrace?.x ?? ''}
            data-y={tiledTrace?.y ?? ''}
            data-runids={JSON.stringify(blueskyRunIds ?? [])}
            data-trace-names={JSON.stringify(traceNames ?? [])}
            data-title={title ?? ''}
        />
    ),
}));

// react-tooltip pulls in browser APIs that aren't needed for these tests.
vi.mock('react-tooltip', () => ({
    Tooltip: () => <div data-testid="tooltip" />,
}));

vi.mock('@blueskyproject/tiled', () => ({
    getSearchResults: vi.fn(() => Promise.resolve(null)),
}));

// ── Imports (after mocks) ──────────────────────────────────────────────────────

import { getSearchResults } from '@blueskyproject/tiled';
import TiledLinePlotMaker from '../../features/TiledLinePlotMaker';

// Builds a minimal search result with one run item.
function makeSearchResult(id: string, sample?: string) {
    return {
        data: [
            {
                id,
                attributes: {
                    metadata: {
                        start: { time: 1700000000, sample },
                        stop: { exit_status: 'success' },
                    },
                },
            },
        ],
    } as unknown as Awaited<ReturnType<typeof getSearchResults>>;
}

// ── Tests ───────────────────────────────────────────────────────────────────--

describe('TiledLinePlotMaker', () => {
    beforeEach(() => {
        vi.mocked(getSearchResults).mockReset();
        vi.mocked(getSearchResults).mockResolvedValue(null);
    });

    it('renders the plot settings and data picker sections', async () => {
        render(<TiledLinePlotMaker />);
        await waitFor(() => expect(getSearchResults).toHaveBeenCalled());
        expect(screen.getByText('Plot Settings')).toBeInTheDocument();
        expect(screen.getByText('Data Picker')).toBeInTheDocument();
    });

    it('shows the empty-selection placeholder by default', async () => {
        render(<TiledLinePlotMaker />);
        await waitFor(() => expect(getSearchResults).toHaveBeenCalled());
        expect(screen.getByText('Select a data set...')).toBeInTheDocument();
    });

    it('defaults the x and y axis trace fields and forwards them to the plot', async () => {
        render(<TiledLinePlotMaker />);
        await waitFor(() => expect(getSearchResults).toHaveBeenCalled());
        const plot = screen.getByTestId('multi-scatter-plot');
        expect(plot).toHaveAttribute('data-x', 'mono_energy_energy_eV');
        expect(plot).toHaveAttribute('data-y', 'amptek_fluo_roi_sum');
    });

    it('forwards the plot title from the title input', async () => {
        render(<TiledLinePlotMaker />);
        await waitFor(() => expect(getSearchResults).toHaveBeenCalled());
        fireEvent.change(screen.getByPlaceholderText('Plot title'), {
            target: { value: 'My Plot' },
        });
        expect(screen.getByTestId('multi-scatter-plot')).toHaveAttribute('data-title', 'My Plot');
    });

    it('updates the forwarded x axis column when the field changes', async () => {
        render(<TiledLinePlotMaker />);
        await waitFor(() => expect(getSearchResults).toHaveBeenCalled());
        const xInputs = screen.getAllByPlaceholderText('Column name');
        fireEvent.change(xInputs[0], { target: { value: 'new_x_column' } });
        expect(screen.getByTestId('multi-scatter-plot')).toHaveAttribute('data-x', 'new_x_column');
    });

    it('renders run items returned by the Tiled search', async () => {
        vi.mocked(getSearchResults).mockResolvedValue(makeSearchResult('run-abc-123', 'sampleX'));
        render(<TiledLinePlotMaker />);
        expect(await screen.findByText(/run-abc-123/)).toBeInTheDocument();
    });

    it('selects a run and forwards its id to the plot', async () => {
        vi.mocked(getSearchResults).mockResolvedValue(makeSearchResult('run-abc-123', 'sampleX'));
        render(<TiledLinePlotMaker />);
        const item = await screen.findByText(/run-abc-123/);
        fireEvent.click(item);
        await waitFor(() => {
            expect(screen.getByTestId('multi-scatter-plot')).toHaveAttribute(
                'data-runids',
                JSON.stringify(['run-abc-123']),
            );
        });
        // The placeholder disappears once a run is selected.
        expect(screen.queryByText('Select a data set...')).not.toBeInTheDocument();
    });

    it('logs an error when the Tiled search rejects', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.mocked(getSearchResults).mockRejectedValue(new Error('network down'));
        render(<TiledLinePlotMaker />);
        await waitFor(() => {
            expect(errorSpy).toHaveBeenCalledWith(
                'Error fetching ExperimentHistory data:',
                expect.any(Error),
            );
        });
        errorSpy.mockRestore();
    });
});
