import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SignalMonitorPlotDevice from '../../components/SignalMonitorPlotDevice';
import SignalMonitorPlotPV from '../../components/SignalMonitorPlotPV';
import SignalMonitorPlotOphyd from '../../components/SignalMonitorPlotOphyd';
import type { PlotlyScatterProps } from '../../components/PlotlyScatter';

// Capture props forwarded to PlotlyScatter
const ScatterMock = vi.fn(({ xAxisTitle, yAxisTitle }: PlotlyScatterProps) => (
    <div
        data-testid="plotly-scatter"
        data-x-title={xAxisTitle ?? ''}
        data-y-title={yAxisTitle ?? ''}
    />
));

vi.mock('../../components/PlotlyScatter', () => ({
    default: (props: unknown) => ScatterMock(props as PlotlyScatterProps),
}));

vi.mock('@/api/ophyd/useOphydPVSocket', () => ({ default: vi.fn() }));
vi.mock('@/api/ophyd/useOphydDeviceSocket', () => ({ default: vi.fn() }));

import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import useOphydDeviceSocket from '@/api/ophyd/useOphydDeviceSocket';

const makeDevice = (value: number, units = 'counts') => ({ value, units, connected: true });

beforeEach(() => {
    ScatterMock.mockClear();
    vi.useFakeTimers();
    vi.mocked(useOphydPVSocket).mockReturnValue({ devices: {} } as unknown as ReturnType<
        typeof useOphydPVSocket
    >);
    vi.mocked(useOphydDeviceSocket).mockReturnValue({ devices: {} } as unknown as ReturnType<
        typeof useOphydDeviceSocket
    >);
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

// ─── SignalMonitorPlotDevice ──────────────────────────────────────────────────

describe('SignalMonitorPlotDevice', () => {
    it('renders without crashing', () => {
        const { container } = render(
            <SignalMonitorPlotDevice device={null} deviceLabel="PV:TEST" demo />,
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders PlotlyScatter', () => {
        render(<SignalMonitorPlotDevice device={null} deviceLabel="PV:TEST" demo />);
        expect(screen.getByTestId('plotly-scatter')).toBeInTheDocument();
    });

    it('passes deviceLabel as xAxisTitle to PlotlyScatter', () => {
        render(<SignalMonitorPlotDevice device={null} deviceLabel="MY:LABEL" demo />);
        expect(screen.getByTestId('plotly-scatter')).toHaveAttribute('data-x-title', 'MY:LABEL');
    });

    it('applies className to the wrapper div', () => {
        const { container } = render(
            <SignalMonitorPlotDevice device={null} deviceLabel="PV" demo className="my-class" />,
        );
        expect(container.firstChild).toHaveClass('my-class');
    });

    // --- Value display overlay ---

    it('shows current numeric value in overlay', () => {
        render(<SignalMonitorPlotDevice device={{ value: 12.345 }} deviceLabel="PV" />);
        expect(screen.getByText('12.345')).toBeInTheDocument();
    });

    it('shows units in overlay when device has units', () => {
        render(<SignalMonitorPlotDevice device={{ value: 42, units: 'mm' }} deviceLabel="PV" />);
        expect(screen.getByText('mm')).toBeInTheDocument();
    });

    it('shows N/A when device is null', () => {
        render(<SignalMonitorPlotDevice device={null} deviceLabel="PV" />);
        expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('shows N/A when device is undefined', () => {
        render(<SignalMonitorPlotDevice device={undefined} deviceLabel="PV" />);
        expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('rounds numeric value to 5 significant figures', () => {
        render(<SignalMonitorPlotDevice device={{ value: 1.23456789 }} deviceLabel="PV" />);
        expect(screen.getByText('1.2346')).toBeInTheDocument();
    });

    it('strips trailing zeros from numeric value', () => {
        render(<SignalMonitorPlotDevice device={{ value: 100.0 }} deviceLabel="PV" />);
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    // --- yAxisTitle ---

    it('passes yAxisTitle prop to PlotlyScatter when provided', () => {
        render(
            <SignalMonitorPlotDevice
                device={{ value: 42, units: 'mm' }}
                deviceLabel="PV"
                yAxisTitle="Distance"
            />,
        );
        expect(screen.getByTestId('plotly-scatter')).toHaveAttribute('data-y-title', 'Distance');
    });

    it('falls back to device units for yAxisTitle when prop is omitted', () => {
        render(<SignalMonitorPlotDevice device={{ value: 42, units: 'mm' }} deviceLabel="PV" />);
        expect(screen.getByTestId('plotly-scatter')).toHaveAttribute('data-y-title', 'mm');
    });

    // --- Demo mode timer ---

    it('accumulates data points over time in demo mode', () => {
        render(
            <SignalMonitorPlotDevice
                device={null}
                deviceLabel="PV"
                demo
                pollingIntervalMilliseconds={1000}
            />,
        );
        const callsBefore = ScatterMock.mock.calls.length;
        act(() => {
            vi.advanceTimersByTime(3000);
        });
        expect(ScatterMock.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it('does not exceed numVisiblePoints in demo mode', () => {
        const numVisiblePoints = 5;
        render(
            <SignalMonitorPlotDevice
                device={null}
                deviceLabel="PV"
                demo
                pollingIntervalMilliseconds={100}
                numVisiblePoints={numVisiblePoints}
            />,
        );
        act(() => {
            vi.advanceTimersByTime(2000);
        });
        const lastCall = ScatterMock.mock.calls[ScatterMock.mock.calls.length - 1][0];
        expect((lastCall.data[0] as { x: unknown[] }).x.length).toBeLessThanOrEqual(
            numVisiblePoints,
        );
    });

    // --- Live mode ---

    it('renders without crashing when device is not yet available', () => {
        render(<SignalMonitorPlotDevice device={null} deviceLabel="PV" />);
        expect(screen.getByTestId('plotly-scatter')).toBeInTheDocument();
    });

    it('does not record data points when device value is non-numeric', () => {
        render(
            <SignalMonitorPlotDevice
                device={{ value: 'not-a-number' }}
                deviceLabel="PV"
                pollingIntervalMilliseconds={500}
            />,
        );
        const callsBefore = ScatterMock.mock.calls.length;
        act(() => {
            vi.advanceTimersByTime(1500);
        });
        expect(ScatterMock.mock.calls.length).toBe(callsBefore);
    });
});

// ─── SignalMonitorPlotPV ──────────────────────────────────────────────────────

describe('SignalMonitorPlotPV', () => {
    it('renders without crashing', () => {
        const { container } = render(<SignalMonitorPlotPV pv="TEST:PV" demo />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('passes pv as deviceLabel (xAxisTitle) to PlotlyScatter', () => {
        render(<SignalMonitorPlotPV pv="TEST:PV:1" demo />);
        expect(screen.getByTestId('plotly-scatter')).toHaveAttribute('data-x-title', 'TEST:PV:1');
    });

    it('passes yAxisTitle prop through to PlotlyScatter', () => {
        vi.mocked(useOphydPVSocket).mockReturnValue({
            devices: { 'TEST:PV': makeDevice(99, 'deg') },
        } as unknown as ReturnType<typeof useOphydPVSocket>);
        render(<SignalMonitorPlotPV pv="TEST:PV" yAxisTitle="Angle" />);
        expect(screen.getByTestId('plotly-scatter')).toHaveAttribute('data-y-title', 'Angle');
    });

    it('falls back to device units for yAxisTitle when prop is omitted', () => {
        vi.mocked(useOphydPVSocket).mockReturnValue({
            devices: { 'TEST:PV': makeDevice(99, 'deg') },
        } as unknown as ReturnType<typeof useOphydPVSocket>);
        render(<SignalMonitorPlotPV pv="TEST:PV" />);
        expect(screen.getByTestId('plotly-scatter')).toHaveAttribute('data-y-title', 'deg');
    });
});

// ─── SignalMonitorPlotOphyd ───────────────────────────────────────────────────

describe('SignalMonitorPlotOphyd', () => {
    it('renders without crashing', () => {
        const { container } = render(<SignalMonitorPlotOphyd deviceName="motor1" demo />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('passes deviceName as deviceLabel (xAxisTitle) to PlotlyScatter', () => {
        render(<SignalMonitorPlotOphyd deviceName="motor1" demo />);
        expect(screen.getByTestId('plotly-scatter')).toHaveAttribute('data-x-title', 'motor1');
    });

    it('passes yAxisTitle prop through to PlotlyScatter', () => {
        vi.mocked(useOphydDeviceSocket).mockReturnValue({
            devices: { motor1: makeDevice(5.5, 'mm') },
        } as unknown as ReturnType<typeof useOphydDeviceSocket>);
        render(<SignalMonitorPlotOphyd deviceName="motor1" yAxisTitle="Position" />);
        expect(screen.getByTestId('plotly-scatter')).toHaveAttribute('data-y-title', 'Position');
    });

    it('falls back to device units for yAxisTitle when prop is omitted', () => {
        vi.mocked(useOphydDeviceSocket).mockReturnValue({
            devices: { motor1: makeDevice(5.5, 'mm') },
        } as unknown as ReturnType<typeof useOphydDeviceSocket>);
        render(<SignalMonitorPlotOphyd deviceName="motor1" />);
        expect(screen.getByTestId('plotly-scatter')).toHaveAttribute('data-y-title', 'mm');
    });
});
