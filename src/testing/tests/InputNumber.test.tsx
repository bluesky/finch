import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InputNumber from '../../components/InputNumber';

describe('InputNumber Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<InputNumber />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a number input', () => {
        render(<InputNumber />);
        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('renders a label when provided', () => {
        render(<InputNumber label="Position" />);
        expect(screen.getByText('Position')).toBeInTheDocument();
    });

    it('calls onChange with the parsed number on input change', () => {
        const onChange = vi.fn();
        render(<InputNumber onChange={onChange} />);
        fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '42' } });
        expect(onChange).toHaveBeenCalledWith(42);
    });

    it('calls onChange with null when input is cleared', () => {
        const onChange = vi.fn();
        render(<InputNumber onChange={onChange} />);
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '5' } });
        fireEvent.change(input, { target: { value: '' } });
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('calls handleEnter when Enter is pressed with a valid value', () => {
        const handleEnter = vi.fn();
        render(<InputNumber handleEnter={handleEnter} />);
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '10' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(handleEnter).toHaveBeenCalledWith(10);
    });

    it('does not call handleEnter when value is above max', () => {
        const handleEnter = vi.fn();
        render(<InputNumber handleEnter={handleEnter} max={5} />);
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '99' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(handleEnter).not.toHaveBeenCalled();
    });

    it('does not call handleEnter when value is below min', () => {
        const handleEnter = vi.fn();
        render(<InputNumber handleEnter={handleEnter} min={10} />);
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '1' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(handleEnter).not.toHaveBeenCalled();
    });

    it('shows out-of-bounds message when value exceeds max', () => {
        render(<InputNumber max={5} />);
        fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '99' } });
        expect(screen.getByText('Value out of bounds')).toBeInTheDocument();
    });

    it('renders warningMessage when isWarningVisible is true', () => {
        render(<InputNumber warningMessage="Required field" isWarningVisible={true} />);
        expect(screen.getByText('Required field')).toBeInTheDocument();
    });

    it('does not render warningMessage when isWarningVisible is false', () => {
        render(<InputNumber warningMessage="Required field" isWarningVisible={false} />);
        expect(screen.queryByText('Required field')).not.toBeInTheDocument();
    });

    it('disables the input when disabled is true', () => {
        render(<InputNumber disabled={true} />);
        expect(screen.getByRole('spinbutton')).toBeDisabled();
    });

    it('applies a custom className to the root element', () => {
        const { container } = render(<InputNumber className="my-class" />);
        expect(container.firstChild).toHaveClass('my-class');
    });

    it('applies flex-row-reverse when labelPosition is right', () => {
        const { container } = render(<InputNumber labelPosition="right" />);
        expect(container.firstChild).toHaveClass('flex-row-reverse');
    });
});
