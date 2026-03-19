import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('react-plotly.js', () => ({
    default: () => <div data-testid="plotly-plot" />,
}));

vi.mock('../../components/InputSliderRange', () => ({
    default: ({ label }: { label?: string }) => <div data-testid="input-slider-range">{label}</div>,
}));

const mockHandleSetValueRequest = vi.fn();
vi.mock('@/hooks/useOphydPVSocket', () => ({
    default: vi.fn(() => ({
        devices: {},
        handleSetValueRequest: mockHandleSetValueRequest,
    })),
}));

// ── Imports (after mocks) ──────────────────────────────────────────────────────

import HistogramPlot from '../../components/Histogram/HistogramPlot';
import HistogramPlotSettings from '../../components/Histogram/HistogramPlotSettings';
import HistogramDeviceController from '../../components/Histogram/HistogramDeviceController';
import Histogram from '../../components/Histogram/Histogram';
import useOphydPVSocket from '@/hooks/useOphydPVSocket';
import { Device } from '@/types/deviceControllerTypes';

// ── HistogramPlotSettings ──────────────────────────────────────────────────────

describe('HistogramPlotSettings', () => {
    it('renders without crashing', () => {
        const { container } = render(<HistogramPlotSettings />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<HistogramPlotSettings className="my-settings" />);
        expect(container.firstChild).toHaveClass('my-settings');
    });
});

// ── HistogramDeviceController ──────────────────────────────────────────────────

describe('HistogramDeviceController', () => {
    const noop = vi.fn();

    it('renders without crashing', () => {
        const { container } = render(
            <HistogramDeviceController
                acquireDevice={undefined as unknown as Device}
                handleStartAcquisition={noop}
                handleStopAcquisition={noop}
            />
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <HistogramDeviceController
                acquireDevice={undefined as unknown as Device}
                handleStartAcquisition={noop}
                handleStopAcquisition={noop}
                className="my-controller"
            />
        );
        expect(container.firstChild).toHaveClass('my-controller');
    });
});

// ── HistogramPlot ──────────────────────────────────────────────────────────────

describe('HistogramPlot', () => {
    it('shows placeholder when arrayData is null', () => {
        render(<HistogramPlot arrayData={null} />);
        expect(screen.getByText(/Waiting for histogram array data/i)).toBeInTheDocument();
    });

    it('renders the plot when arrayData is provided', () => {
        const data = Array.from({ length: 10 }, (_, i) => i * 10);
        render(<HistogramPlot arrayData={data} />);
        expect(screen.getByTestId('plotly-plot')).toBeInTheDocument();
    });

    it('displays the default title', () => {
        render(<HistogramPlot arrayData={null} />);
        expect(screen.getByText('Histogram')).toBeInTheDocument();
    });

    it('displays a custom title', () => {
        render(<HistogramPlot arrayData={null} title="My Histogram" />);
        expect(screen.getByText('My Histogram')).toBeInTheDocument();
    });

    it('shows total array element count', () => {
        const data = [1, 2, 3, 4, 5];
        render(<HistogramPlot arrayData={data} />);
        expect(screen.getByText(/Total Array Elements: 5/i)).toBeInTheDocument();
    });

    it('shows the ROI slider', () => {
        render(<HistogramPlot arrayData={[1, 2, 3]} />);
        expect(screen.getByTestId('input-slider-range')).toBeInTheDocument();
    });

    it('shows plot settings when showPlotSettings is true', () => {
        render(<HistogramPlot arrayData={null} showPlotSettings />);
        expect(screen.getByText(/Plot Settings/i)).toBeInTheDocument();
    });

    it('does not show plot settings by default', () => {
        render(<HistogramPlot arrayData={null} />);
        expect(screen.queryByText(/Plot Settings/i)).not.toBeInTheDocument();
    });
});

// ── Histogram ─────────────────────────────────────────────────────────────────

describe('Histogram', () => {
    beforeEach(() => {
        vi.mocked(useOphydPVSocket).mockReturnValue({
            devices: {},
            handleSetValueRequest: mockHandleSetValueRequest,
        } as unknown as ReturnType<typeof useOphydPVSocket>);
    });

    it('renders without crashing in demo mode', () => {
        const { container } = render(
            <Histogram arrayPV="test:array" acquirePV="test:acquire" demo />
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the plot in demo mode', () => {
        render(<Histogram arrayPV="test:array" acquirePV="test:acquire" demo />);
        expect(screen.getByTestId('plotly-plot')).toBeInTheDocument();
    });

    it('does not render device controller by default', () => {
        render(<Histogram arrayPV="test:array" acquirePV="test:acquire" demo />);
        // HistogramDeviceController renders "Title" — should not be present
        expect(screen.queryByText('Title')).not.toBeInTheDocument();
    });

    it('renders device controller when showDeviceController is true', () => {
        render(
            <Histogram arrayPV="test:array" acquirePV="test:acquire" demo showDeviceController />
        );
        expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('passes empty device list to socket hook in demo mode', () => {
        render(<Histogram arrayPV="test:array" acquirePV="test:acquire" demo />);
        expect(useOphydPVSocket).toHaveBeenCalledWith([]);
    });

    it('passes PV names to socket hook when not in demo mode', () => {
        vi.mocked(useOphydPVSocket).mockReturnValue({
            devices: { 'test:array': { value: null } },
            handleSetValueRequest: mockHandleSetValueRequest,
        } as unknown as ReturnType<typeof useOphydPVSocket>);
        render(<Histogram arrayPV="test:array" acquirePV="test:acquire" />);
        expect(useOphydPVSocket).toHaveBeenCalledWith(['test:array', 'test:acquire']);
    });

    it('shows placeholder when PV has no array data', () => {
        render(<Histogram arrayPV="test:array" acquirePV="test:acquire" />);
        expect(screen.getByText(/Waiting for histogram array data/i)).toBeInTheDocument();
    });

    it('updates demo data after 1 second', async () => {
        vi.useFakeTimers();
        render(<Histogram arrayPV="" acquirePV="" demo />);
        await act(async () => { vi.advanceTimersByTime(1000); });
        expect(screen.getByTestId('plotly-plot')).toBeInTheDocument();
        vi.useRealTimers();
    });
});
