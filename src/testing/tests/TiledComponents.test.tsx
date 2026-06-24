import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('react-plotly.js', () => ({
    default: () => <div data-testid="plotly-plot" />,
}));

// useQuery is mocked so TiledScatterPlot never makes real network calls,
// both when tested directly and when rendered inside TiledWriterScatterPlot.
vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(),
}));

vi.mock('../../components/PlotlyScatter', () => ({
    default: ({ data }: { data?: { x?: unknown[] }[] }) => (
        <div data-testid="plotly-scatter" data-point-count={data?.[0]?.x?.length ?? 0} />
    ),
}));

vi.mock('../../components/PlotlyHeatmapTiled', () => ({
    default: ({ url }: { url?: string | null }) => (
        <div data-testid="plotly-heatmap-tiled" data-url={url ?? undefined} />
    ),
}));

// NOTE: TiledScatterPlot is NOT mocked here so it can be tested directly.
// The useQuery mock above prevents real network calls when TiledScatterPlot
// also renders as a child of TiledWriterScatterPlot.

vi.mock('../../components/Tiled/hooks/useTiledWriterDetImageHeatmap', () => ({
    useTiledWriterDetImageHeatmap: vi.fn(),
}));

vi.mock('../../components/Tiled/hooks/useTiledWriterScatterPlot', () => ({
    useTiledWriterScatterPlot: vi.fn(),
}));

vi.mock('../../components/Tiled/hooks/useTiledWriterMultiScatterPlot', () => ({
    useTiledWriterMultiScatterPlot: vi.fn(),
}));

// Capture the props TiledWriterMultiScatterPlot forwards to its child.
vi.mock('../../components/Tiled/TiledMultiScatterPlot', () => ({
    default: ({
        paths,
        popupMessage,
        shortPathNames,
        traceNames,
        title,
    }: {
        paths?: (string | null)[];
        popupMessage?: string;
        shortPathNames?: boolean;
        traceNames?: string[];
        title?: string;
    }) => (
        <div
            data-testid="multi-scatter-plot"
            data-paths={JSON.stringify(paths ?? [])}
            data-popup={popupMessage ?? ''}
            data-short-path-names={String(shortPathNames)}
            data-trace-names={JSON.stringify(traceNames ?? [])}
            data-title={title ?? ''}
        />
    ),
}));

// ── Imports (after mocks) ──────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import { useTiledWriterDetImageHeatmap } from '../../components/Tiled/hooks/useTiledWriterDetImageHeatmap';
import { useTiledWriterScatterPlot } from '../../components/Tiled/hooks/useTiledWriterScatterPlot';
import { useTiledWriterMultiScatterPlot } from '../../components/Tiled/hooks/useTiledWriterMultiScatterPlot';
import TiledScatterPlot from '../../components/Tiled/TiledScatterPlot';
import TiledWriterDetImageHeatmap from '../../components/Tiled/TiledWriterDetImageHeatmap';
import TiledWriterScatterPlot from '../../components/Tiled/TiledWriterScatterPlot';
import TiledWriterMultiScatterPlot from '../../components/Tiled/TiledWriterMultiScatterPlot';

const trace = { x: 'motor', y: 'detector' };

// ── TiledScatterPlot ──────────────────────────────────────────────────────────

