import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Paper from '../../components/Paper';

describe('Paper Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<Paper />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders children', () => {
        render(
            <Paper>
                <div>Content</div>
            </Paper>,
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders a title when provided', () => {
        render(<Paper title="My Chart" />);
        expect(screen.getByText('My Chart')).toBeInTheDocument();
    });

    it('does not render a title element when title is omitted', () => {
        render(<Paper />);
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('applies a custom className', () => {
        const { container } = render(<Paper className="my-class" />);
        expect(container.firstChild).toHaveClass('my-class');
    });
});
