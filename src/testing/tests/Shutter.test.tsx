import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Shutter from '../../components/Shutter';

const mockHandleSetValueRequest = vi.fn();

vi.mock('../../api/ophyd/useOphydPVSocket', () => ({
    default: vi.fn(),
}));

import useOphydPVSocket from '../../api/ophyd/useOphydPVSocket';

const setupDevice = (value: number | string, connected = true) => {
    vi.mocked(useOphydPVSocket).mockReturnValue({
        devices: {
            'bl531:LJT4:1:AO0': { value, connected },
        },
        handleSetValueRequest: mockHandleSetValueRequest,
    } as unknown as ReturnType<typeof useOphydPVSocket>);
};

beforeEach(() => {
    mockHandleSetValueRequest.mockClear();
    setupDevice(0); // default: open
});

describe('Shutter Component', () => {
    // --- Rendering ---

    it('renders without crashing', () => {
        const { container } = render(<Shutter />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('shows open status text when value equals valueWhenOpen', () => {
        setupDevice(0);
        render(<Shutter valueWhenOpen={0} valueWhenClosed={5} />);
        expect(screen.getByText('HUTCH SHUTTER OPEN')).toBeInTheDocument();
    });

    it('shows closed status text when value equals valueWhenClosed', () => {
        setupDevice(5);
        render(<Shutter valueWhenOpen={0} valueWhenClosed={5} />);
        expect(screen.getByText('HUTCH SHUTTER CLOSED')).toBeInTheDocument();
    });

    it('shows unknown status text when value does not match open or closed', () => {
        setupDevice(99);
        render(<Shutter valueWhenOpen={0} valueWhenClosed={5} />);
        expect(screen.getByText('HUTCH SHUTTER UNKNOWN')).toBeInTheDocument();
    });

    it('shows disconnected status text when connected is false', () => {
        setupDevice(0, false);
        render(<Shutter />);
        expect(screen.getByText('HUTCH SHUTTER DISCONNECTED')).toBeInTheDocument();
    });

    // --- Dropdown toggle ---

    it('dropdown is hidden by default', () => {
        render(<Shutter />);
        expect(screen.queryByText('Open Shutter')).not.toBeInTheDocument();
    });

    it('opens dropdown when caret button is clicked', () => {
        render(<Shutter />);
        fireEvent.click(screen.getByRole('button', { name: /open shutter controls/i }));
        expect(screen.getByText('Open Shutter')).toBeInTheDocument();
        expect(screen.getByText('Close Shutter')).toBeInTheDocument();
    });

    it('closes dropdown when caret button is clicked again', () => {
        render(<Shutter />);
        const toggle = screen.getByRole('button', { name: /open shutter controls/i });
        fireEvent.click(toggle);
        fireEvent.click(toggle);
        expect(screen.queryByText('Open Shutter')).not.toBeInTheDocument();
    });

    // --- Dropdown actions ---

    it('calls handleSetValueRequest with valueWhenOpen when Open Shutter is clicked', () => {
        render(<Shutter valueWhenOpen={0} valueWhenClosed={5} />);
        fireEvent.click(screen.getByRole('button', { name: /open shutter controls/i }));
        fireEvent.click(screen.getByText('Open Shutter'));
        expect(mockHandleSetValueRequest).toHaveBeenCalledWith('bl531:LJT4:1:AO0', 0);
    });

    it('calls handleSetValueRequest with valueWhenClosed when Close Shutter is clicked', () => {
        render(<Shutter valueWhenOpen={0} valueWhenClosed={5} />);
        fireEvent.click(screen.getByRole('button', { name: /open shutter controls/i }));
        fireEvent.click(screen.getByText('Close Shutter'));
        expect(mockHandleSetValueRequest).toHaveBeenCalledWith('bl531:LJT4:1:AO0', 5);
    });

    it('closes dropdown after clicking Open Shutter', () => {
        render(<Shutter />);
        fireEvent.click(screen.getByRole('button', { name: /open shutter controls/i }));
        fireEvent.click(screen.getByText('Open Shutter'));
        expect(screen.queryByText('Open Shutter')).not.toBeInTheDocument();
    });

    it('closes dropdown after clicking Close Shutter', () => {
        render(<Shutter />);
        fireEvent.click(screen.getByRole('button', { name: /open shutter controls/i }));
        fireEvent.click(screen.getByText('Close Shutter'));
        expect(screen.queryByText('Close Shutter')).not.toBeInTheDocument();
    });

    // --- Check mark indicator ---

    it('shows check mark next to Open Shutter when shutter is open', () => {
        setupDevice(0); // open
        render(<Shutter valueWhenOpen={0} valueWhenClosed={5} />);
        fireEvent.click(screen.getByRole('button', { name: /open shutter controls/i }));
        // The Check icon renders inside the Open Shutter button
        const openBtn = screen.getByText('Open Shutter').closest('button');
        expect(openBtn?.querySelector('svg')).toBeInTheDocument();
    });

    // --- className props ---

    it('applies custom className to root container', () => {
        const { container } = render(<Shutter className="my-shutter" />);
        expect(container.firstChild).toHaveClass('my-shutter');
    });

    it('applies classNameDropdown to the dropdown panel', () => {
        render(<Shutter classNameDropdown="my-dropdown" />);
        fireEvent.click(screen.getByRole('button', { name: /open shutter controls/i }));
        expect(document.querySelector('.my-dropdown')).toBeInTheDocument();
    });
});
