import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TableDeviceController from '../../components/TableDeviceController';
import { Device, Devices } from '@/types/deviceControllerTypes';

// Expose handleEnter callbacks so tests can trigger them directly
const AbsoluteMock = vi.fn(({ handleEnter }: { handleEnter?: (input: number | null) => void }) => (
    <button data-testid="abs-move" onClick={() => handleEnter && handleEnter(10)}>
        abs
    </button>
));
const RelativeMock = vi.fn(
    ({
        handleEnter,
        currentValue,
    }: {
        handleEnter?: (input: number | null) => void;
        currentValue: number | null;
    }) => (
        <button
            data-testid="rel-move"
            onClick={() =>
                handleEnter && handleEnter(currentValue !== null ? currentValue + 1 : null)
            }
        >
            rel
        </button>
    ),
);

vi.mock('../../components/ControllerAbsoluteMove', () => ({
    default: (props: unknown) => AbsoluteMock(props as Parameters<typeof AbsoluteMock>[0]),
}));
vi.mock('../../components/ControllerRelativeMove', () => ({
    default: (props: unknown) => RelativeMock(props as Parameters<typeof RelativeMock>[0]),
}));

const makeDevice = (overrides: Partial<Device> = {}): Device => ({
    pv: 'TEST:PV',
    name: 'motor1',
    value: 42,
    units: 'mm',
    timestamp: 0,
    connected: true,
    locked: false,
    expanded: false,
    read_access: true,
    write_access: true,
    ...overrides,
});

const makeDevices = (entries: [string, Partial<Device>][]): Devices =>
    Object.fromEntries(
        entries.map(([name, overrides]) => [name, makeDevice({ name, ...overrides })]),
    );

const noop = () => {};

beforeEach(() => {
    AbsoluteMock.mockClear();
    RelativeMock.mockClear();
});

