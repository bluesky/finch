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

// The component reads Tiled through `useTiledSearchQuery`, so that is what gets stubbed — the
// TanStack result shape, not the underlying request. `TiledHooks.test.tsx` covers the hook itself
// against a stub client; here the only question is what this component does with the result.
vi.mock('@/api/tiled', () => ({
    useTiledSearchQuery: vi.fn(),
}));

// ── Imports (after mocks) ──────────────────────────────────────────────────────

import { useTiledSearchQuery } from '@/api/tiled';
import TiledLinePlotMaker from '../../features/TiledLinePlotMaker';

type SearchQueryResult = ReturnType<typeof useTiledSearchQuery>;

/** A resolved query holding one run item, or none. */
function loaded(id?: string, sample?: string) {
    const data = id
        ? {
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
          }
        : undefined;
    return { data, isError: false, error: null } as unknown as SearchQueryResult;
}

/** A rejected query. */
function failed(message: string) {
    return {
        data: undefined,
        isError: true,
        error: new Error(message),
    } as unknown as SearchQueryResult;
}

// ── Tests ───────────────────────────────────────────────────────────────────--

describe('TiledLinePlotMaker', () => {
    beforeEach(() => {
        vi.mocked(useTiledSearchQuery).mockReset();
        vi.mocked(useTiledSearchQuery).mockReturnValue(loaded());
    });

    it('renders the plot settings and data picker sections', () => {
        render(<TiledLinePlotMaker />);
        expect(screen.getByText('Plot Settings')).toBeInTheDocument();
        expect(screen.getByText('Data Picker')).toBeInTheDocument();
    });

    it('shows the empty-selection placeholder by default', () => {
        render(<TiledLinePlotMaker />);
        expect(screen.getByText('Select a data set...')).toBeInTheDocument();
    });

    it('defaults the x and y axis trace fields and forwards them to the plot', () => {
        render(<TiledLinePlotMaker />);
        const plot = screen.getByTestId('multi-scatter-plot');
        expect(plot).toHaveAttribute('data-x', 'seq_num');
        expect(plot).toHaveAttribute('data-y', 'time');
    });

    it('forwards the plot title from the title input', () => {
        render(<TiledLinePlotMaker />);
        fireEvent.change(screen.getByPlaceholderText('Plot title'), {
            target: { value: 'My Plot' },
        });
        expect(screen.getByTestId('multi-scatter-plot')).toHaveAttribute('data-title', 'My Plot');
    });

    it('updates the forwarded x axis column when the field changes', () => {
        render(<TiledLinePlotMaker />);
        const xInputs = screen.getAllByPlaceholderText('Column name');
        fireEvent.change(xInputs[0], { target: { value: 'new_x_column' } });
        expect(screen.getByTestId('multi-scatter-plot')).toHaveAttribute('data-x', 'new_x_column');
    });

    it('searches the root container for Bluesky runs, newest first', () => {
        render(<TiledLinePlotMaker />);
        const [searchPath, config] = vi.mocked(useTiledSearchQuery).mock.calls[0];
        expect(searchPath).toBe('');
        expect(config?.searchFilters?.specs).toEqual({ include: ['BlueskyRun'], exclude: [] });
        expect(config?.searchOptions?.sort).toBe('-');
    });

    it('renders run items returned by the Tiled search', async () => {
        vi.mocked(useTiledSearchQuery).mockReturnValue(loaded('run-abc-123', 'sampleX'));
        render(<TiledLinePlotMaker />);
        expect(await screen.findByText(/run-abc-123/)).toBeInTheDocument();
    });

    it('selects a run and forwards its id to the plot', async () => {
        vi.mocked(useTiledSearchQuery).mockReturnValue(loaded('run-abc-123', 'sampleX'));
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

    /**
     * A failed search is now shown, not logged.
     *
     * It used to be swallowed into `console.error`, which left the picker looking simply empty — the
     * same thing it looks like when the server legitimately has no runs.
     */
    it('shows the error when the Tiled search rejects', () => {
        vi.mocked(useTiledSearchQuery).mockReturnValue(failed('network down'));
        render(<TiledLinePlotMaker />);
        expect(screen.getByText(/Could not load runs: network down/)).toBeInTheDocument();
    });
});
