import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../../components/Button';

describe('Button Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<Button />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('displays the provided text', () => {
        const buttonText = 'Click me';
        render(<Button text={buttonText} />);
        expect(screen.getByText(buttonText)).toBeInTheDocument();
    });

    it('calls callback function when clicked', () => {
        const mockCallback = vi.fn();
        render(<Button text="Test Button" onClick={mockCallback} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('passes event to callback function', () => {
        const mockCallback = vi.fn();
        render(<Button text="Test Button" onClick={mockCallback} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockCallback).toHaveBeenCalledWith(expect.any(Object));
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button text="Disabled Button" disabled={true} />);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('does not call callback when disabled and clicked', () => {
        const mockCallback = vi.fn();
        render(<Button text="Disabled Button" onClick={mockCallback} disabled={true} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockCallback).not.toHaveBeenCalled();
    });

    it('applies correct size classes', () => {
        const { container: smallContainer } = render(<Button text="Small" size="small" />);
        const { container: mediumContainer } = render(<Button text="Medium" size="medium" />);
        const { container: largeContainer } = render(<Button text="Large" size="large" />);

        expect(smallContainer.firstChild).toHaveClass('text-sm', 'px-3', 'py-1');
        expect(mediumContainer.firstChild).toHaveClass('text-md', 'px-3', 'py-2');
        expect(largeContainer.firstChild).toHaveClass('text-2xl', 'px-6', 'py-3');
    });

    it('applies secondary styling when isSecondary is true', () => {
        const { container } = render(<Button text="Secondary" isSecondary={true} />);
        const button = container.firstChild;

        expect(button).toHaveClass('bg-transparent', 'text-black', 'border');
        expect(button).not.toHaveClass('bg-sky-500', 'text-white');
    });

    it('applies primary styling by default', () => {
        const { container } = render(<Button text="Primary" />);
        const button = container.firstChild;

        expect(button).toHaveClass('bg-sky-500', 'text-white');
        expect(button).not.toHaveClass('bg-transparent', 'text-black', 'border');
    });

    it('merges custom className with default classes', () => {
        const customClass = 'custom-test-class';
        const { container } = render(<Button text="Custom" className={customClass} />);
        const button = container.firstChild;

        expect(button).toHaveClass(customClass);
        expect(button).toHaveClass('rounded-xl', 'font-medium', 'w-fit');
    });

    it('applies custom text className', () => {
        const customTextClass = 'custom-text-class';
        render(<Button text="Custom Text" classNameText={customTextClass} />);
        const textElement = screen.getByText('Custom Text');

        expect(textElement).toHaveClass(customTextClass);
    });

    it('handles empty text gracefully', () => {
        render(<Button text="" />);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button.firstChild).toContainHTML('<p>');
    });

    it('prevents default on click', () => {
        const mockCallback = vi.fn();
        render(<Button text="Test" onClick={mockCallback} />);

        const button = screen.getByRole('button');
        const clickEvent = new MouseEvent('click', { bubbles: true });
        const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

        fireEvent(button, clickEvent);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('handles no callback gracefully', () => {
        render(<Button text="No Callback" />);
        const button = screen.getByRole('button');

        expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('passes through additional props', () => {
        render(<Button text="Test" data-testid="custom-button" aria-label="Custom Label" />);
        const button = screen.getByTestId('custom-button');

        expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('applies primary styling when not active and not secondary', () => {
        const { container } = render(<Button text="Primary" />);
        const button = container.firstChild;

        expect(button).toHaveClass('bg-sky-500', 'text-white', 'hover:bg-sky-600');
        expect(button).not.toHaveClass('bg-sky-700', 'bg-transparent', 'bg-slate-200');
    });

    it('applies primary active styling when active is true', () => {
        const { container } = render(<Button text="Primary Active" active={true} />);
        const button = container.firstChild;

        expect(button).toHaveClass('bg-sky-700', 'text-white', 'hover:bg-sky-800');
        expect(button).not.toHaveClass('bg-sky-500', 'bg-transparent', 'bg-slate-200');
    });

    it('applies secondary styling when isSecondary is true and not active', () => {
        const { container } = render(<Button text="Secondary" isSecondary={true} />);
        const button = container.firstChild;

        expect(button).toHaveClass('bg-transparent', 'text-black', 'border', 'hover:bg-slate-100');
        expect(button).not.toHaveClass('bg-sky-500', 'bg-sky-700', 'bg-slate-200');
    });

    it('applies secondary active styling when both active and isSecondary are true', () => {
        const { container } = render(
            <Button text="Secondary Active" active={true} isSecondary={true} />,
        );
        const button = container.firstChild;

        expect(button).toHaveClass('bg-slate-200', 'text-black', 'border', 'hover:bg-slate-300');
        expect(button).not.toHaveClass('bg-sky-500', 'bg-sky-700', 'bg-transparent');
    });
});
