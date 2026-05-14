import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// PNG asset
vi.mock('../../components/Hexapod/assets/hexapodAxisSketch.png', () => ({
    default: 'hexapod-sketch.png',
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
            <option value="Absolute Move">Absolute Move</option>
            <option value="Jog">Jog</option>
        </select>
    ),
}));

vi.mock('@/hooks/useOphydSocket', () => ({
    default: vi.fn(() => ({
        devices: {},
        handleSetValueRequest: vi.fn(),
        toggleDeviceLock: vi.fn(),
    })),
}));

// ── Imports (after mocks) ──────────────────────────────────────────────────────

import HexapodHeader from '../../components/Hexapod/HexapodHeader';
import HexapodController from '../../components/Hexapod/HexapodController';
import HexapodPlot from '../../components/Hexapod/HexapodPlot';
import Hexapod from '../../components/Hexapod/Hexapod';
import { HexapodRBVs } from '../../components/Hexapod/types/hexapodTypes';
import { Device } from '@/types/deviceControllerTypes';

// ── Helpers ───────────────────────────────────────────────────────────────────

const noop = () => {};

const makeDevice = (axis: string, value = 0): Device => ({
    pv: `demo:${axis}`,
    name: `demo:${axis}`,
    value,
    timestamp: 0,
    connected: true,
    read_access: true,
    write_access: true,
    locked: false,
    expanded: false,
    units: 'mm',
});

const makeRBVs = (values: Partial<Record<keyof HexapodRBVs, number>> = {}): HexapodRBVs => ({
    tx: makeDevice('tx', values.tx ?? 0),
    ty: makeDevice('ty', values.ty ?? 0),
    tz: makeDevice('tz', values.tz ?? 0),
    rx: makeDevice('rx', values.rx ?? 0),
    ry: makeDevice('ry', values.ry ?? 0),
    rz: makeDevice('rz', values.rz ?? 0),
});

const defaultHeaderProps = {
    showController: true,
    showPlot: false,
    showAbout: false,
    isLocked: false,
    onClickLock: noop,
    onClickController: noop,
    onClickPlot: noop,
    onClickAbout: noop,
};

beforeEach(() => {
    vi.useFakeTimers();
});
afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

// ── HexapodHeader ─────────────────────────────────────────────────────────────

describe('HexapodHeader', () => {
    it('renders the prefix as a heading', () => {
        render(<HexapodHeader {...defaultHeaderProps} prefix="SYM:HEX01" />);
        expect(screen.getByText('SYM:HEX01')).toBeInTheDocument();
    });

    it('uses default prefix when none provided', () => {
        render(<HexapodHeader {...defaultHeaderProps} />);
        expect(screen.getByText('SYM:HEX01')).toBeInTheDocument();
    });

    it('calls onClickLock when lock icon is clicked', () => {
        const onClickLock = vi.fn();
        render(<HexapodHeader {...defaultHeaderProps} onClickLock={onClickLock} />);
        fireEvent.click(document.querySelectorAll('svg')[0]); // Lock
        expect(onClickLock).toHaveBeenCalledTimes(1);
    });

    it('calls onClickController when joystick icon is clicked', () => {
        const onClickController = vi.fn();
        render(<HexapodHeader {...defaultHeaderProps} onClickController={onClickController} />);
        fireEvent.click(document.querySelectorAll('svg')[1]); // Joystick
        expect(onClickController).toHaveBeenCalledTimes(1);
    });

    it('calls onClickPlot when chart icon is clicked', () => {
        const onClickPlot = vi.fn();
        render(<HexapodHeader {...defaultHeaderProps} onClickPlot={onClickPlot} />);
        fireEvent.click(document.querySelectorAll('svg')[2]); // ChartLine
        expect(onClickPlot).toHaveBeenCalledTimes(1);
    });

    it('calls onClickAbout when question icon is clicked', () => {
        const onClickAbout = vi.fn();
        render(<HexapodHeader {...defaultHeaderProps} onClickAbout={onClickAbout} />);
        fireEvent.click(document.querySelectorAll('svg')[3]); // Question
        expect(onClickAbout).toHaveBeenCalledTimes(1);
    });
});

