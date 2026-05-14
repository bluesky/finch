import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ControllerAbsoluteMove from '../../components/ControllerAbsoluteMove';

describe('ControllerAbsoluteMove Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<ControllerAbsoluteMove />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the input and arrow icon', () => {
        const { container } = render(<ControllerAbsoluteMove />);
        expect(container.querySelector('input')).toBeInTheDocument();
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with an input label', () => {
        render(<ControllerAbsoluteMove inputLabel="Position" />);
        expect(screen.getByText('Position')).toBeInTheDocument();
    });

    it('calls handleEnter when the arrow icon is clicked', () => {
        const handleEnter = vi.fn();
        const { container } = render(<ControllerAbsoluteMove handleEnter={handleEnter} />);

        const input = container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '42' } });

        const arrow = container.querySelector('svg')!;
        fireEvent.click(arrow);

        expect(handleEnter).toHaveBeenCalledTimes(1);
        expect(handleEnter).toHaveBeenCalledWith(42);
    });

    it('calls handleEnter with null when arrow is clicked and input is empty', () => {
        const handleEnter = vi.fn();
        const { container } = render(<ControllerAbsoluteMove handleEnter={handleEnter} />);

        const arrow = container.querySelector('svg')!;
        fireEvent.click(arrow);

        expect(handleEnter).toHaveBeenCalledWith(null);
    });

    it('calls handleEnter when Enter key is pressed in the input', () => {
        const handleEnter = vi.fn();
        const { container } = render(<ControllerAbsoluteMove handleEnter={handleEnter} />);

        const input = container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '10' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(handleEnter).toHaveBeenCalledWith(10);
    });

    it('does not throw when arrow is clicked and handleEnter is not provided', () => {
        const { container } = render(<ControllerAbsoluteMove />);
        const arrow = container.querySelector('svg')!;
        expect(() => fireEvent.click(arrow)).not.toThrow();
    });

    it('applies locked styles when locked is true', () => {
        const { container } = render(<ControllerAbsoluteMove locked={true} />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass('pointer-events-none', 'opacity-50');
    });

    it('does not apply locked styles when locked is false', () => {
        const { container } = render(<ControllerAbsoluteMove locked={false} />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).not.toHaveClass('pointer-events-none');
        expect(wrapper).not.toHaveClass('opacity-50');
    });

    it('applies a custom className', () => {
        const { container } = render(<ControllerAbsoluteMove className="my-custom-class" />);
        expect(container.firstChild).toHaveClass('my-custom-class');
    });
});
