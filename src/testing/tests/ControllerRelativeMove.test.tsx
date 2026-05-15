import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ControllerRelativeMove from '../../components/ControllerRelativeMove';

describe('ControllerRelativeMove Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<ControllerRelativeMove currentValue={0} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the input and both arrow icons', () => {
        const { container } = render(<ControllerRelativeMove currentValue={0} />);
        expect(container.querySelector('input')).toBeInTheDocument();
        expect(container.querySelectorAll('svg')).toHaveLength(2);
    });

    it('shows no resultant text when input is empty', () => {
        render(<ControllerRelativeMove currentValue={10} inputLabel="mm" />);
        const paragraphs = screen.getAllByRole('paragraph').filter((p) => p.textContent !== '');
        expect(paragraphs).toHaveLength(0);
    });

    it('shows resultant addition and subtraction text when input is provided', () => {
        const { container } = render(<ControllerRelativeMove currentValue={10} inputLabel="mm" />);
        const input = container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '5' } });

        expect(screen.getByText('15.00 mm')).toBeInTheDocument();
        expect(screen.getByText('5.000 mm')).toBeInTheDocument();
    });

    it('right arrow calls handleEnter with currentValue + inputValue', () => {
        const handleEnter = vi.fn();
        const { container } = render(
            <ControllerRelativeMove currentValue={10} handleEnter={handleEnter} />,
        );

        const input = container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '3' } });

        const [, rightArrow] = container.querySelectorAll('svg');
        fireEvent.click(rightArrow);

        expect(handleEnter).toHaveBeenCalledWith(13);
    });

    it('left arrow calls handleEnter with currentValue - inputValue', () => {
        const handleEnter = vi.fn();
        const { container } = render(
            <ControllerRelativeMove currentValue={10} handleEnter={handleEnter} />,
        );

        const input = container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '3' } });

        const [leftArrow] = container.querySelectorAll('svg');
        fireEvent.click(leftArrow);

        expect(handleEnter).toHaveBeenCalledWith(7);
    });

    it('right arrow calls handleEnter with null when input is empty', () => {
        const handleEnter = vi.fn();
        const { container } = render(
            <ControllerRelativeMove currentValue={10} handleEnter={handleEnter} />,
        );

        const [, rightArrow] = container.querySelectorAll('svg');
        fireEvent.click(rightArrow);

        expect(handleEnter).toHaveBeenCalledWith(null);
    });

    it('left arrow calls handleEnter with null when input is empty', () => {
        const handleEnter = vi.fn();
        const { container } = render(
            <ControllerRelativeMove currentValue={10} handleEnter={handleEnter} />,
        );

        const [leftArrow] = container.querySelectorAll('svg');
        fireEvent.click(leftArrow);

        expect(handleEnter).toHaveBeenCalledWith(null);
    });

    it('does not throw when arrows are clicked and handleEnter is not provided', () => {
        const { container } = render(<ControllerRelativeMove currentValue={5} />);
        const input = container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '2' } });

        const [leftArrow, rightArrow] = container.querySelectorAll('svg');
        expect(() => fireEvent.click(leftArrow)).not.toThrow();
        expect(() => fireEvent.click(rightArrow)).not.toThrow();
    });

    it('applies locked styles when locked is true', () => {
        const { container } = render(<ControllerRelativeMove currentValue={0} locked={true} />);
        expect(container.firstChild).toHaveClass('pointer-events-none', 'opacity-50');
    });

    it('does not apply locked styles when locked is false', () => {
        const { container } = render(<ControllerRelativeMove currentValue={0} locked={false} />);
        expect(container.firstChild).not.toHaveClass('pointer-events-none');
        expect(container.firstChild).not.toHaveClass('opacity-50');
    });

    it('applies a custom className', () => {
        const { container } = render(
            <ControllerRelativeMove currentValue={0} className="my-custom-class" />,
        );
        expect(container.firstChild).toHaveClass('my-custom-class');
    });

    it('handles negative currentValue correctly', () => {
        const handleEnter = vi.fn();
        const { container } = render(
            <ControllerRelativeMove currentValue={-5} handleEnter={handleEnter} />,
        );

        const input = container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '3' } });

        const [leftArrow, rightArrow] = container.querySelectorAll('svg');
        fireEvent.click(rightArrow);
        expect(handleEnter).toHaveBeenCalledWith(-2);

        fireEvent.click(leftArrow);
        expect(handleEnter).toHaveBeenCalledWith(-8);
    });
});
