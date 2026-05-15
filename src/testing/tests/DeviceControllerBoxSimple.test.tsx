import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeviceControllerBoxSimple from '../../components/DeviceControllerBoxSimple';
import { Device } from '../../types/deviceControllerTypes';

const mockDevice: Device = {
    pv: 'TEST:PV',
    value: 10,
    timestamp: 1234567890,
    connected: true,
    read_access: true,
    write_access: true,
    name: 'test-device',
    locked: false,
    expanded: false,
    units: 'mm',
};

const defaultProps = {
    device: mockDevice,
    handleSetValueRequest: vi.fn(),
    handleLockClick: vi.fn(),
    handleMinimizeClick: vi.fn(),
};

describe('DeviceControllerBoxSimple Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<DeviceControllerBoxSimple {...defaultProps} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders nothing when device is falsy', () => {
        const { container } = render(
            <DeviceControllerBoxSimple {...defaultProps} device={null as unknown as Device} />,
        );
        expect(container.firstChild).toBeNull();
    });

    it('shows the device name', () => {
        render(<DeviceControllerBoxSimple {...defaultProps} />);
        expect(screen.getByText('test-device')).toBeInTheDocument();
    });

    it('shows the formatted current value', () => {
        render(<DeviceControllerBoxSimple {...defaultProps} />);
        expect(screen.getByText('10.00 mm')).toBeInTheDocument();
    });

    it('calls handleLockClick with device name when lock icon is clicked', () => {
        const handleLockClick = vi.fn();
        const { container } = render(
            <DeviceControllerBoxSimple {...defaultProps} handleLockClick={handleLockClick} />,
        );
        const lockIcon = container.querySelector('svg')!;
        fireEvent.click(lockIcon);
        expect(handleLockClick).toHaveBeenCalledWith('test-device');
    });

    it('calls handleMinimizeClick with device name when minimize icon is clicked', () => {
        const handleMinimizeClick = vi.fn();
        const { container } = render(
            <DeviceControllerBoxSimple
                {...defaultProps}
                handleMinimizeClick={handleMinimizeClick}
            />,
        );
        const [, minimizeIcon] = container.querySelectorAll('svg');
        fireEvent.click(minimizeIcon);
        expect(handleMinimizeClick).toHaveBeenCalledWith('test-device');
    });

    it('calls handleSetValueRequest via absolute move (Enter key)', () => {
        const handleSetValueRequest = vi.fn();
        const { container } = render(
            <DeviceControllerBoxSimple
                {...defaultProps}
                handleSetValueRequest={handleSetValueRequest}
            />,
        );
        // Last input is the absolute move input
        const inputs = container.querySelectorAll('input');
        const absoluteInput = inputs[inputs.length - 1];
        fireEvent.change(absoluteInput, { target: { value: '25' } });
        fireEvent.keyDown(absoluteInput, { key: 'Enter' });
        expect(handleSetValueRequest).toHaveBeenCalledWith('test-device', 25);
    });

    it('calls handleSetValueRequest via relative move right arrow', () => {
        const handleSetValueRequest = vi.fn();
        const { container } = render(
            <DeviceControllerBoxSimple
                {...defaultProps}
                handleSetValueRequest={handleSetValueRequest}
            />,
        );
        // First input is the relative move input
        const [relativeInput] = container.querySelectorAll('input');
        fireEvent.change(relativeInput, { target: { value: '5' } });

        const svgs = container.querySelectorAll('svg');
        // SVGs: LockOpen, ArrowsInSimple, ArrowCircleLeft, ArrowCircleRight, AbsoluteMove arrow
        // ArrowCircleRight is the 4th svg (index 3)
        fireEvent.click(svgs[3]);
        expect(handleSetValueRequest).toHaveBeenCalledWith('test-device', 15);
    });

    it('calls handleSetValueRequest via relative move left arrow', () => {
        const handleSetValueRequest = vi.fn();
        const { container } = render(
            <DeviceControllerBoxSimple
                {...defaultProps}
                handleSetValueRequest={handleSetValueRequest}
            />,
        );
        const [relativeInput] = container.querySelectorAll('input');
        fireEvent.change(relativeInput, { target: { value: '3' } });

        const svgs = container.querySelectorAll('svg');
        // ArrowCircleLeft is the 3rd svg (index 2)
        fireEvent.click(svgs[2]);
        expect(handleSetValueRequest).toHaveBeenCalledWith('test-device', 7);
    });

    it('applies locked background when device is locked', () => {
        const lockedDevice = { ...mockDevice, locked: true };
        const { container } = render(
            <DeviceControllerBoxSimple {...defaultProps} device={lockedDevice} />,
        );
        expect(container.firstChild).toHaveClass('bg-slate-400');
    });

    it('applies unlocked background when device is not locked', () => {
        const { container } = render(<DeviceControllerBoxSimple {...defaultProps} />);
        expect(container.firstChild).toHaveClass('bg-slate-100');
    });

    it('applies opacity when device is locked', () => {
        const lockedDevice = { ...mockDevice, locked: true };
        const { container } = render(
            <DeviceControllerBoxSimple {...defaultProps} device={lockedDevice} />,
        );
        expect(container.firstChild).toHaveClass('opacity-60');
    });

    it('relative move is locked when device is locked', () => {
        const handleSetValueRequest = vi.fn();
        const lockedDevice = { ...mockDevice, locked: true };
        const { container } = render(
            <DeviceControllerBoxSimple
                {...defaultProps}
                device={lockedDevice}
                handleSetValueRequest={handleSetValueRequest}
            />,
        );
        // ControllerRelativeMove root div should have pointer-events-none when locked
        const relativeSection = container.querySelector('.pointer-events-none');
        expect(relativeSection).toBeInTheDocument();
    });

    it('absolute move input is disabled when device is locked', () => {
        const lockedDevice = { ...mockDevice, locked: true };
        const { container } = render(
            <DeviceControllerBoxSimple {...defaultProps} device={lockedDevice} />,
        );
        const inputs = container.querySelectorAll('input');
        const absoluteInput = inputs[inputs.length - 1];
        expect(absoluteInput).toBeDisabled();
    });
});