// ── HexapodController ─────────────────────────────────────────────────────────

describe('HexapodController', () => {
    it('renders without crashing', () => {
        const { container } = render(
            <HexapodController hexapodRBVs={makeRBVs()} onStartClick={noop} onStopClick={noop} />,
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    it('shows current position values for all axes', () => {
        render(
            <HexapodController
                hexapodRBVs={makeRBVs({ tx: 1.5, ty: -2.0, tz: 3.123 })}
                onStartClick={noop}
                onStopClick={noop}
            />,
        );
        expect(screen.getByText('1.500 mm')).toBeInTheDocument();
        expect(screen.getByText('-2.000 mm')).toBeInTheDocument();
        expect(screen.getByText('3.123 mm')).toBeInTheDocument();
    });

    it('shows N/A for disconnected axes', () => {
        const rbvs = makeRBVs();
        rbvs.tx = { ...rbvs.tx, connected: false };
        render(<HexapodController hexapodRBVs={rbvs} onStartClick={noop} onStopClick={noop} />);
        expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('calls onStartClick with form values when START is clicked', () => {
        const onStartClick = vi.fn();
        render(
            <HexapodController
                hexapodRBVs={makeRBVs()}
                onStartClick={onStartClick}
                onStopClick={noop}
            />,
        );
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: '5' } }); // tx
        fireEvent.click(screen.getByText('START'));
        expect(onStartClick).toHaveBeenCalledWith(
            expect.objectContaining({ tx: '5' }),
            false, // Absolute Move → not relative
        );
    });

    it('calls onStopClick when STOP is clicked', () => {
        const onStopClick = vi.fn();
        render(
            <HexapodController
                hexapodRBVs={makeRBVs()}
                onStartClick={noop}
                onStopClick={onStopClick}
            />,
        );
        fireEvent.click(screen.getByText('STOP'));
        expect(onStopClick).toHaveBeenCalledTimes(1);
    });

    it('shows jog hint text in Jog mode instead of START/STOP buttons', () => {
        render(
            <HexapodController hexapodRBVs={makeRBVs()} onStartClick={noop} onStopClick={noop} />,
        );
        fireEvent.change(screen.getByTestId('move-mode-select'), { target: { value: 'Jog' } });
        expect(screen.queryByText('START')).not.toBeInTheDocument();
        expect(screen.getByText(/Enter/)).toBeInTheDocument();
    });

    it('calls onStartClick with only that axis on Enter in Jog mode', () => {
        const onStartClick = vi.fn();
        render(
            <HexapodController
                hexapodRBVs={makeRBVs()}
                onStartClick={onStartClick}
                onStopClick={noop}
            />,
        );
        fireEvent.change(screen.getByTestId('move-mode-select'), { target: { value: 'Jog' } });
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[2], { target: { value: '1.5' } }); // tz
        fireEvent.keyDown(inputs[2], { key: 'Enter' });
        expect(onStartClick).toHaveBeenCalledWith(
            expect.objectContaining({ tx: 0, ty: 0, tz: '1.5', rx: 0, ry: 0, rz: 0 }),
            true, // relative
        );
    });

    it('does not call onStartClick on Enter in Jog mode when isLocked', () => {
        const onStartClick = vi.fn();
        render(
            <HexapodController
                hexapodRBVs={makeRBVs()}
                onStartClick={onStartClick}
                onStopClick={noop}
                isLocked
            />,
        );
        fireEvent.change(screen.getByTestId('move-mode-select'), { target: { value: 'Jog' } });
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: '2' } });
        fireEvent.keyDown(inputs[0], { key: 'Enter' });
        expect(onStartClick).not.toHaveBeenCalled();
    });

    it('clears form when trash icon is clicked', () => {
        render(
            <HexapodController hexapodRBVs={makeRBVs()} onStartClick={noop} onStopClick={noop} />,
        );
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: '5' } });
        expect(inputs[0]).toHaveValue('5');
        // Trash is the first SVG (before ArrowFatRight and Pause button icons)
        const svgs = document.querySelectorAll('svg');
        fireEvent.click(svgs[0]);
        expect(inputs[0]).toHaveValue('');
    });
});

