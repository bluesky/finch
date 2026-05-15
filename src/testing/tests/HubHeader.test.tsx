import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HubHeader from '../../components/HubHeader';

describe('HubHeader Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<HubHeader />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the default title', () => {
        render(<HubHeader />);
        expect(screen.getByText('BEAMLINE APP')).toBeInTheDocument();
    });

    it('renders a custom title', () => {
        render(<HubHeader title="My Beamline" />);
        expect(screen.getByText('My Beamline')).toBeInTheDocument();
    });

    it('renders the default logo image', () => {
        const { container } = render(<HubHeader />);
        expect(container.querySelector('img')).toBeInTheDocument();
    });

    it('renders a custom logoUrl', () => {
        const { container } = render(<HubHeader logoUrl="/custom-logo.png" />);
        expect(container.querySelector('img')).toHaveAttribute('src', '/custom-logo.png');
    });

    it('does not render an image when logoUrl is empty string', () => {
        const { container } = render(<HubHeader logoUrl="" />);
        expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('renders rightSlot content', () => {
        render(<HubHeader rightSlot={<button>Open Shutter</button>} />);
        expect(screen.getByRole('button', { name: 'Open Shutter' })).toBeInTheDocument();
    });

    it('renders nothing in the right slot when rightSlot is not provided', () => {
        render(<HubHeader />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('applies a custom className to the header', () => {
        const { container } = render(<HubHeader className="my-header-class" />);
        expect(container.querySelector('header')).toHaveClass('my-header-class');
    });

    it('applies classNameTitle to the title element', () => {
        render(<HubHeader classNameTitle="text-red-500" />);
        expect(screen.getByRole('heading')).toHaveClass('text-red-500');
    });

    it('applies classNameImage to the logo image', () => {
        const { container } = render(<HubHeader classNameImage="rounded-full" />);
        expect(container.querySelector('img')).toHaveClass('rounded-full');
    });
});
