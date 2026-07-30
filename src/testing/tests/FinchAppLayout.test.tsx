import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import FinchAppLayout, {
    FinchAppLayoutProps,
} from '../../components/FinchAppLayout/FinchAppLayout';
import { RouteItem } from '../../types/navigationRouterTypes';

const mockRoutes: RouteItem[] = [
    { path: '/home', label: 'Home', element: <div>Home Page</div> },
    { path: '/settings', label: 'Settings', element: <div>Settings Page</div> },
];

type RenderLayoutOptions = Partial<FinchAppLayoutProps> & { path?: string };

function renderLayout({ routes = mockRoutes, path = '/home', ...props }: RenderLayoutOptions = {}) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <FinchAppLayout routes={routes} {...props} />
        </MemoryRouter>,
    );
}

describe('FinchAppLayout Component', () => {
    it('renders without crashing', () => {
        const { container } = renderLayout();
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders sidebar navigation links for each route', () => {
        const { container } = renderLayout();
        const sidebar = within(container.querySelector('aside') as HTMLElement);
        expect(sidebar.getByText('Home')).toBeInTheDocument();
        expect(sidebar.getByText('Settings')).toBeInTheDocument();
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

    it('renders the active route label as the header page title', () => {
        const { container } = renderLayout();
        expect(container.querySelector('header')).toHaveTextContent('Home');
    });

    it('renders no header page title for a route that opts out', () => {
        const optedOut: RouteItem[] = [
            { path: '/home', label: 'Home', element: <div />, showPageTitle: false },
        ];
        const { container } = renderLayout({ routes: optedOut });
        expect(container.querySelector('header')).not.toHaveTextContent('Home');
    });

    it('renders no header page title at the root route by default', () => {
        const rootRoutes: RouteItem[] = [{ path: '/', label: 'Overview', element: <div /> }];
        const { container } = renderLayout({ routes: rootRoutes, path: '/' });
        expect(container.querySelector('header')).not.toHaveTextContent('Overview');
    });

    it('renders the header page title at the root route when it opts in', () => {
        const rootRoutes: RouteItem[] = [
            { path: '/', label: 'Overview', element: <div />, showPageTitle: true },
        ];
        const { container } = renderLayout({ routes: rootRoutes, path: '/' });
        expect(container.querySelector('header')).toHaveTextContent('Overview');
    });

    it('applies classNameHeaderPageTitle to the header page title', () => {
        renderLayout({ classNameHeaderPageTitle: 'text-red-500' });
        expect(screen.getByText('Home', { selector: 'header span' })).toHaveClass('text-red-500');
    });

    it('keeps a tabbed route active when a dynamic sibling could also match', () => {
        const withDynamicSibling: RouteItem[] = [
            {
                path: '/data',
                label: 'Data',
                tabs: [{ path: 'details', label: 'Details', element: <div>Details Tab</div> }],
            },
            { path: '/data/:id', label: 'Data Item', element: <div>Item Page</div> },
        ];
        const { container } = renderLayout({
            routes: withDynamicSibling,
            path: '/data/details',
        });
        expect(screen.getByText('Data', { selector: 'header span' })).toBeInTheDocument();
        expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('renders sidebar links for all routes', () => {
        const moreRoutes: RouteItem[] = [
            { path: '/a', label: 'Alpha', element: <div /> },
            { path: '/b', label: 'Beta', element: <div /> },
            { path: '/c', label: 'Gamma', element: <div /> },
        ];
        const { container } = renderLayout({ routes: moreRoutes, path: '/a' });
        const sidebar = within(container.querySelector('aside') as HTMLElement);
        expect(sidebar.getByText('Alpha')).toBeInTheDocument();
        expect(sidebar.getByText('Beta')).toBeInTheDocument();
        expect(sidebar.getByText('Gamma')).toBeInTheDocument();
    });

    it('applies classNamePageTabs to the tab strip', () => {
        const tabbedRoutes: RouteItem[] = [
            {
                path: '/explorer',
                label: 'Explorer',
                tabs: [{ path: 'live', label: 'Live', element: <div>Live Tab</div> }],
            },
        ];
        const { container } = renderLayout({
            routes: tabbedRoutes,
            path: '/explorer/live',
            classNamePageTabs: 'my-tabs-class',
        });
        expect(container.querySelector('nav')).toHaveClass('my-tabs-class');
    });
});