describe('TiledScatterPlot', () => {
    beforeEach(() => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        } as unknown as ReturnType<typeof useQuery>);
    });

    it('shows waiting message when path is null', () => {
        render(<TiledScatterPlot tiledTrace={trace} path={null} />);
        expect(screen.getByText('No data path provided - waiting for data')).toBeInTheDocument();
    });

    it('shows loading message while fetching', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as unknown as ReturnType<typeof useQuery>);
        render(<TiledScatterPlot tiledTrace={trace} path="/some/path" />);
        expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('shows error message when query fails', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('timeout'),
        } as unknown as ReturnType<typeof useQuery>);
        render(<TiledScatterPlot tiledTrace={trace} path="/some/path" />);
        expect(screen.getByText('Error loading data: timeout')).toBeInTheDocument();
    });

    it('shows no data message when query returns undefined', () => {
        render(<TiledScatterPlot tiledTrace={trace} path="/some/path" />);
        expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('shows missing column error when columns are absent from data', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: { other_col: [1, 2] },
            isLoading: false,
            error: null,
        } as unknown as ReturnType<typeof useQuery>);
        render(<TiledScatterPlot tiledTrace={trace} path="/some/path" />);
        expect(
            screen.getByText('Error: Missing data for scatter plot (motor, detector)'),
        ).toBeInTheDocument();
    });

    it('shows data point count when data is ready', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: { motor: [1, 2, 3], detector: [4, 5, 6] },
            isLoading: false,
            error: null,
        } as unknown as ReturnType<typeof useQuery>);
        render(<TiledScatterPlot tiledTrace={trace} path="/some/path" />);
        expect(screen.getByText('Scatter plot data: 3 points')).toBeInTheDocument();
    });

    it('appends (Live) to status when enablePolling is true', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: { motor: [1, 2], detector: [3, 4] },
            isLoading: false,
            error: null,
        } as unknown as ReturnType<typeof useQuery>);
        render(<TiledScatterPlot tiledTrace={trace} path="/some/path" enablePolling />);
        expect(screen.getByText('Scatter plot data: 2 points (Live)')).toBeInTheDocument();
    });

    it('renders the PlotlyScatter component', () => {
        render(<TiledScatterPlot tiledTrace={trace} path={null} />);
        expect(screen.getByTestId('plotly-scatter')).toBeInTheDocument();
    });

    it('applies custom className to the container', () => {
        const { container } = render(
            <TiledScatterPlot tiledTrace={trace} path={null} className="my-class" />,
        );
        expect(container.firstChild).toHaveClass('my-class');
    });
});

// ── TiledWriterDetImageHeatmap ────────────────────────────────────────────────

describe('TiledWriterDetImageHeatmap', () => {
    beforeEach(() => {
        vi.mocked(useTiledWriterDetImageHeatmap).mockReturnValue({
            tiledPath: null,
            isLoading: false,
            error: null,
            enablePolling: false,
        });
    });

    it('shows loading message while hook is loading', () => {
        vi.mocked(useTiledWriterDetImageHeatmap).mockReturnValue({
            tiledPath: null,
            isLoading: true,
            error: null,
            enablePolling: false,
        });
        render(<TiledWriterDetImageHeatmap blueskyRunId="abc-123" />);
        expect(screen.getByText('Loading detector image for run abc-123...')).toBeInTheDocument();
    });

    it('shows error message when hook returns an error', () => {
        vi.mocked(useTiledWriterDetImageHeatmap).mockReturnValue({
            tiledPath: null,
            isLoading: false,
            error: 'Run not found',
            enablePolling: false,
        });
        render(<TiledWriterDetImageHeatmap blueskyRunId="abc-123" />);
        expect(screen.getByText('Error: Run not found')).toBeInTheDocument();
    });

    it('shows waiting message when blueskyRunId is null', () => {
        render(<TiledWriterDetImageHeatmap blueskyRunId={null} />);
        expect(screen.getByText('No run ID provided - waiting for data')).toBeInTheDocument();
    });

    it('shows no det_image message when tiledPath is null and run ID is set', () => {
        render(<TiledWriterDetImageHeatmap blueskyRunId="abc-123" />);
        expect(screen.getByText('No det_image found for run abc-123')).toBeInTheDocument();
    });

    it('shows complete status when tiledPath is set and polling is disabled', () => {
        vi.mocked(useTiledWriterDetImageHeatmap).mockReturnValue({
            tiledPath: '/some/path',
            isLoading: false,
            error: null,
            enablePolling: false,
        });
        render(<TiledWriterDetImageHeatmap blueskyRunId="abc-123" />);
        expect(
            screen.getByText('Det Image for run: abc-123 (Complete - polling disabled)'),
        ).toBeInTheDocument();
    });

    it('shows live status when tiledPath is set and polling is enabled', () => {
        vi.mocked(useTiledWriterDetImageHeatmap).mockReturnValue({
            tiledPath: '/some/path',
            isLoading: false,
            error: null,
            enablePolling: true,
        });
        render(<TiledWriterDetImageHeatmap blueskyRunId="abc-123" />);
        expect(
            screen.getByText('Det Image for run: abc-123 (Live - polling enabled)'),
        ).toBeInTheDocument();
    });

    it('renders the heatmap component', () => {
        render(<TiledWriterDetImageHeatmap blueskyRunId="abc-123" />);
        expect(screen.getByTestId('plotly-heatmap-tiled')).toBeInTheDocument();
    });

    it('passes tiledPath as url to heatmap', () => {
        vi.mocked(useTiledWriterDetImageHeatmap).mockReturnValue({
            tiledPath: '/tiled/path',
            isLoading: false,
            error: null,
            enablePolling: false,
        });
        render(<TiledWriterDetImageHeatmap blueskyRunId="abc-123" />);
        expect(screen.getByTestId('plotly-heatmap-tiled')).toHaveAttribute(
            'data-url',
            '/tiled/path',
        );
    });

    it('applies custom className to container', () => {
        const { container } = render(
            <TiledWriterDetImageHeatmap blueskyRunId="abc-123" className="my-class" />,
        );
        expect(container.firstChild).toHaveClass('my-class');
    });
});

