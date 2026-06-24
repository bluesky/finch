import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Sidebar from '../../components/Sidebar';

describe('Sidebar Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<Sidebar />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders children', () => {
        render(
            <Sidebar>
                <div>Nav content</div>
            </Sidebar>,
        );
        expect(screen.getByText('Nav content')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
        render(<Sidebar title="My App" />);
        expect(screen.getByText('My App')).toBeInTheDocument();
    });

    it('does not render title when omitted', () => {
        render(<Sidebar />);
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    // --- Size ---

    it('applies medium width class by default', () => {
        const { container } = render(<Sidebar />);
        expect(container.firstChild).toHaveClass('w-64');
    });

    it('applies small width class', () => {
        const { container } = render(<Sidebar size="small" />);
        expect(container.firstChild).toHaveClass('w-48');
    });

    it('applies large width class', () => {
        const { container } = render(<Sidebar size="large" />);
        expect(container.firstChild).toHaveClass('w-96');
    });

    // --- collapsible ---

    it('does not render hamburger icon when collapsible is false', () => {
        render(<Sidebar collapsible={false} />);
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        // hamburger is a plain div, not a button — confirm no svg toggle wrapper
        expect(document.querySelector('[class*="hover:cursor-pointer"]')).not.toBeInTheDocument();
    });

    it('renders hamburger icon when collapsible is true', () => {
        render(<Sidebar collapsible={true} />);
        expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('collapses to narrow width when hamburger is clicked', () => {
        const { container } = render(<Sidebar collapsible={true} />);
        fireEvent.click(document.querySelector('[class*="hover:cursor-pointer"]')!);
        expect(container.firstChild).toHaveClass('w-10');
    });

    it('hides children when collapsed', () => {
        render(
            <Sidebar collapsible={true}>
                <div>Hidden content</div>
            </Sidebar>,
        );
        fireEvent.click(document.querySelector('[class*="hover:cursor-pointer"]')!);
        expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('hides title when collapsed', () => {
        render(<Sidebar collapsible={true} title="My App" />);
        fireEvent.click(document.querySelector('[class*="hover:cursor-pointer"]')!);
        expect(screen.queryByText('My App')).not.toBeInTheDocument();
    });

    it('re-expands after a second click', () => {
        const { container } = render(<Sidebar collapsible={true} />);
        const toggle = document.querySelector('[class*="hover:cursor-pointer"]')!;
        fireEvent.click(toggle);
        fireEvent.click(toggle);
        expect(container.firstChild).toHaveClass('w-64');
    });

    // --- className props ---

    it('applies custom className to the aside element', () => {
        const { container } = render(<Sidebar className="my-sidebar" />);
        expect(container.firstChild).toHaveClass('my-sidebar');
    });

    it('applies classNameTitle to the title element', () => {
        render(<Sidebar title="My App" classNameTitle="my-title" />);
        expect(screen.getByText('My App')).toHaveClass('my-title');
    });
});
