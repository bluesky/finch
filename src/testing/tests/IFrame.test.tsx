import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/hooks/useResizeObserver', () => ({
    default: () => ({ containerRef: { current: null }, dimensions: { width: 800, height: 600 } }),
}));

import IFrame from '../../components/IFrame';

// ── No URL ────────────────────────────────────────────────────────────────────

describe('IFrame — no url', () => {
    it('renders without crashing', () => {
        const { container } = render(<IFrame />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('shows the placeholder heading', () => {
        render(<IFrame />);
        expect(screen.getByText('IFrame Component')).toBeInTheDocument();
    });

    it('shows the placeholder instruction text', () => {
        render(<IFrame />);
        expect(screen.getByText(/Provide a url/i)).toBeInTheDocument();
    });

    it('does not render an iframe element', () => {
        render(<IFrame />);
        expect(document.querySelector('iframe')).not.toBeInTheDocument();
    });

    it('applies background classes by default', () => {
        render(<IFrame />);
        expect(document.querySelector('section')).toHaveClass('bg-stone-400/50');
    });

    it('omits background classes when addBackground is false', () => {
        render(<IFrame addBackground={false} />);
        expect(document.querySelector('section')).toHaveClass('p-0');
        expect(document.querySelector('section')).not.toHaveClass('bg-stone-400/50');
    });

    it('applies custom className to the section', () => {
        render(<IFrame className="my-frame" />);
        expect(document.querySelector('section')).toHaveClass('my-frame');
    });

    it('uses fixed-size classes when isSizeResponsive is false (default)', () => {
        render(<IFrame />);
        expect(document.querySelector('section')).toHaveClass('w-fit');
    });

    it('uses responsive classes when isSizeResponsive is true', () => {
        render(<IFrame isSizeResponsive />);
        expect(document.querySelector('section')).toHaveClass('w-full');
    });
});

// ── With URL ──────────────────────────────────────────────────────────────────

describe('IFrame — with url', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders an iframe with the correct src', () => {
        render(<IFrame url="https://example.com" />);
        expect(document.querySelector('iframe')).toHaveAttribute('src', 'https://example.com');
    });

    it('forwards the title prop to the iframe', () => {
        render(<IFrame url="https://example.com" title="My Frame" />);
        expect(document.querySelector('iframe')).toHaveAttribute('title', 'My Frame');
    });

    it('shows loading overlay before iframe loads', () => {
        render(<IFrame url="https://example.com" />);
        expect(screen.getByText('Loading preview...')).toBeInTheDocument();
    });

    it('hides loading overlay after iframe fires onLoad', () => {
        render(<IFrame url="https://example.com" />);
        fireEvent.load(document.querySelector('iframe')!);
        expect(screen.queryByText('Loading preview...')).not.toBeInTheDocument();
    });

    it('iframe starts with opacity-0 before load', () => {
        render(<IFrame url="https://example.com" />);
        expect(document.querySelector('iframe')).toHaveClass('opacity-0');
    });

    it('iframe becomes opacity-100 after load', () => {
        render(<IFrame url="https://example.com" />);
        fireEvent.load(document.querySelector('iframe')!);
        expect(document.querySelector('iframe')).toHaveClass('opacity-100');
    });

    it('does not show error overlay before timeout', () => {
        render(<IFrame url="https://example.com" timeoutMs={2000} />);
        act(() => {
            vi.advanceTimersByTime(1999);
        });
        expect(screen.queryByText(/Could not load/i)).not.toBeInTheDocument();
    });

    it('shows error overlay after timeout without a load event', async () => {
        render(<IFrame url="https://example.com" timeoutMs={2000} />);
        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(
            screen.getByText(/Could not load the page at https:\/\/example\.com/),
        ).toBeInTheDocument();
    });

    it('error overlay includes the url', () => {
        render(<IFrame url="https://example.com" timeoutMs={1000} />);
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(screen.getByText(/https:\/\/example\.com/)).toBeInTheDocument();
    });

    it('shows Retry button in error overlay', () => {
        render(<IFrame url="https://example.com" timeoutMs={1000} />);
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('shows "Open in new tab" link in error overlay', () => {
        render(<IFrame url="https://example.com" timeoutMs={1000} />);
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        const link = screen.getByRole('link', { name: 'Open in new tab' });
        expect(link).toHaveAttribute('href', 'https://example.com');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('does not show error overlay when iframe loads before timeout', () => {
        render(<IFrame url="https://example.com" timeoutMs={2000} />);
        fireEvent.load(document.querySelector('iframe')!);
        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(screen.queryByText(/Could not load/i)).not.toBeInTheDocument();
    });

    it('clicking Retry remounts the iframe (resets loading state)', () => {
        render(<IFrame url="https://example.com" timeoutMs={1000} />);
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
        // After retry the loading overlay reappears (iframe is remounted, not yet loaded)
        expect(screen.getByText('Loading preview...')).toBeInTheDocument();
        expect(screen.queryByText(/Could not load/i)).not.toBeInTheDocument();
    });

    it('applies default fixed dimensions to the iframe', () => {
        render(<IFrame url="https://example.com" />);
        const iframe = document.querySelector('iframe')!;
        expect(iframe).toHaveAttribute('width', '1000');
        expect(iframe).toHaveAttribute('height', '1000');
    });

    it('applies custom dimensions to the iframe', () => {
        render(<IFrame url="https://example.com" width={640} height={480} />);
        const iframe = document.querySelector('iframe')!;
        expect(iframe).toHaveAttribute('width', '640');
        expect(iframe).toHaveAttribute('height', '480');
    });

    it('uses ResizeObserver dimensions when isSizeResponsive is true', () => {
        render(<IFrame url="https://example.com" isSizeResponsive />);
        const iframe = document.querySelector('iframe')!;
        // useResizeObserver mock returns { width: 800, height: 600 }
        expect(iframe).toHaveAttribute('width', '800');
        expect(iframe).toHaveAttribute('height', '600');
    });
});
