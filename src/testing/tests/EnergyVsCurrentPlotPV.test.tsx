import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EnergyVsCurrentPlotPV from '../../features/EnergyVsCurrentPlotPV';
import type { PlotlyScatterProps } from '../../components/PlotlyScatter';
import { beamstopCurrentModel, ENERGY_MIN_EV, ENERGY_MAX_EV } from '@/lib/ophyd-sim';

// Capture props forwarded to PlotlyScatter so we can inspect the traces the
// component builds without rendering real Plotly.
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

import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';

const ENERGY_PV = 'ENERGY';
const CURRENT_PV = 'CURRENT';
const BSX_PV = 'BSX';
const BSY_PV = 'BSY';

type Trace = { x: number[]; y: number[]; name?: string; mode?: string };

const makeDevice = (value: number | string, units = 'A') => ({ value, units, connected: true });

/** Point PVs at the given values (any subset). Missing PVs stay absent. */
const setDevices = (values: Partial<Record<string, number | string>>) => {
    const devices: Record<string, ReturnType<typeof makeDevice>> = {};
    for (const [pv, value] of Object.entries(values)) {
        if (value !== undefined) devices[pv] = makeDevice(value);
    }
    vi.mocked(useOphydPVSocket).mockReturnValue({ devices } as unknown as ReturnType<
        typeof useOphydPVSocket
    >);
};

/** The two traces from the most recent PlotlyScatter render: [expected, measured]. */
const lastTraces = () => {
    const props = ScatterMock.mock.calls[ScatterMock.mock.calls.length - 1][0];
    return props.data as unknown as [Trace, Trace];
};

/** Recompute the expected curve exactly as the component does, for assertions. */
const computeExpected = (x: number, y: number, steps: number) => {
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < steps; i++) {
        const energyEV = ENERGY_MIN_EV + ((ENERGY_MAX_EV - ENERGY_MIN_EV) * i) / (steps - 1);
        xs.push(energyEV);
        ys.push(beamstopCurrentModel({ x, y, energyEV }));
    }
    return { xs, ys };
};

const renderPlot = (props: Partial<React.ComponentProps<typeof EnergyVsCurrentPlotPV>> = {}) =>
    render(
        <EnergyVsCurrentPlotPV
            energyPv={ENERGY_PV}
            currentPv={CURRENT_PV}
            beamstopXRbvPv={BSX_PV}
            beamstopYRbvPv={BSY_PV}
            {...props}
        />,
    );

