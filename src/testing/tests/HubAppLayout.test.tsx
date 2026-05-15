import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import HubAppLayout from '../../components/HubAppLayout';
import { RouteItem } from '../../types/navigationRouterTypes';

const mockRoutes: RouteItem[] = [
    { path: '/home', label: 'Home', element: <div>Home Page</div> },
    { path: '/settings', label: 'Settings', element: <div>Settings Page</div> },
];

function renderLayout(props = {}) {
    return render(
        <MemoryRouter initialEntries={['/home']}>
            <HubAppLayout routes={mockRoutes} {...props} />
        </MemoryRouter>,
    );
}

describe('HubAppLayout Component', () => {
    it('renders without crashing', () => {
        const { container } = renderLayout();
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders sidebar navigation links for each route', () => {
        renderLayout();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders the default header title', () => {
        renderLayout();
        expect(screen.getByText('BEAMLINE APP')).toBeInTheDocument();
    });

    it('renders a custom header title', () => {
        renderLayout({ headerTitle: 'My Beamline' });
        expect(screen.getByText('My Beamline')).toBeInTheDocument();
    });

    it('renders the active route content in main', () => {
        renderLayout();
        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('renders a header img with the default logo', () => {
        const { container } = renderLayout();
        const img = container.querySelector('header img');
        expect(img).toBeInTheDocument();
    });

    it('passes headerLogoUrl to the header image', () => {
        const { container } = renderLayout({ headerLogoUrl: '/custom-logo.png' });
        const img = container.querySelector('header img');
        expect(img).toHaveAttribute('src', '/custom-logo.png');
    });

    it('applies classNameHeader to the header element', () => {
        const { container } = renderLayout({ classNameHeader: 'my-header-class' });
        expect(container.querySelector('header')).toHaveClass('my-header-class');
    });

    it('applies classNameSidebar to the sidebar element', () => {
        const { container } = renderLayout({ classNameSidebar: 'my-sidebar-class' });
        expect(container.querySelector('aside')).toHaveClass('my-sidebar-class');
    });

    it('applies classNameMainContent to the main element', () => {
        const { container } = renderLayout({ classNameMainContent: 'my-main-class' });
        expect(container.querySelector('main')).toHaveClass('my-main-class');
    });

    it('applies a custom className to the root element', () => {
        const { container } = renderLayout({ className: 'my-root-class' });
        expect(container.firstChild).toHaveClass('my-root-class');
    });

    it('renders sidebar links for all routes', () => {
        const moreRoutes: RouteItem[] = [
            { path: '/a', label: 'Alpha', element: <div /> },
            { path: '/b', label: 'Beta', element: <div /> },
            { path: '/c', label: 'Gamma', element: <div /> },
        ];
        render(
            <MemoryRouter initialEntries={['/a']}>
                <HubAppLayout routes={moreRoutes} />
            </MemoryRouter>,
        );
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();
        expect(screen.getByText('Gamma')).toBeInTheDocument();
    });
});