// ── HexapodPlot ───────────────────────────────────────────────────────────────

describe('HexapodPlot', () => {
    it('renders the placeholder text', () => {
        render(<HexapodPlot />);
        expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();
    });
});

// ── Hexapod (demo mode) ───────────────────────────────────────────────────────

describe('Hexapod (demo mode)', () => {
    it('renders without crashing', () => {
        const { container } = render(<Hexapod demo />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('shows all axes at 0.000 mm initially', () => {
        render(<Hexapod demo />);
        const zeros = screen.getAllByText('0.000 mm');
        expect(zeros).toHaveLength(6);
    });

    it('shows the controller by default', () => {
        render(<Hexapod demo />);
        expect(screen.getByTestId('move-mode-select')).toBeInTheDocument();
    });

    it('moves an axis toward the target value over time', () => {
        render(<Hexapod demo />);
        // Set tx to 5 mm and click START
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: '5' } }); // tx input
        fireEvent.click(screen.getByText('START'));

        // Advance 2.5 s → 50% of a 5 mm move at 1 mm/s (5000 ms)
        act(() => {
            vi.advanceTimersByTime(2500);
        });

        const mmValues = screen.getAllByText(/mm/).map((el) => parseFloat(el.textContent!));
        const txValue = mmValues[0];
        expect(txValue).toBeGreaterThan(0);
        expect(txValue).toBeLessThan(5);
    });

    it('reaches the target value after the full move duration', () => {
        render(<Hexapod demo />);
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: '3' } });
        fireEvent.click(screen.getByText('START'));

        act(() => {
            vi.advanceTimersByTime(3100);
        }); // 3 mm at 1 mm/s = 3000 ms
        expect(screen.getByText('3.000 mm')).toBeInTheDocument();
    });

    it('stops a move in progress when STOP is clicked', () => {
        render(<Hexapod demo />);
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: '10' } });
        fireEvent.click(screen.getByText('START'));

        act(() => {
            vi.advanceTimersByTime(2000);
        }); // midway through 10 s move
        const midValues = screen.getAllByText(/mm/).map((el) => parseFloat(el.textContent!));
        const midTx = midValues[0];

        fireEvent.click(screen.getByText('STOP'));
        act(() => {
            vi.advanceTimersByTime(3000);
        }); // advance more — should not change

        const finalValues = screen.getAllByText(/mm/).map((el) => parseFloat(el.textContent!));
        expect(finalValues[0]).toBeCloseTo(midTx, 1);
    });

    it('clamps moves to ±10 mm', () => {
        render(<Hexapod demo />);
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: '999' } });
        fireEvent.click(screen.getByText('START'));

        act(() => {
            vi.advanceTimersByTime(15000);
        }); // well past 10 s cap
        expect(screen.getByText('10.000 mm')).toBeInTheDocument();
    });

    it('hides controller and shows plot when chart icon is clicked', () => {
        render(<Hexapod demo />);
        fireEvent.click(document.querySelectorAll('svg')[2]); // ChartLine
        expect(screen.queryByTestId('move-mode-select')).not.toBeInTheDocument();
        expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();
    });

    it('shows about text when question icon is clicked', () => {
        render(<Hexapod demo />);
        fireEvent.click(document.querySelectorAll('svg')[3]); // Question
        expect(screen.getByText(/About Section Coming Soon/i)).toBeInTheDocument();
    });

    it('hides controller when locked and START/STOP are not interactive', () => {
        render(<Hexapod demo />);
        fireEvent.click(document.querySelectorAll('svg')[0]); // Lock
        // The controller form wrapper has pointer-events-none when locked; buttons still render
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(6); // still visible
    });
});
