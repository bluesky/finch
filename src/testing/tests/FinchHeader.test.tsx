import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FinchHeader from '../../components/FinchAppLayout/FinchHeader';

describe('FinchHeader Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<FinchHeader />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the default title', () => {
        render(<FinchHeader />);
        expect(screen.getByText('BEAMLINE APP')).toBeInTheDocument();
    });

    it('renders a custom title', () => {
        render(<FinchHeader title="My Beamline" />);
        expect(screen.getByText('My Beamline')).toBeInTheDocument();
    });

    it('renders the default logo image', () => {
        const { container } = render(<FinchHeader />);
        expect(container.querySelector('img')).toBeInTheDocument();
    });

    it('renders a custom logoUrl', () => {
        const { container } = render(<FinchHeader logoUrl="/custom-logo.png" />);
        expect(container.querySelector('img')).toHaveAttribute('src', '/custom-logo.png');
    });

    it('does not render an image when logoUrl is empty string', () => {
        const { container } = render(<FinchHeader logoUrl="" />);
        expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('renders rightSlot content', () => {
        render(<FinchHeader rightSlot={<button>Open Shutter</button>} />);
        expect(screen.getByRole('button', { name: 'Open Shutter' })).toBeInTheDocument();
    });

    it('renders nothing in the right slot when rightSlot is not provided', () => {
        render(<FinchHeader />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('applies a custom className to the header', () => {
        const { container } = render(<FinchHeader className="my-header-class" />);
        expect(container.querySelector('header')).toHaveClass('my-header-class');
    });

    it('applies classNameTitle to the title element', () => {
        render(<FinchHeader classNameTitle="text-red-500" />);
        expect(screen.getByRole('heading')).toHaveClass('text-red-500');
    });

    it('applies classNameImage to the logo image', () => {
        const { container } = render(<FinchHeader classNameImage="rounded-full" />);
        expect(container.querySelector('img')).toHaveClass('rounded-full');
    });

    it('renders the page title after the title', () => {
        render(<FinchHeader title="My Beamline" pageTitle="Explorer" />);
        const title = screen.getByText('My Beamline');
        const pageTitle = screen.getByText('Explorer');
        expect(title.compareDocumentPosition(pageTitle)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('renders no page title when pageTitle is not provided', () => {
        render(<FinchHeader title="My Beamline" />);
        expect(screen.queryByText('Explorer')).not.toBeInTheDocument();
    });

    it('applies classNamePageTitle to the page title element', () => {
        render(<FinchHeader pageTitle="Explorer" classNamePageTitle="text-red-500" />);
        expect(screen.getByText('Explorer')).toHaveClass('text-red-500');
    });
});
