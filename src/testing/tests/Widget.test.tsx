import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Widget from '../../components/Widget';

describe('Widget', () => {
    // --- Rendering ---

    it('renders without crashing', () => {
        const { container } = render(<Widget />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the title', () => {
        render(<Widget title="My Widget" />);
        expect(screen.getByText('My Widget')).toBeInTheDocument();
    });

    it('renders children in the body', () => {
        render(
            <Widget>
                <span>child content</span>
            </Widget>,
        );
        expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it('renders the icon when provided', () => {
        render(<Widget icon={<svg data-testid="my-icon" />} />);
        expect(screen.getByTestId('my-icon')).toBeInTheDocument();
    });

    it('does not render an icon wrapper when icon is omitted', () => {
        const { container } = render(<Widget title="No Icon" />);
        // icon wrapper div only appears when icon is provided
        const header = container.querySelector('header');
        expect(header?.querySelector('.ml-2')).not.toBeInTheDocument();
    });

    // --- Expand / collapse ---

    it('shows the expand (arrows-out) icon by default', () => {
        const { container } = render(<Widget />);
        // arrowsPointingOut path has "M3.75 3.75v4.5"
        const paths = container.querySelectorAll('path');
        const hasOutArrows = Array.from(paths).some((p) =>
            p.getAttribute('d')?.includes('M3.75 3.75v4.5'),
        );
        expect(hasOutArrows).toBe(true);
    });

    it('switches to collapse (arrows-in) icon after clicking expand', () => {
        const { container } = render(<Widget />);
        const expandBtn = container.querySelector('.hover\\:cursor-pointer');
        fireEvent.click(expandBtn!);
        // arrowsPointingIn path has "M9 9V4.5"
        const paths = container.querySelectorAll('path');
        const hasInArrows = Array.from(paths).some((p) =>
            p.getAttribute('d')?.includes('M9 9V4.5'),
        );
        expect(hasInArrows).toBe(true);
    });

    it('applies expandedWidth class when expanded', () => {
        const { container } = render(<Widget expandedWidth="w-full" width="w-1/4" />);
        const expandBtn = container.querySelector('.hover\\:cursor-pointer');
        fireEvent.click(expandBtn!);
        expect(container.firstChild).toHaveClass('w-full');
    });

    it('removes expandedWidth and restores width/maxWidth when collapsed again', () => {
        const { container } = render(
            <Widget expandedWidth="w-full" width="w-1/4" maxWidth="max-w-xl" />,
        );
        const expandBtn = container.querySelector('.hover\\:cursor-pointer');
        fireEvent.click(expandBtn!); // expand
        fireEvent.click(expandBtn!); // collapse
        expect(container.firstChild).not.toHaveClass('w-full');
        expect(container.firstChild).toHaveClass('w-1/4');
        expect(container.firstChild).toHaveClass('max-w-xl');
    });

    // --- Size class props ---

    it('applies defaultHeight class', () => {
        const { container } = render(<Widget defaultHeight="h-96" />);
        expect(container.firstChild).toHaveClass('h-96');
    });

    it('applies minHeight class', () => {
        const { container } = render(<Widget minHeight="min-h-32" />);
        expect(container.firstChild).toHaveClass('min-h-32');
    });

    it('applies minWidth class', () => {
        const { container } = render(<Widget minWidth="min-w-48" />);
        expect(container.firstChild).toHaveClass('min-w-48');
    });

    it('applies contentStyles to the body div', () => {
        const { container } = render(<Widget contentStyles="overflow-hidden" />);
        const body = container.querySelector('.rounded-b-md');
        expect(body).toHaveClass('overflow-hidden');
    });
});