beforeEach(() => {
    ScatterMock.mockClear();
    vi.useFakeTimers();
    setDevices({});
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('EnergyVsCurrentPlotPV', () => {
    // ─── Rendering & static props ─────────────────────────────────────────────

    it('renders PlotlyScatter', () => {
        renderPlot();
        expect(screen.getByTestId('plotly-scatter')).toBeInTheDocument();
    });

    it('labels the axes for energy (x) and current (y)', () => {
        renderPlot();
        const scatter = screen.getByTestId('plotly-scatter');
        expect(scatter).toHaveAttribute('data-x-title', 'Beam Energy (eV)');
        expect(scatter).toHaveAttribute('data-y-title', 'Beamstop Current (A)');
    });

    it('pins the x-axis range to the energy bounds', () => {
        renderPlot();
        const props = ScatterMock.mock.calls[ScatterMock.mock.calls.length - 1][0];
        expect(props.xAxisRange).toEqual([ENERGY_MIN_EV, ENERGY_MAX_EV]);
    });

    it('forwards className to PlotlyScatter alongside the default height', () => {
        renderPlot({ className: 'my-class' });
        const props = ScatterMock.mock.calls[ScatterMock.mock.calls.length - 1][0];
        expect(props.className).toContain('my-class');
        expect(props.className).toContain('h-96');
    });

    it('renders Expected and Measured traces in that order', () => {
        renderPlot();
        const [expected, measured] = lastTraces();
        expect(expected.name).toBe('Expected');
        expect(expected.mode).toBe('lines');
        expect(measured.name).toBe('Measured');
        expect(measured.mode).toBe('markers');
    });

    // ─── Expected curve ───────────────────────────────────────────────────────

    it('spans the full energy range with the default number of points', () => {
        renderPlot();
        const [expected] = lastTraces();
        expect(expected.x).toHaveLength(100);
        expect(expected.x[0]).toBe(ENERGY_MIN_EV);
        expect(expected.x[expected.x.length - 1]).toBe(ENERGY_MAX_EV);
    });

    it('respects a custom expectedCurvePoints count', () => {
        renderPlot({ expectedCurvePoints: 10 });
        const [expected] = lastTraces();
        expect(expected.x).toHaveLength(10);
    });

    it('defaults the beamstop position to (0,0) when the readback PVs are absent', () => {
        renderPlot({ expectedCurvePoints: 5 });
        const [expected] = lastTraces();
        expect(expected.y).toEqual(computeExpected(0, 0, 5).ys);
    });

    it('shapes the expected curve from beamstopCurrentModel at the current beamstop position', () => {
        setDevices({ [BSX_PV]: 3, [BSY_PV]: -2 });
        renderPlot({ expectedCurvePoints: 8 });
        const [expected] = lastTraces();
        expect(expected.y).toEqual(computeExpected(3, -2, 8).ys);
    });

    it('reshapes the expected curve when the beamstop moves', () => {
        setDevices({ [BSX_PV]: 0, [BSY_PV]: 0 });
        const { rerender } = renderPlot({ expectedCurvePoints: 8 });
        const before = [...lastTraces()[0].y];

        setDevices({ [BSX_PV]: 5, [BSY_PV]: 5 });
        rerender(
            <EnergyVsCurrentPlotPV
                energyPv={ENERGY_PV}
                currentPv={CURRENT_PV}
                beamstopXRbvPv={BSX_PV}
                beamstopYRbvPv={BSY_PV}
                expectedCurvePoints={8}
            />,
        );
        const after = lastTraces()[0].y;
        expect(after).not.toEqual(before);
        expect(after).toEqual(computeExpected(5, 5, 8).ys);
    });

    // ─── Measured samples (polling) ────────────────────────────────────────────

    it('starts with no measured points', () => {
        setDevices({ [ENERGY_PV]: 1000, [CURRENT_PV]: 0.5 });
        renderPlot();
        const [, measured] = lastTraces();
        expect(measured.x).toHaveLength(0);
    });

    it('records an (energy, current) sample on each polling tick', () => {
        setDevices({ [ENERGY_PV]: 1000, [CURRENT_PV]: 0.5 });
        renderPlot({ pollingIntervalMs: 100 });
        act(() => {
            vi.advanceTimersByTime(100);
        });
        const [, measured] = lastTraces();
        expect(measured.x).toEqual([1000]);
        expect(measured.y).toEqual([0.5]);
    });

    it('does not record samples while energy or current is non-numeric', () => {
        setDevices({ [ENERGY_PV]: 1000, [CURRENT_PV]: 'n/a' });
        renderPlot({ pollingIntervalMs: 100 });
        act(() => {
            vi.advanceTimersByTime(500);
        });
        const [, measured] = lastTraces();
        expect(measured.x).toHaveLength(0);
    });

    it('caps the measured window at numVisiblePoints, dropping the oldest', () => {
        setDevices({ [ENERGY_PV]: 1000, [CURRENT_PV]: 0.5 });
        renderPlot({ pollingIntervalMs: 100, numVisiblePoints: 3 });
        act(() => {
            vi.advanceTimersByTime(1000); // ~10 ticks
        });
        const [, measured] = lastTraces();
        expect(measured.x).toHaveLength(3);
    });

    it('stops sampling after unmount', () => {
        setDevices({ [ENERGY_PV]: 1000, [CURRENT_PV]: 0.5 });
        const { unmount } = renderPlot({ pollingIntervalMs: 100 });
        act(() => {
            vi.advanceTimersByTime(100);
        });
        unmount();
        // Advancing further must not throw (interval cleared) — a state update
        // after unmount would surface here.
        expect(() =>
            act(() => {
                vi.advanceTimersByTime(500);
            }),
        ).not.toThrow();
    });
});
