import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/assets/icons', () => ({
    deviceIcons: { monoLargeNoArrows: <svg data-testid="mono-icon" /> },
    beamlineIcons: { mono: <svg data-testid="beamline-icon" /> },
}));

const ScatterMock = vi.fn(() => <div data-testid="signal-monitor-plot" />);
vi.mock('../../components/SignalMonitorPlotDevice', () => ({
    default: (props: Record<string, unknown>) => ScatterMock(props),
}));

vi.mock('../../components/SelectDropdown', () => ({
    default: ({
        onValueChange,
        initialSelectedItem,
    }: {
        onValueChange?: (v: string) => void;
        initialSelectedItem?: string;
    }) => (
        <select
            data-testid="move-mode-select"
            defaultValue={initialSelectedItem}
            onChange={(e) => onValueChange?.(e.target.value)}
        >
            <option value="Set Energy">Set Energy</option>
            <option value="Jog Energy">Jog Energy</option>
        </select>
    ),
}));

vi.mock('@/hooks/useOphydSocket', () => ({
    default: vi.fn(() => ({ devices: {}, handleSetValueRequest: vi.fn() })),
}));

vi.mock('@/hooks/useOphydDeviceSocket', () => ({
    default: vi.fn(() => ({
        devices: {
            mono_energy: {
                name: 'mono_energy',
                value: 3000,
                units: 'eV',
                pv: 'mono_energy',
                timestamp: 0,
                connected: true,
                read_access: true,
                write_access: true,
                locked: false,
                expanded: false,
            },
        },
        handleSetValueRequest: vi.fn(),
    })),
}));

// ── Imports (after mocks) ──────────────────────────────────────────────────────

import BeamEnergyAbout from '../../components/BeamEnergy/BeamEnergyAbout';
import BeamEnergyCurrentValue from '../../components/BeamEnergy/BeamEnergyCurrentValue';
import BeamEnergyTitleIcon from '../../components/BeamEnergy/BeamEnergyTitleIcon';
import BeamEnergyHeader from '../../components/BeamEnergy/BeamEnergyHeader';
import BeamEnergyController from '../../components/BeamEnergy/BeamEnergyController';
import BeamEnergyPlot from '../../components/BeamEnergy/BeamEnergyPlot';
import BeamEnergyPV from '../../components/BeamEnergy/BeamEnergyPV';
import BeamEnergyOphyd from '../../components/BeamEnergy/BeamEnergyOphyd';
import { Device } from '@/types/deviceControllerTypes';

const noop = () => {};

const makeDevice = (overrides: Partial<Device> = {}): Device => ({
    pv: 'TEST:PV',
    name: 'TEST:PV',
    value: 15.5,
    timestamp: 0,
    connected: true,
    read_access: true,
    write_access: true,
    locked: false,
    expanded: false,
    ...overrides,
});

const defaultHeaderProps = {
    title: 'Beam Energy',
    pv: 'TEST:PV',
    showController: false,
    showPlot: false,
    showAbout: false,
    isLocked: false,
    handleToggleLock: noop,
    handleToggleController: noop,
    handleTogglePlot: noop,
    handleToggleAbout: noop,
};

beforeEach(() => {
    ScatterMock.mockClear();
    vi.useFakeTimers();
});
afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

// ── BeamEnergyAbout ───────────────────────────────────────────────────────────

describe('BeamEnergyAbout', () => {
    it('renders device fields as formatted JSON', () => {
        const device = makeDevice({ name: 'myDevice', value: 42 });
        render(<BeamEnergyAbout device={device} />);
        expect(screen.getByText(/"name"/)).toBeInTheDocument();
        expect(screen.getByText(/"myDevice"/)).toBeInTheDocument();
    });

    it('applies className to the pre element', () => {
        const { container } = render(
            <BeamEnergyAbout device={makeDevice()} className="overflow-auto" />,
        );
        expect(container.querySelector('pre')).toHaveClass('overflow-auto');
    });
});

// ── BeamEnergyCurrentValue ────────────────────────────────────────────────────

describe('BeamEnergyCurrentValue', () => {
    it('shows formatted eV value', () => {
        render(<BeamEnergyCurrentValue currentValueEV={2345.6} />);
        expect(screen.getByText('2345.6 eV')).toBeInTheDocument();
    });

    it('shows N/A when currentValueEV is NaN', () => {
        render(<BeamEnergyCurrentValue currentValueEV={NaN} />);
        expect(screen.getByText('N/A eV')).toBeInTheDocument();
    });

    it('shows degree readout when currentValueDegrees is valid', () => {
        render(<BeamEnergyCurrentValue currentValueEV={2000} currentValueDegrees={15.12} />);
        expect(screen.getByText('15.12°')).toBeInTheDocument();
    });

    it('hides degree readout when currentValueDegrees is NaN', () => {
        render(<BeamEnergyCurrentValue currentValueEV={2000} currentValueDegrees={NaN} />);
        expect(screen.queryByText(/°/)).not.toBeInTheDocument();
    });
});