describe('TableDeviceController', () => {
    // --- Rendering ---

    it('renders without crashing with no devices', () => {
        const { container } = render(
            <TableDeviceController
                devices={{}}
                handleSetValueRequest={noop}
                toggleDeviceLock={noop}
                toggleExpand={noop}
            />,
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a row for each device', () => {
        const devices = makeDevices([
            ['motor1', {}],
            ['motor2', {}],
        ]);
        render(
            <TableDeviceController
                devices={devices}
                handleSetValueRequest={noop}
                toggleDeviceLock={noop}
                toggleExpand={noop}
            />,
        );
        expect(screen.getByText('motor1')).toBeInTheDocument();
        expect(screen.getByText('motor2')).toBeInTheDocument();
    });

    it('renders column headers', () => {
        render(
            <TableDeviceController
                devices={{}}
                handleSetValueRequest={noop}
                toggleDeviceLock={noop}
                toggleExpand={noop}
            />,
        );
        expect(screen.getByText('Device Name')).toBeInTheDocument();
        expect(screen.getByText('Current Value')).toBeInTheDocument();
        expect(screen.getByText('Absolute Move')).toBeInTheDocument();
        expect(screen.getByText('Relative Move')).toBeInTheDocument();
    });

    // --- Current value display ---

    it('displays formatted numeric value with units', () => {
        const devices = makeDevices([['motor1', { value: 12.3456, units: 'mm' }]]);
        render(
            <TableDeviceController
                devices={devices}
                handleSetValueRequest={noop}
                toggleDeviceLock={noop}
                toggleExpand={noop}
            />,
        );
        expect(screen.getByText(/12.35.*mm/)).toBeInTheDocument();
    });

    it('shows n/a when device has no units', () => {
        const devices = makeDevices([['motor1', { value: 5, units: undefined }]]);
        render(
            <TableDeviceController
                devices={devices}
                handleSetValueRequest={noop}
                toggleDeviceLock={noop}
                toggleExpand={noop}
            />,
        );
        expect(screen.getByText(/n\/a/i)).toBeInTheDocument();
    });

    it('displays string values as-is', () => {
        const devices = makeDevices([['motor1', { value: 'IDLE' }]]);
        render(
            <TableDeviceController
                devices={devices}
                handleSetValueRequest={noop}
                toggleDeviceLock={noop}
                toggleExpand={noop}
            />,
        );
        expect(screen.getByText(/IDLE/)).toBeInTheDocument();
    });

    // --- toggleExpand ---

    it('calls toggleExpand with device name when name cell is clicked', () => {
        const toggleExpand = vi.fn();
        const devices = makeDevices([['motor1', {}]]);
        render(
            <TableDeviceController
                devices={devices}
                handleSetValueRequest={noop}
                toggleDeviceLock={noop}
                toggleExpand={toggleExpand}
            />,
        );
        fireEvent.click(screen.getByText('motor1'));
        expect(toggleExpand).toHaveBeenCalledWith('motor1');
    });

    it('shows expanded JSON when device.expanded is true', () => {
        const devices = makeDevices([['motor1', { expanded: true }]]);
        render(
            <TableDeviceController
                devices={devices}
                handleSetValueRequest={noop}
                toggleDeviceLock={noop}
                toggleExpand={noop}
            />,
        );
        expect(screen.getByText(/"name"/)).toBeInTheDocument();
    });

    it('hides expanded JSON when device.expanded is false', () => {
        const devices = makeDevices([['motor1', { expanded: false }]]);
        render(
            <TableDeviceController
                devices={devices}
                handleSetValueRequest={noop}
                toggleDeviceLock={noop}
                toggleExpand={noop}
            />,
        );
        expect(screen.queryByText(/"name"/)).not.toBeInTheDocument();
    });

    // --- handleSetValueRequest via controllers ---

    it('calls handleSetValueRequest when absolute move is submitted', () => {
        const handleSetValueRequest = vi.fn();
        const devices = makeDevices([['motor1', {}]]);
        render(
            <TableDeviceController
                devices={devices}
                handleSetValueRequest={handleSetValueRequest}
                toggleDeviceLock={noop}
                toggleExpand={noop}
            />,
        );
        fireEvent.click(screen.getByTestId('abs-move'));
        expect(handleSetValueRequest).toHaveBeenCalledWith('motor1', 10);
    });

    it('calls handleSetValueRequest when relative move is submitted', () => {
        const handleSetValueRequest = vi.fn();
        const devices = makeDevices([['motor1', { value: 5 }]]);
        render(
            <TableDeviceController
                devices={devices}
                handleSetValueRequest={handleSetValueRequest}
                toggleDeviceLock={noop}
                toggleExpand={noop}
            />,
        );
        fireEvent.click(screen.getByTestId('rel-move'));
        expect(handleSetValueRequest).toHaveBeenCalledWith('motor1', 6);
    });

    it('passes numeric currentValue to ControllerRelativeMove', () => {
        const devices = makeDevices([['motor1', { value: 99 }]]);
        render(
            <TableDeviceController
                devices={devices}
                handleSetValueRequest={noop}
                toggleDeviceLock={noop}
                toggleExpand={noop}
            />,
        );
        const lastCall = RelativeMock.mock.calls[RelativeMock.mock.calls.length - 1][0];
        expect(lastCall.currentValue).toBe(99);
    });

    it('passes null currentValue to ControllerRelativeMove when device value is non-numeric', () => {
        const devices = makeDevices([['motor1', { value: 'IDLE' }]]);
        render(
            <TableDeviceController
                devices={devices}
                handleSetValueRequest={noop}
                toggleDeviceLock={noop}
                toggleExpand={noop}
            />,
        );
        const lastCall = RelativeMock.mock.calls[RelativeMock.mock.calls.length - 1][0];
        expect(lastCall.currentValue).toBeNull();
    });

    // --- className ---

    it('applies className to the root container', () => {
        const { container } = render(
            <TableDeviceController
                devices={{}}
                handleSetValueRequest={noop}
                toggleDeviceLock={noop}
                toggleExpand={noop}
                className="my-table"
            />,
        );
        expect(container.firstChild).toHaveClass('my-table');
    });
});
