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
vi.mock('@/api/ophyd/useOphydPVSocket', () => ({
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
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
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
                exposureDevice={undefined as unknown as Device}
                handleStartAcquisition={noop}
                handleStopAcquisition={noop}
                handleSetExposure={noop}
            />,
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <HistogramDeviceController
                acquireDevice={undefined as unknown as Device}
                exposureDevice={undefined as unknown as Device}
                handleStartAcquisition={noop}
                handleStopAcquisition={noop}
                handleSetExposure={noop}
                className="my-controller"
            />,
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
            <Histogram
                arrayPV="test:array"
                acquirePV="test:acquire"
                exposurePV="test:exposure"
                demo
            />,
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the plot in demo mode', () => {
        render(
            <Histogram
                arrayPV="test:array"
                acquirePV="test:acquire"
                exposurePV="test:exposure"
                demo
            />,
        );
        expect(screen.getByTestId('plotly-plot')).toBeInTheDocument();
    });

    it('does not render device controller by default', () => {
        render(
            <Histogram
                arrayPV="test:array"
                acquirePV="test:acquire"
                exposurePV="test:exposure"
                demo
            />,
        );
        // HistogramDeviceController renders the "Start Acquire" button — should not be present
        expect(screen.queryByText('Start Acquire')).not.toBeInTheDocument();
    });

    it('renders device controller when showDeviceController is true', () => {
        render(
            <Histogram
                arrayPV="test:array"
                acquirePV="test:acquire"
                exposurePV="test:exposure"
                demo
                showDeviceController
            />,
        );
        expect(screen.getByText('Start Acquire')).toBeInTheDocument();
    });

    it('passes empty device list to socket hook in demo mode', () => {
        render(
            <Histogram
                arrayPV="test:array"
                acquirePV="test:acquire"
                exposurePV="test:exposure"
                demo
            />,
        );
        expect(useOphydPVSocket).toHaveBeenCalledWith([]);
    });

    it('passes PV names to socket hook when not in demo mode', () => {
        vi.mocked(useOphydPVSocket).mockReturnValue({
            devices: { 'test:array': { value: null } },
            handleSetValueRequest: mockHandleSetValueRequest,
        } as unknown as ReturnType<typeof useOphydPVSocket>);
        render(
            <Histogram arrayPV="test:array" acquirePV="test:acquire" exposurePV="test:exposure" />,
        );
        expect(useOphydPVSocket).toHaveBeenCalledWith([
            'test:array',
            'test:acquire',
            'test:exposure',
        ]);
    });

    it('shows placeholder when PV has no array data', () => {
        // All PVs must report connected for the plot (rather than the disconnect notice) to render.
        vi.mocked(useOphydPVSocket).mockReturnValue({
            devices: {
                'test:array': { connected: true, value: null },
                'test:acquire': { connected: true, value: 0 },
                'test:exposure': { connected: true, value: 1 },
            },
            handleSetValueRequest: mockHandleSetValueRequest,
        } as unknown as ReturnType<typeof useOphydPVSocket>);
        render(
            <Histogram arrayPV="test:array" acquirePV="test:acquire" exposurePV="test:exposure" />,
        );
        expect(screen.getByText(/Waiting for histogram array data/i)).toBeInTheDocument();
    });

    it('shows the disconnected warning instead of the plot when devices are not connected', () => {
        // Default beforeEach mock returns no devices, so none report connected.
        render(
            <Histogram arrayPV="test:array" acquirePV="test:acquire" exposurePV="test:exposure" />,
        );
        expect(
            screen.getByText('Error: Cannot display Histogram - Devices not connected'),
        ).toBeInTheDocument();
        // The plot should not render while devices are disconnected.
        expect(screen.queryByTestId('plotly-plot')).not.toBeInTheDocument();
    });

    it('lists the disconnected PV names in the warning', () => {
        vi.mocked(useOphydPVSocket).mockReturnValue({
            // array is connected; acquire and exposure are not.
            devices: {
                'test:array': { connected: true, value: null },
                'test:acquire': { connected: false },
            },
            handleSetValueRequest: mockHandleSetValueRequest,
        } as unknown as ReturnType<typeof useOphydPVSocket>);
        render(
            <Histogram arrayPV="test:array" acquirePV="test:acquire" exposurePV="test:exposure" />,
        );
        expect(
            screen.getByText('Error: Cannot display Histogram - Devices not connected'),
        ).toBeInTheDocument();
        // Only the unconnected PVs are listed; the connected one is not.
        expect(screen.getByText('test:acquire')).toBeInTheDocument();
        expect(screen.getByText('test:exposure')).toBeInTheDocument();
        expect(screen.queryByText('test:array')).not.toBeInTheDocument();
    });

    it('updates demo data after 1 second', async () => {
        vi.useFakeTimers();
        render(<Histogram arrayPV="" acquirePV="" exposurePV="" demo />);
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        expect(screen.getByTestId('plotly-plot')).toBeInTheDocument();
        vi.useRealTimers();
    });
});