// ── BeamEnergyTitleIcon ───────────────────────────────────────────────────────

describe('BeamEnergyTitleIcon', () => {
    it('renders title and pv text', () => {
        render(<BeamEnergyTitleIcon title="Beam Energy" pv="bl531:mono_angle" />);
        expect(screen.getByText('Beam Energy')).toBeInTheDocument();
        expect(screen.getByText('bl531:mono_angle')).toBeInTheDocument();
    });

    it('shows the icon when showIcon is true', () => {
        render(<BeamEnergyTitleIcon title="BE" pv="pv" showIcon={true} />);
        expect(screen.getByTestId('mono-icon')).toBeInTheDocument();
    });

    it('hides the icon when showIcon is false', () => {
        render(<BeamEnergyTitleIcon title="BE" pv="pv" showIcon={false} />);
        expect(screen.queryByTestId('mono-icon')).not.toBeInTheDocument();
    });
});

// ── BeamEnergyHeader ──────────────────────────────────────────────────────────

describe('BeamEnergyHeader', () => {
    it('renders without crashing', () => {
        const { container } = render(<BeamEnergyHeader {...defaultHeaderProps} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('calls handleToggleLock when lock icon is clicked', () => {
        const handleToggleLock = vi.fn();
        render(<BeamEnergyHeader {...defaultHeaderProps} handleToggleLock={handleToggleLock} />);
        const svgs = document.querySelectorAll('svg');
        fireEvent.click(svgs[0]); // Lock is the first icon
        expect(handleToggleLock).toHaveBeenCalledTimes(1);
    });

    it('calls handleToggleAbout when question icon is clicked', () => {
        const handleToggleAbout = vi.fn();
        render(<BeamEnergyHeader {...defaultHeaderProps} handleToggleAbout={handleToggleAbout} />);
        const svgs = document.querySelectorAll('svg');
        fireEvent.click(svgs[svgs.length - 1]); // Question is the last icon
        expect(handleToggleAbout).toHaveBeenCalledTimes(1);
    });

    it('calls handleToggleController when joystick icon is clicked', () => {
        const handleToggleController = vi.fn();
        render(
            <BeamEnergyHeader
                {...defaultHeaderProps}
                handleToggleController={handleToggleController}
            />,
        );
        const svgs = document.querySelectorAll('svg');
        fireEvent.click(svgs[1]); // Second icon: Joystick
        expect(handleToggleController).toHaveBeenCalledTimes(1);
    });

    it('calls handleTogglePlot when chart icon is clicked', () => {
        const handleTogglePlot = vi.fn();
        render(<BeamEnergyHeader {...defaultHeaderProps} handleTogglePlot={handleTogglePlot} />);
        const svgs = document.querySelectorAll('svg');
        fireEvent.click(svgs[2]); // Third icon: ChartLine
        expect(handleTogglePlot).toHaveBeenCalledTimes(1);
    });
});

// ── BeamEnergyController ──────────────────────────────────────────────────────

describe('BeamEnergyController', () => {
    it('renders without crashing', () => {
        const { container } = render(<BeamEnergyController />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a number input in Set Energy mode', () => {
        render(<BeamEnergyController />);
        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('calls onAbsoluteMove with the input value when play button is clicked', () => {
        const onAbsoluteMove = vi.fn();
        render(<BeamEnergyController onAbsoluteMove={onAbsoluteMove} />);
        fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '2500' } });
        // PlayCircle button — first button after the dropdown
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]);
        expect(onAbsoluteMove).toHaveBeenCalledWith(2500);
    });

    it('calls onStop when stop button is clicked', () => {
        const onStop = vi.fn();
        render(<BeamEnergyController onStop={onStop} />);
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[1]); // HandPalm / stop button
        expect(onStop).toHaveBeenCalledTimes(1);
    });

    it('calls onAbsoluteMove on Enter key in Set Energy mode', () => {
        const onAbsoluteMove = vi.fn();
        render(<BeamEnergyController onAbsoluteMove={onAbsoluteMove} />);
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '3000' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onAbsoluteMove).toHaveBeenCalledWith(3000);
    });

    it('calls onRelativeMove on Enter key in Jog Energy mode', () => {
        const onRelativeMove = vi.fn();
        render(<BeamEnergyController onRelativeMove={onRelativeMove} />);
        fireEvent.change(screen.getByTestId('move-mode-select'), {
            target: { value: 'Jog Energy' },
        });
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '100' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onRelativeMove).toHaveBeenCalledWith(100);
    });

    it('does not call onAbsoluteMove on Enter when isLocked', () => {
        const onAbsoluteMove = vi.fn();
        render(<BeamEnergyController onAbsoluteMove={onAbsoluteMove} isLocked={true} />);
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '2500' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onAbsoluteMove).not.toHaveBeenCalled();
    });

    it('shows jog direction buttons in Jog Energy mode', () => {
        render(<BeamEnergyController />);
        fireEvent.change(screen.getByTestId('move-mode-select'), {
            target: { value: 'Jog Energy' },
        });
        // In Jog mode there are 3 buttons: left-jog, right-jog, stop
        expect(screen.getAllByRole('button')).toHaveLength(3);
    });
});

