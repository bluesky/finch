import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import HubSidebar from '../../components/HubSidebar';
import { RouteItem } from '../../types/navigationRouterTypes';

const mockRoutes: RouteItem[] = [
    { path: '/home', label: 'Home', element: <div /> },
    { path: '/settings', label: 'Settings', element: <div /> },
    { path: '/about', label: 'About', element: <div /> },
];

function renderSidebar(initialPath = '/home', props = {}) {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <HubSidebar routes={mockRoutes} {...props} />
        </MemoryRouter>,
    );
}

describe('HubSidebar Component', () => {
    it('renders without crashing', () => {
        const { container } = renderSidebar();
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a nav link for each route', () => {
        renderSidebar();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('renders links pointing to the correct paths', () => {
        renderSidebar();
        const links = screen.getAllByRole('link');
        expect(links[0]).toHaveAttribute('href', '/home');
        expect(links[1]).toHaveAttribute('href', '/settings');
        expect(links[2]).toHaveAttribute('href', '/about');
    });

    it('applies the active class to the current route link', () => {
        renderSidebar('/home', { classNameActiveLink: 'active-test-class' });
        const homeLink = screen.getByText('Home').closest('a');
        expect(homeLink).toHaveClass('active-test-class');
    });

    it('does not apply the active class to inactive route links', () => {
        renderSidebar('/home', { classNameActiveLink: 'active-test-class' });
        const settingsLink = screen.getByText('Settings').closest('a');
        expect(settingsLink).not.toHaveClass('active-test-class');
    });

    it('applies classNameInactiveLink to inactive links', () => {
        renderSidebar('/home', { classNameInactiveLink: 'inactive-test-class' });
        const settingsLink = screen.getByText('Settings').closest('a');
        expect(settingsLink).toHaveClass('inactive-test-class');
    });

    it('renders route icons when provided', () => {
        const routesWithIcons: RouteItem[] = [
            {
                path: '/home',
                label: 'Home',
                element: <div />,
                icon: <svg data-testid="home-icon" />,
            },
        ];
        render(
            <MemoryRouter initialEntries={['/home']}>
                <HubSidebar routes={routesWithIcons} />
            </MemoryRouter>,
        );
        expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    });

    it('applies a custom className to the aside element', () => {
        const { container } = renderSidebar('/home', { className: 'my-sidebar-class' });
        expect(container.querySelector('aside')).toHaveClass('my-sidebar-class');
    });

    it('renders an aside as the root element', () => {
        const { container } = renderSidebar();
        expect(container.querySelector('aside')).toBeInTheDocument();
    });

    it('renders an empty sidebar when routes is an empty array', () => {
        render(
            <MemoryRouter>
                <HubSidebar routes={[]} />
            </MemoryRouter>,
        );
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
});
