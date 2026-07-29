import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import FinchMainContent, { FinchMainContentProps } from '../../components/FinchMainContent';
import { RouteItem } from '../../types/navigationRouterTypes';

const mockRoutes: RouteItem[] = [
    { path: '/home', label: 'Home', element: <div>Home Page</div> },
    { path: '/settings', label: 'Settings', element: <div>Settings Page</div> },
];

const tabbedRoutes: RouteItem[] = [
    { path: '/home', label: 'Home', element: <div>Home Page</div> },
    {
        path: '/explorer',
        label: 'Explorer',
        tabs: [
            { path: 'live', label: 'Live', element: <div>Live Tab</div> },
            { path: 'explore', label: 'Explore', element: <div>Explore Tab</div> },
        ],
    },
];

type RenderContentOptions = Partial<FinchMainContentProps> & { path?: string };

function renderContent({
    routes = mockRoutes,
    path = '/home',
    ...props
}: RenderContentOptions = {}) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <FinchMainContent routes={routes} {...props} />
        </MemoryRouter>,
    );
}

describe('FinchMainContent Component', () => {
    it('renders without crashing', () => {
        const { container } = renderContent();
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the matched route element', () => {
        renderContent({ path: '/home' });
        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('renders a different matched route element', () => {
        renderContent({ path: '/settings' });
        expect(screen.getByText('Settings Page')).toBeInTheDocument();
    });

    it('does not render a non-active route element', () => {
        renderContent({ path: '/home' });
        expect(screen.queryByText('Settings Page')).not.toBeInTheDocument();
    });

    it('renders nothing for an unmatched path', () => {
        renderContent({ path: '/unknown' });
        expect(screen.queryByText('Home Page')).not.toBeInTheDocument();
        expect(screen.queryByText('Settings Page')).not.toBeInTheDocument();
    });

    it('applies a custom className to the main element', () => {
        const { container } = renderContent({ className: 'my-main-class' });
        expect(container.querySelector('main')).toHaveClass('my-main-class');
    });

    it('renders a main element as the root', () => {
        const { container } = renderContent();
        expect(container.querySelector('main')).toBeInTheDocument();
    });

    it('lets classNameScrollContainer replace the default page padding', () => {
        const { container } = renderContent({ classNameScrollContainer: 'p-0' });
        const scrollContainer = container.querySelector('main > div');
        expect(scrollContainer).toHaveClass('p-0');
        expect(scrollContainer).not.toHaveClass('p-8');
    });

    it('renders a tab strip on a route that declares tabs', () => {
        renderContent({ routes: tabbedRoutes, path: '/explorer/live' });
        expect(screen.getByText('Live')).toBeInTheDocument();
        expect(screen.getByText('Explore')).toBeInTheDocument();
    });

    it('renders no tab strip on a route without tabs', () => {
        const { container } = renderContent({ routes: tabbedRoutes });
        expect(container.querySelector('nav')).not.toBeInTheDocument();
    });

    it('renders only the active tab element', () => {
        renderContent({ routes: tabbedRoutes, path: '/explorer/live' });
        expect(screen.getByText('Live Tab')).toBeInTheDocument();
        expect(screen.queryByText('Explore Tab')).not.toBeInTheDocument();
    });

    it('redirects the bare route path to its first tab', () => {
        renderContent({ routes: tabbedRoutes, path: '/explorer' });
        expect(screen.getByText('Live Tab')).toBeInTheDocument();
    });

    it('redirects an unknown subpath to the first tab', () => {
        renderContent({ routes: tabbedRoutes, path: '/explorer/typo' });
        expect(screen.getByText('Live Tab')).toBeInTheDocument();
    });

    it('applies the parent route transparent background to its tabs', () => {
        const transparentRoute: RouteItem[] = [
            {
                path: '/explorer',
                label: 'Explorer',
                isBackgroundTransparent: true,
                tabs: [{ path: 'live', label: 'Live', element: <div>Live Tab</div> }],
            },
        ];
        const { container } = renderContent({
            routes: transparentRoute,
            path: '/explorer/live',
        });
        expect(container.querySelector('section')).toHaveClass('bg-transparent');
    });

    it('lets a tab override the parent route background setting', () => {
        const mixedRoute: RouteItem[] = [
            {
                path: '/explorer',
                label: 'Explorer',
                isBackgroundTransparent: true,
                tabs: [
                    {
                        path: 'live',
                        label: 'Live',
                        element: <div>Live Tab</div>,
                        isBackgroundTransparent: false,
                    },
                ],
            },
        ];
        const { container } = renderContent({ routes: mixedRoute, path: '/explorer/live' });
        expect(container.querySelector('section')).toHaveClass('bg-white');
    });

    it('merges the parent route container classes into its tabs', () => {
        const styledRoute: RouteItem[] = [
            {
                path: '/explorer',
                label: 'Explorer',
                classNameContainer: 'bg-slate-50',
                tabs: [
                    {
                        path: 'live',
                        label: 'Live',
                        element: <div>Live Tab</div>,
                        classNameContainer: 'p-4',
                    },
                ],
            },
        ];
        const { container } = renderContent({ routes: styledRoute, path: '/explorer/live' });
        expect(container.querySelector('section')).toHaveClass('bg-slate-50', 'p-4');
    });

    it('renders nothing rather than crashing for a route with an empty tabs array', () => {
        const emptyTabs: RouteItem[] = [{ path: '/explorer', label: 'Explorer', tabs: [] }];
        const { container } = renderContent({ routes: emptyTabs, path: '/explorer' });
        expect(container.querySelector('main')).toBeInTheDocument();
        expect(container.querySelector('nav')).not.toBeInTheDocument();
    });

    it('redirects a tabbed route at the root path to its first tab', () => {
        const rootTabbed: RouteItem[] = [
            {
                path: '/',
                label: 'Home',
                tabs: [
                    { path: 'live', label: 'Live', element: <div>Live Tab</div> },
                    { path: 'replay', label: 'Replay', element: <div>Replay Tab</div> },
                ],
            },
        ];
        renderContent({ routes: rootTabbed, path: '/' });
        expect(screen.getByText('Live Tab')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Live' })).toHaveAttribute('href', '/live');
    });

    it('renders a static route that outranks a tabbed route sharing its prefix', () => {
        const overlapping: RouteItem[] = [
            {
                path: '/data',
                label: 'Data',
                tabs: [{ path: 'live', label: 'Live', element: <div>Live Tab</div> }],
            },
            { path: '/data/details', label: 'Details', element: <div>Details Page</div> },
        ];
        const { container } = renderContent({ routes: overlapping, path: '/data/details' });
        expect(screen.getByText('Details Page')).toBeInTheDocument();
        expect(container.querySelector('nav')).not.toBeInTheDocument();
    });

    it('renders the tab strip when a root route precedes the tabbed route', () => {
        const withRootRoute: RouteItem[] = [
            { path: '/', label: 'Home', element: <div>Root Page</div> },
            {
                path: '/explorer',
                label: 'Explorer',
                tabs: [{ path: 'live', label: 'Live', element: <div>Live Tab</div> }],
            },
        ];
        renderContent({ routes: withRootRoute, path: '/explorer/live' });
        expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('applies classNamePageTabs to the tab strip', () => {
        const { container } = renderContent({
            routes: tabbedRoutes,
            path: '/explorer/live',
            classNamePageTabs: 'my-tabs-class',
        });
        expect(container.querySelector('nav')).toHaveClass('my-tabs-class');
    });

    it('applies classNamePageTabsActive and classNamePageTabsInactive to the right tabs', () => {
        renderContent({
            routes: tabbedRoutes,
            path: '/explorer/live',
            classNamePageTabsActive: 'active-tab-class',
            classNamePageTabsInactive: 'inactive-tab-class',
        });
        expect(screen.getByText('Live').closest('a')).toHaveClass('active-tab-class');
        expect(screen.getByText('Explore').closest('a')).toHaveClass('inactive-tab-class');
    });
});