// ── TiledWriterScatterPlot ────────────────────────────────────────────────────

describe('TiledWriterScatterPlot', () => {
    beforeEach(() => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        } as unknown as ReturnType<typeof useQuery>);
        vi.mocked(useTiledWriterScatterPlot).mockReturnValue({
            tiledPath: null,
            isLoading: false,
            error: null,
            enablePolling: false,
            startCompletionPolling: vi.fn(),
            stopCompletionPolling: vi.fn(),
        });
    });

    it('shows loading message while hook is loading', () => {
        vi.mocked(useTiledWriterScatterPlot).mockReturnValue({
            tiledPath: null,
            isLoading: true,
            error: null,
            enablePolling: false,
            startCompletionPolling: vi.fn(),
            stopCompletionPolling: vi.fn(),
        });
        render(<TiledWriterScatterPlot tiledTrace={trace} blueskyRunId="run-1" />);
        expect(screen.getByText('Loading Tiled data for run run-1...')).toBeInTheDocument();
    });

    it('shows error message when hook returns an error', () => {
        vi.mocked(useTiledWriterScatterPlot).mockReturnValue({
            tiledPath: null,
            isLoading: false,
            error: 'Waiting for run ID',
            enablePolling: false,
            startCompletionPolling: vi.fn(),
            stopCompletionPolling: vi.fn(),
        });
        render(<TiledWriterScatterPlot tiledTrace={trace} blueskyRunId="run-1" />);
        expect(screen.getByText('Error: Waiting for run ID')).toBeInTheDocument();
    });

    it('shows no path message when tiledPath is null', () => {
        render(<TiledWriterScatterPlot tiledTrace={trace} blueskyRunId="run-1" />);
        expect(screen.getByText('No data path found for run run-1')).toBeInTheDocument();
    });

    it('shows found path status with complete label', () => {
        vi.mocked(useTiledWriterScatterPlot).mockReturnValue({
            tiledPath: '/run/primary',
            isLoading: false,
            error: null,
            enablePolling: false,
            startCompletionPolling: vi.fn(),
            stopCompletionPolling: vi.fn(),
        });
        render(<TiledWriterScatterPlot tiledTrace={trace} blueskyRunId="run-1" />);
        expect(
            screen.getByText('Found Tiled path: /run/primary (Complete - polling disabled)'),
        ).toBeInTheDocument();
    });

    it('shows live label when polling is enabled', () => {
        vi.mocked(useTiledWriterScatterPlot).mockReturnValue({
            tiledPath: '/run/primary',
            isLoading: false,
            error: null,
            enablePolling: true,
            startCompletionPolling: vi.fn(),
            stopCompletionPolling: vi.fn(),
        });
        render(<TiledWriterScatterPlot tiledTrace={trace} blueskyRunId="run-1" />);
        expect(
            screen.getByText('Found Tiled path: /run/primary (Live - polling enabled)'),
        ).toBeInTheDocument();
    });

    it('hides status text when showStatusText is false', () => {
        render(
            <TiledWriterScatterPlot
                tiledTrace={trace}
                blueskyRunId="run-1"
                showStatusText={false}
            />,
        );
        expect(screen.queryByText('No data path found for run run-1')).not.toBeInTheDocument();
    });

    it('renders the scatter plot', () => {
        render(<TiledWriterScatterPlot tiledTrace={trace} blueskyRunId="run-1" />);
        expect(screen.getByTestId('plotly-scatter')).toBeInTheDocument();
    });

    it('forwards tiledPath to TiledScatterPlot — null path shows waiting message', () => {
        // When hook returns tiledPath=null, TiledScatterPlot receives path=null and shows this message
        render(<TiledWriterScatterPlot tiledTrace={trace} blueskyRunId="run-1" />);
        expect(screen.getByText('No data path provided - waiting for data')).toBeInTheDocument();
    });

    it('forwards tiledPath to TiledScatterPlot — resolved path triggers data fetch', () => {
        vi.mocked(useTiledWriterScatterPlot).mockReturnValue({
            tiledPath: '/run/primary',
            isLoading: false,
            error: null,
            enablePolling: false,
            startCompletionPolling: vi.fn(),
            stopCompletionPolling: vi.fn(),
        });
        render(<TiledWriterScatterPlot tiledTrace={trace} blueskyRunId="run-1" />);
        // TiledScatterPlot with a real path and no data shows "No data available" (not the null-path message)
        expect(screen.getByText('No data available')).toBeInTheDocument();
        expect(
            screen.queryByText('No data path provided - waiting for data'),
        ).not.toBeInTheDocument();
    });
});

