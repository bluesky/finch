import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Bento from '../../components/Bento';

describe('Bento Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<Bento />);
        const bentoElement = container.firstChild;
        expect(bentoElement).toBeInTheDocument();
    });

    it('renders children when provided', () => {
        render(
            <Bento>
                <div data-testid="child-1">Child 1</div>
                <div data-testid="child-2">Child 2</div>
            </Bento>,
        );

        expect(screen.getByTestId('child-1')).toBeInTheDocument();
        expect(screen.getByTestId('child-2')).toBeInTheDocument();
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('applies default CSS classes', () => {
        const { container } = render(<Bento />);
        const bentoElement = container.firstChild;

        expect(bentoElement).toHaveClass('flex');
        expect(bentoElement).toHaveClass('flex-wrap');
        expect(bentoElement).toHaveClass('gap-8');
        expect(bentoElement).toHaveClass('w-full');
    });

    it('merges custom className with default classes', () => {
        const customClass = 'custom-class bg-red-500';
        const { container } = render(<Bento className={customClass} />);
        const bentoElement = container.firstChild;

        // Should have default classes
        expect(bentoElement).toHaveClass('flex');
        expect(bentoElement).toHaveClass('flex-wrap');
        expect(bentoElement).toHaveClass('gap-8');
        expect(bentoElement).toHaveClass('w-full');

        // Should also have custom classes
        expect(bentoElement).toHaveClass('custom-class');
        expect(bentoElement).toHaveClass('bg-red-500');
    });

    it('renders as a div element', () => {
        const { container } = render(<Bento />);
        expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('handles empty children gracefully', () => {
        const { container } = render(<Bento>{null}</Bento>);
        const bentoElement = container.firstChild;
        expect(bentoElement).toBeInTheDocument();
        expect(bentoElement).toBeEmptyDOMElement();
    });

    it('handles multiple types of children', () => {
        render(
            <Bento>
                <span>Text child</span>
                <button>Button child</button>
                <div>
                    <p>Nested child</p>
                </div>
                Plain text
            </Bento>,
        );

        expect(screen.getByText('Text child')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Button child' })).toBeInTheDocument();
        expect(screen.getByText('Nested child')).toBeInTheDocument();
        expect(screen.getByText('Plain text')).toBeInTheDocument();
    });

    it('handles className override scenarios with cn utility', () => {
        // Test that conflicting classes are properly handled by the cn utility
        const { container, rerender } = render(<Bento className="gap-4" />);
        let bentoElement = container.firstChild;

        // The cn utility should merge classes properly
        // gap-4 should override the default gap-8
        expect(bentoElement).toHaveClass('gap-4');
        expect(bentoElement).not.toHaveClass('gap-8');

        // Test with width override
        rerender(<Bento className="w-1/2" />);
        bentoElement = container.firstChild;
        expect(bentoElement).toHaveClass('w-1/2');
        expect(bentoElement).not.toHaveClass('w-full');
    });

    it('maintains component structure with various prop combinations', () => {
        const { container } = render(
            <Bento className="additional-class">
                <div>Test content</div>
            </Bento>,
        );

        const bentoElement = container.firstChild;
        expect(bentoElement?.nodeName).toBe('DIV');
        expect(bentoElement).toHaveClass('flex', 'flex-wrap', 'additional-class');
        expect(screen.getByText('Test content')).toBeInTheDocument();
    });
});
