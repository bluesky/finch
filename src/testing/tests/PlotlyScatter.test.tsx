import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PlotlyScatter from '../../components/PlotlyScatter';

vi.mock('react-plotly.js', () => ({
    default: ({
        data,
        layout,
        config,
    }: {
        data: unknown;
        layout: Record<string, unknown>;
        config: Record<string, unknown>;
    }) => (
        <div
            data-testid="plotly-plot"
            data-trace-count={Array.isArray(data) ? data.length : 0}
            data-title={(layout?.title as string) ?? ''}
            data-config={JSON.stringify(config ?? {})}
        />
    ),
}));

const sampleTrace = [{ x: [1, 2], y: [3, 4], type: 'scatter' as const }];

describe('PlotlyScatter Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<PlotlyScatter data={sampleTrace} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the Plotly plot', () => {
        render(<PlotlyScatter data={sampleTrace} />);
        expect(screen.getByTestId('plotly-plot')).toBeInTheDocument();
    });

    it('renders with default sample data when no data prop is provided', () => {
        // @ts-expect-error intentionally omitting required prop to test default
        render(<PlotlyScatter />);
        expect(screen.getByTestId('plotly-plot')).toBeInTheDocument();
    });

    it('passes data traces to the plot', () => {
        const traces = [
            { x: [1], y: [2], type: 'scatter' as const },
            { x: [3], y: [4], type: 'scatter' as const },
        ];
        render(<PlotlyScatter data={traces} />);
        expect(screen.getByTestId('plotly-plot')).toHaveAttribute('data-trace-count', '2');
    });

    it('passes title to the plot layout', () => {
        render(<PlotlyScatter data={sampleTrace} title="My Chart" />);
        expect(screen.getByTestId('plotly-plot')).toHaveAttribute('data-title', 'My Chart');
    });

    it('defaults config to responsive when no config prop is provided', () => {
        render(<PlotlyScatter data={sampleTrace} />);
        const config = JSON.parse(
            screen.getByTestId('plotly-plot').getAttribute('data-config') ?? '{}',
        );
        expect(config).toEqual({ responsive: true });
    });

    it('passes config options through to the plot', () => {
        render(<PlotlyScatter data={sampleTrace} config={{ displayModeBar: false }} />);
        const config = JSON.parse(
            screen.getByTestId('plotly-plot').getAttribute('data-config') ?? '{}',
        );
        // User-provided options are merged on top of the responsive default.
        expect(config).toEqual({ responsive: true, displayModeBar: false });
    });

    it('lets the config prop override the responsive default', () => {
        render(<PlotlyScatter data={sampleTrace} config={{ responsive: false }} />);
        const config = JSON.parse(
            screen.getByTestId('plotly-plot').getAttribute('data-config') ?? '{}',
        );
        expect(config.responsive).toBe(false);
    });

    it('applies custom className to the container', () => {
        render(<PlotlyScatter data={sampleTrace} className="my-class" />);
        expect(screen.getByTestId('plotly-plot').parentElement).toHaveClass('my-class');
    });

    it('renders inside a div with rounded-lg and overflow-hidden', () => {
        render(<PlotlyScatter data={sampleTrace} />);
        const container = screen.getByTestId('plotly-plot').parentElement;
        expect(container).toHaveClass('rounded-lg');
        expect(container).toHaveClass('overflow-hidden');
    });
});