// ── TiledWriterMultiScatterPlot ───────────────────────────────────────────────

describe('TiledWriterMultiScatterPlot', () => {
    beforeEach(() => {
        vi.mocked(useTiledWriterMultiScatterPlot).mockReturnValue({
            tiledPaths: [],
            isLoading: false,
            errors: [],
        });
    });

    it('renders the multi scatter plot', () => {
        render(<TiledWriterMultiScatterPlot tiledTrace={trace} blueskyRunIds={['run-1']} />);
        expect(screen.getByTestId('multi-scatter-plot')).toBeInTheDocument();
    });

    it('forwards resolved tiledPaths to the plot', () => {
        vi.mocked(useTiledWriterMultiScatterPlot).mockReturnValue({
            tiledPaths: ['/run-1/primary', null],
            isLoading: false,
            errors: [],
        });
        render(
            <TiledWriterMultiScatterPlot tiledTrace={trace} blueskyRunIds={['run-1', 'run-2']} />,
        );
        expect(screen.getByTestId('multi-scatter-plot')).toHaveAttribute(
            'data-paths',
            JSON.stringify(['/run-1/primary', null]),
        );
    });

    it('shows no popup message when there are no errors', () => {
        render(<TiledWriterMultiScatterPlot tiledTrace={trace} blueskyRunIds={['run-1']} />);
        expect(screen.getByTestId('multi-scatter-plot')).toHaveAttribute('data-popup', '');
    });

    it('passes an error popup message when the hook reports errors', () => {
        vi.mocked(useTiledWriterMultiScatterPlot).mockReturnValue({
            tiledPaths: [null],
            isLoading: false,
            errors: ['run not found'],
        });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        render(<TiledWriterMultiScatterPlot tiledTrace={trace} blueskyRunIds={['run-1']} />);
        expect(screen.getByTestId('multi-scatter-plot')).toHaveAttribute(
            'data-popup',
            'Error fetching data from Tiled server, check the console for more details',
        );
        errorSpy.mockRestore();
    });

    it('suppresses the error popup while still loading', () => {
        vi.mocked(useTiledWriterMultiScatterPlot).mockReturnValue({
            tiledPaths: [null],
            isLoading: true,
            errors: ['run not found'],
        });
        render(<TiledWriterMultiScatterPlot tiledTrace={trace} blueskyRunIds={['run-1']} />);
        expect(screen.getByTestId('multi-scatter-plot')).toHaveAttribute('data-popup', '');
    });

    it('enables shortPathNames when no traceNames are provided', () => {
        render(<TiledWriterMultiScatterPlot tiledTrace={trace} blueskyRunIds={['run-1']} />);
        expect(screen.getByTestId('multi-scatter-plot')).toHaveAttribute(
            'data-short-path-names',
            'true',
        );
    });

    it('disables shortPathNames and forwards explicit traceNames', () => {
        render(
            <TiledWriterMultiScatterPlot
                tiledTrace={trace}
                blueskyRunIds={['run-1']}
                traceNames={['Scan A']}
            />,
        );
        const plot = screen.getByTestId('multi-scatter-plot');
        expect(plot).toHaveAttribute('data-short-path-names', 'false');
        expect(plot).toHaveAttribute('data-trace-names', JSON.stringify(['Scan A']));
    });

    it('forwards the title to the plot', () => {
        render(
            <TiledWriterMultiScatterPlot
                tiledTrace={trace}
                blueskyRunIds={['run-1']}
                title="My Scans"
            />,
        );
        expect(screen.getByTestId('multi-scatter-plot')).toHaveAttribute('data-title', 'My Scans');
    });
});
