import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Main from '../../components/Main';

describe('Main Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<Main />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders children', () => {
        render(
            <Main>
                <div>Hello</div>
            </Main>,
        );
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('applies flex-wrap when flexWrap is true', () => {
        const { container } = render(<Main flexWrap={true} />);
        expect(container.firstChild).toHaveClass('flex-wrap');
    });

    it('does not apply flex-wrap when flexWrap is false', () => {
        const { container } = render(<Main flexWrap={false} />);
        expect(container.firstChild).not.toHaveClass('flex-wrap');
    });

    it('applies a custom className', () => {
        const { container } = render(<Main className="my-class" />);
        expect(container.firstChild).toHaveClass('my-class');
    });
});
