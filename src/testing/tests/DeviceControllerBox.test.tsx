import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeviceControllerBox from '../../components/DeviceControllerBox';
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
};

describe('DeviceControllerBox Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<DeviceControllerBox {...defaultProps} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('shows device name by default', () => {
        render(<DeviceControllerBox {...defaultProps} />);
        expect(screen.getByText('test-device')).toBeInTheDocument();
    });

    it('shows title instead of device name when title is provided', () => {
        render(<DeviceControllerBox {...defaultProps} title="My Motor" />);
        expect(screen.getByText('My Motor')).toBeInTheDocument();
        expect(screen.queryByText('test-device')).not.toBeInTheDocument();
    });

    it('shows the formatted current value', () => {
        render(<DeviceControllerBox {...defaultProps} />);
        expect(screen.getAllByText('10.00 mm').length).toBeGreaterThan(0);
    });

    it('uses deviceRBV value when provided', () => {
        const deviceRBV: Device = { ...mockDevice, value: 42, name: 'rbv-device' };
        render(<DeviceControllerBox {...defaultProps} deviceRBV={deviceRBV} />);
        expect(screen.getAllByText('42.00 mm').length).toBeGreaterThan(0);
    });

    it('calls handleLockClick with device name when lock button is clicked', () => {
        const handleLockClick = vi.fn();
        const { container } = render(
            <DeviceControllerBox {...defaultProps} handleLockClick={handleLockClick} />,
        );
        const lockButton = container.querySelector(
            'article > div:first-child > svg:first-child',
        ) as HTMLElement;
        fireEvent.click(lockButton);
        expect(handleLockClick).toHaveBeenCalledWith('test-device');
    });

    it('calls handleSetValueRequest when "set" button is clicked with a value', () => {
        const handleSetValueRequest = vi.fn();
        const { container } = render(
            <DeviceControllerBox {...defaultProps} handleSetValueRequest={handleSetValueRequest} />,
        );

        const [absoluteInput] = container.querySelectorAll('input');
        fireEvent.change(absoluteInput, { target: { value: '25' } });

        fireEvent.click(screen.getByRole('button', { name: /set/i }));
        expect(handleSetValueRequest).toHaveBeenCalledWith('test-device', 25);
    });

    it('does not call handleSetValueRequest when "set" is clicked with no value entered', () => {
        const handleSetValueRequest = vi.fn();
        render(
            <DeviceControllerBox {...defaultProps} handleSetValueRequest={handleSetValueRequest} />,
        );
        fireEvent.click(screen.getByRole('button', { name: /set/i }));
        expect(handleSetValueRequest).not.toHaveBeenCalled();
    });

    it('calls handleSetValueRequest on Enter key in absolute move input', () => {
        const handleSetValueRequest = vi.fn();
        const { container } = render(
            <DeviceControllerBox {...defaultProps} handleSetValueRequest={handleSetValueRequest} />,
        );
        const [absoluteInput] = container.querySelectorAll('input');
        fireEvent.change(absoluteInput, { target: { value: '15' } });
        fireEvent.keyDown(absoluteInput, { key: 'Enter' });
        expect(handleSetValueRequest).toHaveBeenCalledWith('test-device', 15);
    });

    it('calls handleSetValueRequest with increment when right arrow is clicked', () => {
        const handleSetValueRequest = vi.fn();
        const { container } = render(
            <DeviceControllerBox {...defaultProps} handleSetValueRequest={handleSetValueRequest} />,
        );
        const relativeSection = container.querySelector(
            'article > div:nth-child(5)',
        ) as HTMLElement;
        const [, relativeInput] = container.querySelectorAll('input');
        fireEvent.change(relativeInput, { target: { value: '5' } });

        const incrementDiv = relativeSection.children[2] as HTMLElement;
        fireEvent.click(incrementDiv);
        expect(handleSetValueRequest).toHaveBeenCalledWith('test-device', 15);
    });

    it('calls handleSetValueRequest with decrement when left arrow is clicked', () => {
        const handleSetValueRequest = vi.fn();
        const { container } = render(
            <DeviceControllerBox {...defaultProps} handleSetValueRequest={handleSetValueRequest} />,
        );
        const relativeSection = container.querySelector(
            'article > div:nth-child(5)',
        ) as HTMLElement;
        const [, relativeInput] = container.querySelectorAll('input');
        fireEvent.change(relativeInput, { target: { value: '3' } });

        const decrementDiv = relativeSection.children[0] as HTMLElement;
        fireEvent.click(decrementDiv);
        expect(handleSetValueRequest).toHaveBeenCalledWith('test-device', 7);
    });

    it('does not call handleSetValueRequest via relative arrows when no increment is entered', () => {
        const handleSetValueRequest = vi.fn();
        const { container } = render(
            <DeviceControllerBox {...defaultProps} handleSetValueRequest={handleSetValueRequest} />,
        );
        const relativeSection = container.querySelector(
            'article > div:nth-child(5)',
        ) as HTMLElement;
        fireEvent.click(relativeSection.children[0] as HTMLElement);
        fireEvent.click(relativeSection.children[2] as HTMLElement);
        expect(handleSetValueRequest).not.toHaveBeenCalled();
    });

    it('disables inputs and set button when device is locked', () => {
        const lockedDevice = { ...mockDevice, locked: true };
        const { container } = render(
            <DeviceControllerBox {...defaultProps} device={lockedDevice} />,
        );
        const inputs = container.querySelectorAll('input');
        inputs.forEach((input) => expect(input).toBeDisabled());
        expect(screen.getByRole('button', { name: /set/i })).toBeDisabled();
    });

    it('does not call handleSetValueRequest via relative arrows when device is locked', () => {
        const handleSetValueRequest = vi.fn();
        const lockedDevice = { ...mockDevice, locked: true };
        const { container } = render(
            <DeviceControllerBox
                {...defaultProps}
                device={lockedDevice}
                handleSetValueRequest={handleSetValueRequest}
            />,
        );
        const relativeSection = container.querySelector(
            'article > div:nth-child(5)',
        ) as HTMLElement;
        fireEvent.click(relativeSection.children[0] as HTMLElement);
        fireEvent.click(relativeSection.children[2] as HTMLElement);
        expect(handleSetValueRequest).not.toHaveBeenCalled();
    });

    it('toggles the detail popup when question mark button is clicked', () => {
        const { container } = render(<DeviceControllerBox {...defaultProps} />);
        const questionMarkButton = container.querySelector(
            'article > div:first-child > svg:last-child',
        ) as HTMLElement;

        expect(screen.queryByText(/test-device \|/)).not.toBeInTheDocument();
        fireEvent.click(questionMarkButton);
        expect(screen.getByText(/test-device \|/)).toBeInTheDocument();

        fireEvent.click(questionMarkButton);
        expect(screen.queryByText(/test-device \|/)).not.toBeInTheDocument();
    });

    it('popup shows JSON representation of device', () => {
        const { container } = render(<DeviceControllerBox {...defaultProps} />);
        const questionMarkButton = container.querySelector(
            'article > div:first-child > svg:last-child',
        ) as HTMLElement;
        fireEvent.click(questionMarkButton);

        const pre = container.querySelector('pre');
        expect(pre).toBeInTheDocument();
        expect(pre?.textContent).toContain('"name": "test-device"');
    });

    it('renders the svgIcon when provided', () => {
        render(
            <DeviceControllerBox {...defaultProps} svgIcon={<svg data-testid="custom-icon" />} />,
        );
        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('applies a custom className', () => {
        const { container } = render(
            <DeviceControllerBox {...defaultProps} className="my-custom-class" />,
        );
        expect(container.firstChild).toHaveClass('my-custom-class');
    });
});
