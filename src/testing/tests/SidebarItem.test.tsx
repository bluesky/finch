import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SidebarItem from '../../components/SidebarItem';

describe('SidebarItem Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<SidebarItem />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders title when provided', () => {
        render(<SidebarItem title="Settings" />);
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders children', () => {
        render(
            <SidebarItem>
                <span>Child content</span>
            </SidebarItem>,
        );
        expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('renders icon when provided', () => {
        const icon = <svg data-testid="test-icon" />;
        render(<SidebarItem icon={icon} />);
        expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('does not render icon wrapper when icon is omitted', () => {
        render(<SidebarItem title="No Icon" classNameIcon="my-icon-class" />);
        // icon wrapper div has classNameIcon class — should not be present
        expect(document.querySelector('.my-icon-class')).not.toBeInTheDocument();
    });

    it('applies className to root element', () => {
        const { container } = render(<SidebarItem className="my-item" />);
        expect(container.firstChild).toHaveClass('my-item');
    });

    it('applies classNameTitle to the heading', () => {
        render(<SidebarItem title="Title" classNameTitle="my-title" />);
        expect(screen.getByRole('heading')).toHaveClass('my-title');
    });

    it('applies classNameIcon to the icon wrapper', () => {
        render(<SidebarItem icon={<svg />} classNameIcon="my-icon" />);
        expect(document.querySelector('.my-icon')).toBeInTheDocument();
    });

    it('applies classNameChildren to the children wrapper', () => {
        render(
            <SidebarItem classNameChildren="my-children">
                <span>x</span>
            </SidebarItem>,
        );
        expect(document.querySelector('.my-children')).toBeInTheDocument();
    });
});
