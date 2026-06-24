import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '../../components/Header';

describe('Header Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<Header />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the default title', () => {
        render(<Header />);
        expect(screen.getByText('My App')).toBeInTheDocument();
    });

    it('renders a custom title', () => {
        render(<Header title="My Beamline" />);
        expect(screen.getByText('My Beamline')).toBeInTheDocument();
    });

    it('renders the default logo image', () => {
        const { container } = render(<Header />);
        const img = container.querySelector('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', '/finchIconCircle.png');
    });

    it('renders a custom logo url', () => {
        const { container } = render(<Header logoUrl="/custom-logo.png" />);
        const img = container.querySelector('img');
        expect(img).toHaveAttribute('src', '/custom-logo.png');
    });

    it('does not render an image when logoUrl is empty string', () => {
        const { container } = render(<Header logoUrl="" />);
        expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('applies a custom className to the root element', () => {
        const { container } = render(<Header className="my-custom-class" />);
        expect(container.firstChild).toHaveClass('my-custom-class');
    });

    it('applies a custom classNameText to the title', () => {
        render(<Header classNameText="text-red-500" />);
        expect(screen.getByRole('heading')).toHaveClass('text-red-500');
    });

    it('applies a custom classNameImage to the logo', () => {
        const { container } = render(<Header classNameImage="rounded-full" />);
        expect(container.querySelector('img')).toHaveClass('rounded-full');
    });
});
