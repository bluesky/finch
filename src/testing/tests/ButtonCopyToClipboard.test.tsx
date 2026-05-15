import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ButtonCopyToClipboard from '../../components/ButtonCopyToClipboard';

// Mock the clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn(),
    },
});

describe('ButtonCopyToClipboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        const { container } = render(<ButtonCopyToClipboard copyText="test" />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('displays the clipboard icon by default', () => {
        render(<ButtonCopyToClipboard copyText="test" />);
        const button = screen.getByRole('button');

        // Should contain SVG with clipboard path
        const svg = button.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('copies text to clipboard when clicked', async () => {
        const testText = 'Hello, World!';
        const mockWriteText = vi.mocked(navigator.clipboard.writeText);
        mockWriteText.mockResolvedValue(undefined);

        render(<ButtonCopyToClipboard copyText={testText} />);
        const button = screen.getByRole('button');

        fireEvent.click(button);

        expect(mockWriteText).toHaveBeenCalledWith(testText);
    });

    it('calls callback function after successful copy', async () => {
        const mockCallback = vi.fn();
        const mockWriteText = vi.mocked(navigator.clipboard.writeText);
        mockWriteText.mockResolvedValue(undefined);

        render(<ButtonCopyToClipboard copyText="test" onClick={mockCallback} />);
        const button = screen.getByRole('button');

        fireEvent.click(button);

        await waitFor(() => {
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });
    });

    it('shows check icon after successful copy', async () => {
        const mockWriteText = vi.mocked(navigator.clipboard.writeText);
        mockWriteText.mockResolvedValue(undefined);

        render(<ButtonCopyToClipboard copyText="test" />);
        const button = screen.getByRole('button');

        fireEvent.click(button);

        await waitFor(() => {
            // Should show the checkmark icon after copy
            const svg = button.querySelector('svg');
            const path = svg?.querySelector('path');
            expect(path?.getAttribute('d')).toContain('1.5 1.5 3-3.75'); // Part of checkmark path
        });
    });

    it('changes button color after successful copy', async () => {
        const mockWriteText = vi.mocked(navigator.clipboard.writeText);
        mockWriteText.mockResolvedValue(undefined);

        render(<ButtonCopyToClipboard copyText="test" />);
        const button = screen.getByRole('button');

        // Should start with slate color
        expect(button).toHaveClass('text-slate-400');

        fireEvent.click(button);

        await waitFor(() => {
            expect(button).toHaveClass('text-sky-500');
        });
    });

    it('handles clipboard write failure gracefully', async () => {
        const mockWriteText = vi.mocked(navigator.clipboard.writeText);
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockWriteText.mockRejectedValue(new Error('Clipboard failed'));

        render(<ButtonCopyToClipboard copyText="test" />);
        const button = screen.getByRole('button');

        fireEvent.click(button);

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalledWith('Failed to copy: ', expect.any(Error));
        });

        consoleError.mockRestore();
    });

    it('applies correct size classes', () => {
        const { container: smallContainer } = render(
            <ButtonCopyToClipboard copyText="test" size="small" />,
        );
        const { container: mediumContainer } = render(
            <ButtonCopyToClipboard copyText="test" size="medium" />,
        );
        const { container: largeContainer } = render(
            <ButtonCopyToClipboard copyText="test" size="large" />,
        );

        expect(smallContainer.firstChild).toHaveClass('h-6');
        expect(mediumContainer.firstChild).toHaveClass('h-10');
        expect(largeContainer.firstChild).toHaveClass('h-16');
    });

    it('maintains aspect ratio for all sizes', () => {
        const { container } = render(<ButtonCopyToClipboard copyText="test" size="large" />);
        const button = container.firstChild;

        expect(button).toHaveClass('aspect-square');
    });

    it('applies default medium size when no size specified', () => {
        const { container } = render(<ButtonCopyToClipboard copyText="test" />);
        const button = container.firstChild;

        expect(button).toHaveClass('h-10');
    });

    it('merges custom className with default classes', () => {
        const customClass = 'custom-test-class';
        const { container } = render(
            <ButtonCopyToClipboard copyText="test" className={customClass} />,
        );
        const button = container.firstChild;

        expect(button).toHaveClass(customClass);
        expect(button).toHaveClass('aspect-square', 'hover:text-sky-300', 'hover:cursor-pointer');
    });

    it('applies hover effects', () => {
        const { container } = render(<ButtonCopyToClipboard copyText="test" />);
        const button = container.firstChild;

        expect(button).toHaveClass('hover:text-sky-300', 'hover:cursor-pointer');
    });

    it('prevents default behavior on click', () => {
        const mockWriteText = vi.mocked(navigator.clipboard.writeText);
        mockWriteText.mockResolvedValue(undefined);

        render(<ButtonCopyToClipboard copyText="test" />);
        const button = screen.getByRole('button');

        const clickEvent = new MouseEvent('click', { bubbles: true });
        const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

        fireEvent(button, clickEvent);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('handles empty copyText', async () => {
        const mockWriteText = vi.mocked(navigator.clipboard.writeText);
        mockWriteText.mockResolvedValue(undefined);

        render(<ButtonCopyToClipboard copyText="" />);
        const button = screen.getByRole('button');

        fireEvent.click(button);

        expect(mockWriteText).toHaveBeenCalledWith('');
    });

    it('handles special characters in copyText', async () => {
        const specialText = 'Special chars: !@#$%^&*()_+{}|:"<>?';
        const mockWriteText = vi.mocked(navigator.clipboard.writeText);
        mockWriteText.mockResolvedValue(undefined);

        render(<ButtonCopyToClipboard copyText={specialText} />);
        const button = screen.getByRole('button');

        fireEvent.click(button);

        expect(mockWriteText).toHaveBeenCalledWith(specialText);
    });

    it('handles multiline text', async () => {
        const multilineText = 'Line 1\nLine 2\nLine 3';
        const mockWriteText = vi.mocked(navigator.clipboard.writeText);
        mockWriteText.mockResolvedValue(undefined);

        render(<ButtonCopyToClipboard copyText={multilineText} />);
        const button = screen.getByRole('button');

        fireEvent.click(button);

        expect(mockWriteText).toHaveBeenCalledWith(multilineText);
    });

    it('passes through additional props', () => {
        render(
            <ButtonCopyToClipboard
                copyText="test"
                data-testid="custom-copy-button"
                aria-label="Copy to clipboard"
            />,
        );
        const button = screen.getByTestId('custom-copy-button');

        expect(button).toHaveAttribute('aria-label', 'Copy to clipboard');
    });
});
