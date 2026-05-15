import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ButtonWithIcon from '../../components/ButtonWithIcon';

// Mock icon component for testing
const TestIcon = () => <svg data-testid="test-icon">test</svg>;

describe('ButtonWithIcon Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<ButtonWithIcon icon={<TestIcon />} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('displays the provided text and icon', () => {
        const buttonText = 'Click me';
        render(<ButtonWithIcon text={buttonText} icon={<TestIcon />} />);

        expect(screen.getByText(buttonText)).toBeInTheDocument();
        expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('calls callback function when clicked', () => {
        const mockCallback = vi.fn();
        render(<ButtonWithIcon text="Test Button" icon={<TestIcon />} onClick={mockCallback} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
        render(<ButtonWithIcon text="Disabled Button" icon={<TestIcon />} disabled={true} />);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('does not call callback when disabled and clicked', () => {
        const mockCallback = vi.fn();
        render(
            <ButtonWithIcon
                text="Disabled Button"
                icon={<TestIcon />}
                onClick={mockCallback}
                disabled={true}
            />,
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockCallback).not.toHaveBeenCalled();
    });

    it('positions icon on the left by default', () => {
        render(<ButtonWithIcon text="Left Icon" icon={<TestIcon />} />);

        const button = screen.getByRole('button');
        const flexContainer = button.querySelector('div');
        const children = Array.from(flexContainer?.children || []);

        // Icon should be first child when position is left
        expect(children[0]).toContainElement(screen.getByTestId('test-icon'));
        expect(children[1]).toHaveTextContent('Left Icon');
    });

    it('positions icon on the right when iconPosition is right', () => {
        render(<ButtonWithIcon text="Right Icon" icon={<TestIcon />} iconPosition="right" />);

        const button = screen.getByRole('button');
        const flexContainer = button.querySelector('div');
        const children = Array.from(flexContainer?.children || []);

        // Text should be first child when icon position is right
        expect(children[0]).toHaveTextContent('Right Icon');
        expect(children[1]).toContainElement(screen.getByTestId('test-icon'));
    });

    it('applies correct size classes for text', () => {
        const { container: smallContainer } = render(
            <ButtonWithIcon text="Small" icon={<TestIcon />} size="small" />,
        );
        const { container: mediumContainer } = render(
            <ButtonWithIcon text="Medium" icon={<TestIcon />} size="medium" />,
        );
        const { container: largeContainer } = render(
            <ButtonWithIcon text="Large" icon={<TestIcon />} size="large" />,
        );

        expect(smallContainer.firstChild).toHaveClass('text-sm', 'px-3', 'py-1');
        expect(mediumContainer.firstChild).toHaveClass('text-md', 'px-3', 'py-2');
        expect(largeContainer.firstChild).toHaveClass('text-2xl', 'px-6', 'py-3');
    });

    it('applies correct size classes for icon', () => {
        render(<ButtonWithIcon text="Test" icon={<TestIcon />} size="large" />);

        const iconContainer = screen.getByTestId('test-icon').parentElement;
        expect(iconContainer).toHaveClass('w-8');
    });

    it('applies correct spacing between icon and text', () => {
        render(<ButtonWithIcon text="Test" icon={<TestIcon />} size="large" />);

        const button = screen.getByRole('button');
        const flexContainer = button.querySelector('div');
        expect(flexContainer).toHaveClass('space-x-4');
    });

    it('applies secondary styling when isSecondary is true', () => {
        const { container } = render(
            <ButtonWithIcon text="Secondary" icon={<TestIcon />} isSecondary={true} />,
        );
        const button = container.firstChild;

        expect(button).toHaveClass('bg-white/50', 'text-black', 'border');
        expect(button).not.toHaveClass('bg-sky-500', 'text-white');
    });

    it('applies primary styling by default', () => {
        const { container } = render(<ButtonWithIcon text="Primary" icon={<TestIcon />} />);
        const button = container.firstChild;

        expect(button).toHaveClass('bg-sky-500', 'text-white');
    });

    it('applies primary active styling when active is true', () => {
        const { container } = render(
            <ButtonWithIcon text="Primary Active" icon={<TestIcon />} active={true} />,
        );
        const button = container.firstChild;

        expect(button).toHaveClass('bg-sky-700', 'text-white', 'hover:bg-sky-800');
        expect(button).not.toHaveClass('bg-sky-500', 'bg-slate-200');
    });

    it('applies secondary active styling when both active and isSecondary are true', () => {
        const { container } = render(
            <ButtonWithIcon
                text="Secondary Active"
                icon={<TestIcon />}
                active={true}
                isSecondary={true}
            />,
        );
        const button = container.firstChild;

        expect(button).toHaveClass('bg-slate-200', 'text-black', 'border', 'hover:bg-slate-300');
        expect(button).not.toHaveClass('bg-sky-500', 'bg-sky-700', 'bg-white/50');
    });

    it('sets aria-pressed when active is true', () => {
        render(<ButtonWithIcon text="Active" icon={<TestIcon />} active={true} />);
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('sets aria-pressed to false when active is false', () => {
        render(<ButtonWithIcon text="Inactive" icon={<TestIcon />} active={false} />);
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('does not set aria-pressed when active is not provided', () => {
        render(<ButtonWithIcon text="Default" icon={<TestIcon />} />);
        expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
    });

    it('applies secondary icon styling when isSecondary is true', () => {
        render(<ButtonWithIcon text="Secondary" icon={<TestIcon />} isSecondary={true} />);

        const iconContainer = screen.getByTestId('test-icon').parentElement;
        expect(iconContainer).toHaveClass('text-black');
    });

    it('applies primary icon styling by default', () => {
        render(<ButtonWithIcon text="Primary" icon={<TestIcon />} />);

        const iconContainer = screen.getByTestId('test-icon').parentElement;
        expect(iconContainer).toHaveClass('text-white');
    });

    it('merges custom className with default classes', () => {
        const customClass = 'custom-test-class';
        const { container } = render(
            <ButtonWithIcon text="Custom" icon={<TestIcon />} className={customClass} />,
        );
        const button = container.firstChild;

        expect(button).toHaveClass(customClass);
        expect(button).toHaveClass('rounded-lg', 'font-medium', 'w-fit');
    });

    it('applies custom text className', () => {
        const customTextClass = 'custom-text-class';
        render(
            <ButtonWithIcon
                text="Custom Text"
                icon={<TestIcon />}
                classNameText={customTextClass}
            />,
        );
        const textElement = screen.getByText('Custom Text');

        expect(textElement).toHaveClass(customTextClass);
    });

    it('applies custom icon className', () => {
        const customIconClass = 'custom-icon-class';
        render(<ButtonWithIcon text="Test" icon={<TestIcon />} classNameIcon={customIconClass} />);

        const iconContainer = screen.getByTestId('test-icon').parentElement;
        expect(iconContainer).toHaveClass(customIconClass);
    });

    it('handles empty text gracefully', () => {
        render(<ButtonWithIcon text="" icon={<TestIcon />} />);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('prevents default on click', () => {
        const mockCallback = vi.fn();
        render(<ButtonWithIcon text="Test" icon={<TestIcon />} onClick={mockCallback} />);

        const button = screen.getByRole('button');
        const clickEvent = new MouseEvent('click', { bubbles: true });
        const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

        fireEvent(button, clickEvent);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('passes through additional props', () => {
        render(
            <ButtonWithIcon
                text="Test"
                icon={<TestIcon />}
                data-testid="custom-button"
                aria-label="Custom Label"
            />,
        );
        const button = screen.getByTestId('custom-button');

        expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });
});
