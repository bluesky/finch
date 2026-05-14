import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PlotlyHeatmap from '../../components/PlotlyHeatmap';

vi.mock('react-plotly.js', () => ({
    default: () => <div data-testid="plotly-plot" />,
}));

const sampleArray = [
    [1, 2, 3],
    [4, 5, 6],
];

describe('PlotlyHeatmap Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<PlotlyHeatmap array={sampleArray} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the Plotly plot', () => {
        render(<PlotlyHeatmap array={sampleArray} />);
        expect(screen.getByTestId('plotly-plot')).toBeInTheDocument();
    });

    it('renders the title in the overlay', () => {
        render(<PlotlyHeatmap array={sampleArray} title="My Heatmap" />);
        expect(screen.getByText('My Heatmap')).toBeInTheDocument();
    });

    it('does not render log scale controls when enableLogScale is false', () => {
        render(<PlotlyHeatmap array={sampleArray} />);
        expect(screen.queryByText('Log Scale')).not.toBeInTheDocument();
        expect(screen.queryByText('Gamma Scale')).not.toBeInTheDocument();
    });

    it('renders log scale controls when enableLogScale is true', () => {
        render(<PlotlyHeatmap array={sampleArray} enableLogScale={true} />);
        expect(screen.getByText('Log Scale')).toBeInTheDocument();
        expect(screen.getByText('Gamma Scale')).toBeInTheDocument();
    });

    it('renders the scale range slider when enableLogScale is true', () => {
        render(<PlotlyHeatmap array={sampleArray} enableLogScale={true} />);
        expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('clicking Gamma Scale button switches scale type', () => {
        render(<PlotlyHeatmap array={sampleArray} enableLogScale={true} />);
        const gammaButton = screen.getByText('Gamma Scale');
        fireEvent.click(gammaButton);
        expect(gammaButton).toHaveClass('border-b-sky-800');
    });

    it('clicking Log Scale button switches back to log mode', () => {
        render(<PlotlyHeatmap array={sampleArray} enableLogScale={true} />);
        fireEvent.click(screen.getByText('Gamma Scale'));
        fireEvent.click(screen.getByText('Log Scale'));
        expect(screen.getByText('Log Scale')).toHaveClass('border-b-sky-800');
    });

    it('slider resets to 0 when scale type changes', () => {
        render(<PlotlyHeatmap array={sampleArray} enableLogScale={true} />);
        const slider = screen.getByRole('slider') as HTMLInputElement;
        fireEvent.change(slider, { target: { value: '5' } });
        fireEvent.click(screen.getByText('Gamma Scale'));
        expect(slider.value).toBe('0');
    });

    it('applies a custom className', () => {
        render(<PlotlyHeatmap array={sampleArray} className="my-class" />);
        expect(screen.getByTestId('plotly-plot').closest('.my-class')).toBeInTheDocument();
    });
});