// ── BeamEnergyPlot ────────────────────────────────────────────────────────────

describe('BeamEnergyPlot', () => {
    it('renders SignalMonitorPlotDevice', () => {
        render(<BeamEnergyPlot currentValueEV={2500} />);
        expect(screen.getByTestId('signal-monitor-plot')).toBeInTheDocument();
    });

    it('passes a device with the current eV value when valid', () => {
        render(<BeamEnergyPlot currentValueEV={2500} />);
        const props = ScatterMock.mock.calls[ScatterMock.mock.calls.length - 1][0];
        expect(props.device?.value).toBe(2500);
        expect(props.device?.units).toBe('eV');
    });

    it('passes null device when currentValueEV is NaN', () => {
        render(<BeamEnergyPlot currentValueEV={NaN} />);
        const props = ScatterMock.mock.calls[ScatterMock.mock.calls.length - 1][0];
        expect(props.device).toBeNull();
    });

    it('passes null device when currentValueEV is undefined', () => {
        render(<BeamEnergyPlot />);
        const props = ScatterMock.mock.calls[ScatterMock.mock.calls.length - 1][0];
        expect(props.device).toBeNull();
    });
});

// ── BeamEnergyPV ──────────────────────────────────────────────────────────────

describe('BeamEnergyPV (demo mode)', () => {
    it('renders without crashing', () => {
        const { container } = render(<BeamEnergyPV demo />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('shows the initial energy near 3000 eV', () => {
        render(<BeamEnergyPV demo />);
        const evText = screen.getByText(/eV/);
        const value = parseFloat(evText.textContent!);
        expect(value).toBeCloseTo(3000, -1);
    });

    it('shows the controller section by default', () => {
        render(<BeamEnergyPV demo />);
        expect(screen.getByTestId('move-mode-select')).toBeInTheDocument();
    });

    it('shows plot and hides controller when plot icon is clicked', () => {
        render(<BeamEnergyPV demo />);
        const svgs = document.querySelectorAll('svg');
        fireEvent.click(svgs[2]); // ChartLine icon
        expect(screen.queryByTestId('move-mode-select')).not.toBeInTheDocument();
        expect(screen.getByTestId('signal-monitor-plot')).toBeInTheDocument();
    });

    it('shows about panel when question icon is clicked', () => {
        render(<BeamEnergyPV demo />);
        const svgs = document.querySelectorAll('svg');
        fireEvent.click(svgs[3]); // Question icon (Lock=0, Joystick=1, ChartLine=2, Question=3)
        expect(screen.getByText(/"name"/)).toBeInTheDocument();
    });

    it('moves toward target energy in demo mode over time', () => {
        render(<BeamEnergyPV demo />);
        // Trigger an absolute move to 4000 eV via the controller
        fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '4000' } });
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]); // play button

        act(() => {
            vi.advanceTimersByTime(600);
        }); // 600ms → partway through 1000ms move
        const evText = screen.getByText(/eV/);
        const value = parseFloat(evText.textContent!);
        // Should be between 3000 and 4000 after partial progress
        expect(value).toBeGreaterThan(3000);
        expect(value).toBeLessThan(4100);
    });
});

// ── BeamEnergyOphyd ───────────────────────────────────────────────────────────

describe('BeamEnergyOphyd', () => {
    it('renders without crashing', () => {
        const { container } = render(<BeamEnergyOphyd />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('displays the device name as subtitle', () => {
        render(<BeamEnergyOphyd deviceName="mono_energy" />);
        expect(screen.getByText('mono_energy')).toBeInTheDocument();
    });

    it('shows the controller by default', () => {
        render(<BeamEnergyOphyd />);
        expect(screen.getByTestId('move-mode-select')).toBeInTheDocument();
    });

    it('shows the about panel when question icon is clicked', () => {
        render(<BeamEnergyOphyd />);
        const svgs = document.querySelectorAll('svg');
        fireEvent.click(svgs[3]); // Question icon (Lock=0, Joystick=1, ChartLine=2, Question=3)
        expect(screen.getByText(/"name"/)).toBeInTheDocument();
    });

    it('applies className to the root section', () => {
        const { container } = render(<BeamEnergyOphyd className="my-class" />);
        expect(container.firstChild).toHaveClass('my-class');
    });
});
